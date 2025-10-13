/* eslint-disable mocha/no-setup-in-describe */
import {expect} from 'chai';
import {IncomingMessage} from 'http';
import {ServiceContainer} from '@e22m4u/js-service';

import {
  Localizer,
  DetectionSource,
  LocalizerDictionaries,
  LocalizerNumerableEntry,
  LOCALIZER_INITIAL_STATE,
} from './localizer.js';

const createMockRequest = (headers: {
  [key: string]: string;
}): IncomingMessage => {
  return {
    headers,
  } as IncomingMessage;
};

const DICTIONARIES: LocalizerDictionaries = {
  en: {
    greeting: 'Hello, %s!',
    item: {
      one: 'You have %s item.',
      few: 'You have %s items.',
      many: 'You have %s items.',
    },
    farewell: 'Goodbye!',
  },
  de: {
    greeting: 'Hallo, %s!',
    farewell: 'Auf Wiedersehen!',
  },
  'pt-BR': {
    greeting: 'Olá, %s!',
  },
  ru: {
    item: {
      one: '%s товар',
      few: '%s товара',
      many: '%s товаров',
    },
  },
};

const AVAILABLE_LOCALES = ['en', 'de', 'pt-BR', 'ru'];

type BrowserMocksOptions = {
  pathname?: string;
  search?: string;
  langAttr?: string | null;
  languages?: readonly string[];
  localStorageValues?: Record<string, string>;
};

const setupBrowserMocks = ({
  pathname = '',
  search = '',
  langAttr = null,
  languages = [],
  localStorageValues = {},
}: BrowserMocksOptions) => {
  const mockWindow = {
    location: {pathname, search},
    localStorage: {
      getItem: (key: string): string | null => localStorageValues[key] ?? null,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    URLSearchParams: (global as any).URLSearchParams,
  };
  const mockDocument = {
    documentElement: {
      getAttribute: (name: string): string | null =>
        name === 'lang' ? langAttr : null,
    },
  };
  const mockNavigator = {
    languages,
  };

  Object.defineProperty(global, 'window', {
    value: mockWindow,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(global, 'document', {
    value: mockDocument,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(global, 'navigator', {
    value: mockNavigator,
    writable: true,
    configurable: true,
  });
};

class OpenLocalizer extends Localizer {
  public publicFindSupportedLocale(
    candidate: string,
    availableLocales: string[],
  ): string | undefined {
    return this.findSupportedLocale(candidate, availableLocales);
  }

  public publicDetectLocaleFromSource(
    availableLocales: string[],
    source: DetectionSource,
  ): string | undefined {
    return this.detectLocaleFromSource(availableLocales, source);
  }

  public publicFormatNumerableEntry(
    entry: LocalizerNumerableEntry,
    args: unknown[],
  ): string {
    return this.formatNumerableEntry(entry, args);
  }

  public publicFormat(pattern: string, ...args: unknown[]): string {
    return this.format(pattern, ...args);
  }
}

describe('Localizer', function () {
  const originalWindow = global.window;
  const originalDocument = global.document;
  const originalNavigator = global.navigator;

  after(function () {
    global.window = originalWindow;
    global.document = originalDocument;
    global.navigator = originalNavigator;
  });

  afterEach(function () {
    delete process.env.LANG;
    delete process.env.LANGUAGE;
    delete process.env.LC_MESSAGES;
    delete process.env.LC_ALL;
  });

  describe('constructor', function () {
    it('should create an instance with default initial state', function () {
      const localizer = new Localizer();
      const state = localizer.getState();
      expect(state).to.be.eql(LOCALIZER_INITIAL_STATE);
    });

    it('should override default state with provided options', function () {
      const options = {
        fallbackLocale: 'fr',
        queryStringKey: 'langue',
      };
      const localizer = new Localizer(options);
      const state = localizer.getState();
      expect(state.fallbackLocale).to.be.eq('fr');
      expect(state.queryStringKey).to.be.eq('langue');
      expect(state.localStorageKey).to.be.eq(
        LOCALIZER_INITIAL_STATE.localStorageKey,
      );
    });
  });

  describe('getState', function () {
    it('should return a deep clone of the current state', function () {
      const localizer = new Localizer({fallbackLocale: 'test'});
      const state = localizer.getState();
      expect(state.fallbackLocale).to.be.eq('test');
    });

    it('should return a copy, not a reference, to prevent mutation', function () {
      const localizer = new Localizer();
      const state = localizer.getState();
      state.fallbackLocale = 'mutated';
      const newState = localizer.getState();
      expect(newState.fallbackLocale).to.be.not.eq('mutated');
      expect(newState.fallbackLocale).to.be.eq(
        LOCALIZER_INITIAL_STATE.fallbackLocale,
      );
    });
  });

  describe('getHttpRequest', function () {
    it('should return the request from the state if it exists', function () {
      const mockReq = createMockRequest({});
      const localizer = new Localizer({httpRequest: mockReq});
      expect(localizer.getHttpRequest()).to.be.eq(mockReq);
    });

    it('should return undefined if no request is in state or service container', function () {
      const localizer = new Localizer();
      expect(localizer.getHttpRequest()).to.be.undefined;
    });

    it('should get the request from the service container if available', function () {
      const container = new ServiceContainer();
      const mockReq = createMockRequest({});
      container.set(IncomingMessage, mockReq);
      const localizer = new Localizer(container as never);
      expect(localizer.getHttpRequest()).to.be.eq(mockReq);
    });
  });

  describe('getLocale', function () {
    it('should return the forced locale if set', function () {
      const localizer = new Localizer({dictionaries: DICTIONARIES});
      localizer.setLocale('de');
      expect(localizer.getLocale()).to.be.eq('de');
    });

    it('should return the detected locale if it is cached', function () {
      const localizer = new Localizer({
        detectedLocale: 'pt-BR',
        dictionaries: DICTIONARIES,
      });
      expect(localizer.getLocale()).to.be.eq('pt-BR');
    });

    it('should run detection if no locale is forced or cached', function () {
      process.env.LANG = 'de_DE.UTF-8';
      const localizer = new Localizer({
        detectionOrder: [DetectionSource.ENV],
        dictionaries: DICTIONARIES,
      });
      expect(localizer.getLocale()).to.be.eq('de');
      expect(localizer.getState().detectedLocale).to.be.eq('de');
    });

    it('should return the fallback locale if detection fails', function () {
      const localizer = new Localizer({
        fallbackLocale: 'de',
        detectionOrder: [],
        dictionaries: DICTIONARIES,
      });
      expect(localizer.getLocale()).to.be.eq('de');
    });
  });

  describe('setLocale', function () {
    it('should set the forcedLocale property in the state', function () {
      const localizer = new Localizer();
      localizer.setLocale('fr');
      expect(localizer.getState().forcedLocale).to.be.eq('fr');
    });

    it('should return the instance for chaining', function () {
      const localizer = new Localizer();
      expect(localizer.setLocale('de')).to.be.eq(localizer);
    });
  });

  describe('resetLocale', function () {
    it('should reset the forcedLocale property to undefined', function () {
      const localizer = new Localizer();
      localizer.setLocale('de');
      localizer.resetLocale();
      expect(localizer.getState().forcedLocale).to.be.undefined;
    });

    it('should return the instance for chaining', function () {
      const localizer = new Localizer();
      expect(localizer.resetLocale()).to.be.eq(localizer);
    });
  });

  describe('clone', function () {
    it('should create a new Localizer instance', function () {
      const original = new Localizer();
      const clone = original.clone();
      expect(clone).to.be.an.instanceOf(Localizer);
      expect(clone).to.be.not.eq(original);
    });

    it('should copy the state of the original instance', function () {
      const original = new Localizer({
        fallbackLocale: 'de',
        dictionaries: DICTIONARIES,
      });
      const clone = original.clone();
      expect(clone.getState()).to.be.eql(original.getState());
    });

    it('should allow overriding options during cloning', function () {
      const original = new Localizer({fallbackLocale: 'de'});
      const clone = original.clone({fallbackLocale: 'fr'});
      expect(original.getState().fallbackLocale).to.be.eq('de');
      expect(clone.getState().fallbackLocale).to.be.eq('fr');
    });
  });

  describe('withLocale', function () {
    it('should create a clone with a specific locale forced', function () {
      const localizer = new Localizer({dictionaries: DICTIONARIES});
      const deLocalizer = localizer.withLocale('de');
      expect(localizer.getState().forcedLocale).to.be.undefined;
      expect(deLocalizer).to.be.an.instanceOf(Localizer);
      expect(deLocalizer.getLocale()).to.be.eq('de');
      expect(deLocalizer.getState().forcedLocale).to.be.eq('de');
    });
  });

  describe('withHttpRequest', function () {
    it('should create a clone with the request and reset detected locale', function () {
      const localizer = new Localizer({
        detectedLocale: 'en',
        detectionOrder: [DetectionSource.REQUEST_HEADER],
        dictionaries: DICTIONARIES,
      });
      const req = createMockRequest({'accept-language': 'de'});
      const reqLocalizer = localizer.withHttpRequest(req);
      expect(reqLocalizer.getState().httpRequest).to.be.eq(req);
      expect(reqLocalizer.getState().detectedLocale).to.be.undefined;
      expect(reqLocalizer.getLocale()).to.be.eq('de');
    });
  });

  describe('getAvailableLocales', function () {
    it('should return a list of locales from the dictionaries', function () {
      const localizer = new Localizer({dictionaries: DICTIONARIES});
      expect(localizer.getAvailableLocales()).to.have.members(
        Object.keys(DICTIONARIES),
      );
    });

    it('should include the forced locale even if it is not in the dictionaries', function () {
      const localizer = new Localizer();
      localizer.setDictionaries({en: {}});
      localizer.setLocale('fr');
      expect(localizer.getAvailableLocales()).to.have.members(['en', 'fr']);
    });

    it('should return an empty array if no dictionaries are set', function () {
      const localizer = new Localizer();
      expect(localizer.getAvailableLocales()).to.be.an('array').that.is.empty;
    });
  });

  describe('getDictionaries', function () {
    it('should return a deep clone of all dictionaries', function () {
      const localizer = new Localizer({dictionaries: DICTIONARIES});
      const dicts = localizer.getDictionaries();
      expect(dicts).to.be.eql(DICTIONARIES);
      dicts.en.greeting = 'Mutated';
      expect(localizer.getDictionary('en').greeting).to.be.not.eq('Mutated');
    });
  });

  describe('getDictionary', function () {
    it('should return a deep clone of a specific locale dictionary', function () {
      const localizer = new Localizer({dictionaries: DICTIONARIES});
      const deDict = localizer.getDictionary('de');
      expect(deDict).to.be.eql(DICTIONARIES.de);
      deDict.farewell = 'Mutated';
      expect(localizer.getDictionary('de').farewell).to.be.eq(
        'Auf Wiedersehen!',
      );
    });

    it('should return an empty object for a non-existent locale', function () {
      const localizer = new Localizer({dictionaries: DICTIONARIES});
      expect(localizer.getDictionary('fr')).to.be.eql({});
    });
  });

  describe('setDictionaries', function () {
    it('should replace all existing dictionaries', function () {
      const localizer = new Localizer();
      localizer.setDictionaries({en: {a: '1'}});
      localizer.setDictionaries({de: {b: '2'}});
      expect(localizer.getDictionaries()).to.be.eql({de: {b: '2'}});
    });

    it('should reset the detected locale', function () {
      const localizer = new Localizer({detectedLocale: 'en'});
      localizer.setDictionaries({de: {}});
      expect(localizer.getState().detectedLocale).to.be.undefined;
    });

    it('should return the instance for chaining', function () {
      const localizer = new Localizer();
      expect(localizer.setDictionaries({})).to.be.eq(localizer);
    });
  });

  describe('setDictionary', function () {
    it('should add a dictionary for a new locale', function () {
      const localizer = new Localizer();
      localizer.setDictionary('fr', {c: '3'});
      expect(localizer.getDictionary('fr')).to.be.eql({c: '3'});
    });

    it('should overwrite an existing dictionary for a locale', function () {
      const localizer = new Localizer({dictionaries: {en: {a: '1'}}});
      localizer.setDictionary('en', {b: '2'});
      expect(localizer.getDictionary('en')).to.be.eql({b: '2'});
    });

    it('should reset the detected locale', function () {
      const localizer = new Localizer({detectedLocale: 'en'});
      localizer.setDictionary('de', {});
      expect(localizer.getState().detectedLocale).to.be.undefined;
    });
  });

  describe('addDictionaries', function () {
    it('should deep merge new dictionaries with existing ones', function () {
      const localizer = new Localizer({
        dictionaries: {en: {greeting: 'Hi', nested: {one: 'one'}}},
      });
      localizer.addDictionaries({
        en: {farewell: 'Bye', nested: {few: 'few'}},
        de: {greeting: 'Hallo'},
      });
      expect(localizer.getDictionaries()).to.be.eql({
        en: {
          greeting: 'Hi',
          farewell: 'Bye',
          nested: {one: 'one', few: 'few'},
        },
        de: {
          greeting: 'Hallo',
        },
      });
    });

    it('should reset the detected locale', function () {
      const localizer = new Localizer({detectedLocale: 'en'});
      localizer.addDictionaries({de: {}});
      expect(localizer.getState().detectedLocale).to.be.undefined;
    });
  });

  describe('addDictionary', function () {
    it('should deep merge a dictionary for a specific locale', function () {
      const localizer = new Localizer();
      localizer.setDictionary('en', {foo: 'foo', nested: {one: 'one'}});
      localizer.addDictionary('en', {bar: 'bar', nested: {many: 'many'}});
      expect(localizer.getDictionary('en')).to.be.eql({
        foo: 'foo',
        bar: 'bar',
        nested: {one: 'one', many: 'many'},
      });
    });

    it('should create the locale if it does not exist', function () {
      const localizer = new Localizer();
      localizer.addDictionary('fr', {salut: 'Hi'});
      expect(localizer.getDictionary('fr')).to.be.eql({salut: 'Hi'});
    });

    it('should reset the detected locale', function () {
      const localizer = new Localizer({detectedLocale: 'en'});
      localizer.addDictionary('de', {});
      expect(localizer.getState().detectedLocale).to.be.undefined;
    });
  });

  describe('detectLocale', function () {
    it('should find and return the best-matching locale', function () {
      setupBrowserMocks({search: '?lang=de'});
      const localizer = new Localizer({
        detectionOrder: [DetectionSource.QUERY],
        dictionaries: DICTIONARIES,
      });
      expect(localizer.detectLocale()).to.be.eq('de');
    });

    it('should update the internal detectedLocale state', function () {
      setupBrowserMocks({search: '?lang=de'});
      const localizer = new Localizer({
        detectionOrder: [DetectionSource.QUERY],
        dictionaries: DICTIONARIES,
      });
      localizer.detectLocale();
      expect(localizer.getState().detectedLocale).to.be.eq('de');
    });

    it('should not reset the forced locale if noResetLocale is true', function () {
      const localizer = new Localizer();
      localizer.setLocale('de');
      localizer.detectLocale(true); // noResetLocale = true
      expect(localizer.getState().forcedLocale).to.be.eq('de');
    });

    it('should reset the forced locale if noResetLocale is falsy (default)', function () {
      const localizer = new Localizer();
      localizer.setLocale('de');
      localizer.detectLocale(); // noResetLocale = undefined
      expect(localizer.getState().forcedLocale).to.be.undefined;
    });

    it('should fall back to the first available locale if fallback is not available', function () {
      const localizer = new Localizer({
        fallbackLocale: 'fr',
        detectionOrder: [],
        dictionaries: {de: {}, en: {}},
      });
      expect(localizer.detectLocale()).to.be.eq('de');
    });
  });

  describe('t (translate)', function () {
    it('should translate a simple key for the current locale', function () {
      const localizer = new Localizer({dictionaries: DICTIONARIES});
      localizer.setLocale('de');
      expect(localizer.t('farewell')).to.be.eq('Auf Wiedersehen!');
    });

    it('should format the translated string with arguments', function () {
      const localizer = new Localizer({dictionaries: DICTIONARIES});
      localizer.setLocale('en');
      expect(localizer.t('greeting', 'Alice')).to.be.eq('Hello, Alice!');
    });

    it('should fall back to the fallback locale if a key is missing', function () {
      const localizer = new Localizer({
        fallbackLocale: 'en',
        dictionaries: DICTIONARIES,
      });
      localizer.setLocale('de'); // 'item' key is missing in 'de'
      expect(localizer.t('item', 1)).to.be.eq('You have 1 item.');
    });

    it('should return the key itself if not found in any dictionary', function () {
      const localizer = new Localizer({dictionaries: DICTIONARIES});
      expect(localizer.t('nonexistent.key')).to.be.eq('nonexistent.key');
    });

    it('should handle English pluralization correctly', function () {
      const localizer = new Localizer({dictionaries: DICTIONARIES});
      localizer.setLocale('en');
      expect(localizer.t('item', 1)).to.be.eq('You have 1 item.');
      expect(localizer.t('item', 0)).to.be.eq('You have 0 items.');
      expect(localizer.t('item', 5)).to.be.eq('You have 5 items.');
    });

    it('should handle Russian pluralization correctly', function () {
      const localizer = new Localizer({dictionaries: DICTIONARIES});
      localizer.setLocale('ru');
      expect(localizer.t('item', 1)).to.be.eq('1 товар');
      expect(localizer.t('item', 2)).to.be.eq('2 товара');
      expect(localizer.t('item', 5)).to.be.eq('5 товаров');
      expect(localizer.t('item', 21)).to.be.eq('21 товар');
    });

    it('should return the key if the entry is not a string or object', function () {
      const localizer = new Localizer();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      localizer.setDictionary('en', {bad_entry: 123});
      expect(localizer.t('bad_entry')).to.be.eq('bad_entry');
    });
  });

  describe('o (object translate)', function () {
    const langObj = {
      en: 'English Title',
      de: 'Deutscher Titel',
      ru: {
        one: '%s заголовок',
        many: '%s заголовков',
      },
    };

    it('should pick the string for the current locale', function () {
      const localizer = new Localizer();
      localizer.setLocale('de');
      expect(localizer.o(langObj)).to.be.eq('Deutscher Titel');
    });

    it('should fall back to the fallback locale', function () {
      const localizer = new Localizer({fallbackLocale: 'en'});
      localizer.setLocale('fr');
      expect(localizer.o(langObj)).to.be.eq('English Title');
    });

    it('should fall back to the first available key if current and fallback are missing', function () {
      const localizer = new Localizer({fallbackLocale: 'es'});
      localizer.setLocale('fr');
      expect(localizer.o(langObj)).to.be.eq('English Title');
    });

    it('should handle pluralization from an object entry', function () {
      const localizer = new Localizer();
      localizer.setLocale('ru');
      expect(localizer.o(langObj, 1)).to.be.eq('1 заголовок');
      expect(localizer.o(langObj, 5)).to.be.eq('5 заголовков');
    });

    it('should return an empty string if the object is empty or no valid entry is found', function () {
      const localizer = new Localizer();
      expect(localizer.o({})).to.be.eq('');
      const badObj = {en: undefined, de: null};
      expect(localizer.o(badObj as never)).to.be.eq('');
    });
  });

  describe('findSupportedLocale (protected)', function () {
    it('should find an exact match, case-insensitively', function () {
      const localizer = new OpenLocalizer();
      expect(
        localizer.publicFindSupportedLocale('de', AVAILABLE_LOCALES),
      ).to.be.eq('de');
      expect(
        localizer.publicFindSupportedLocale('PT-br', AVAILABLE_LOCALES),
      ).to.be.eq('pt-BR');
    });

    it('should find a base language match from a regional candidate', function () {
      const localizer = new OpenLocalizer();
      expect(
        localizer.publicFindSupportedLocale('en-US', AVAILABLE_LOCALES),
      ).to.be.eq('en');
      expect(
        localizer.publicFindSupportedLocale('en_GB', AVAILABLE_LOCALES),
      ).to.be.eq('en');
    });

    it('should correctly parse a complex accept-language header string', function () {
      const localizer = new OpenLocalizer();
      const header = 'de-DE,de;q=0.9,en-US;q=0.8';
      expect(
        localizer.publicFindSupportedLocale(header, ['en', 'de']),
      ).to.be.eq('de');
    });

    it('should return undefined if no match is found', function () {
      const localizer = new OpenLocalizer();
      expect(localizer.publicFindSupportedLocale('fr', AVAILABLE_LOCALES)).to.be
        .undefined;
    });
  });

  describe('detectLocaleFromSource (protected)', function () {
    it('should return undefined for browser sources in Node.js environment', function () {
      const localizer = new OpenLocalizer();
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      expect(
        localizer.publicDetectLocaleFromSource(
          AVAILABLE_LOCALES,
          DetectionSource.URL_PATH,
        ),
      ).to.be.undefined;
      expect(
        localizer.publicDetectLocaleFromSource(
          AVAILABLE_LOCALES,
          DetectionSource.QUERY,
        ),
      ).to.be.undefined;
    });

    context('in Node.js environment', function () {
      it('should detect from REQUEST_HEADER', function () {
        const localizer = new OpenLocalizer({
          httpRequest: createMockRequest({'accept-language': 'de,en;q=0.9'}),
        });
        expect(
          localizer.publicDetectLocaleFromSource(
            AVAILABLE_LOCALES,
            DetectionSource.REQUEST_HEADER,
          ),
        ).to.be.eq('de');
      });

      it('should detect from ENV (LANG)', function () {
        process.env.LANG = 'de_DE.UTF-8';
        const localizer = new OpenLocalizer();
        expect(
          localizer.publicDetectLocaleFromSource(
            AVAILABLE_LOCALES,
            DetectionSource.ENV,
          ),
        ).to.be.eq('de');
      });
    });

    context('in a mocked browser environment', function () {
      it('should detect from URL_PATH', function () {
        setupBrowserMocks({pathname: '/api/v1/en/data'});
        const localizer = new OpenLocalizer({urlPathIndex: 2});
        expect(
          localizer.publicDetectLocaleFromSource(
            AVAILABLE_LOCALES,
            DetectionSource.URL_PATH,
          ),
        ).to.be.eq('en');
      });

      it('should detect from QUERY', function () {
        setupBrowserMocks({search: '?lang=pt-BR'});
        const localizer = new OpenLocalizer();
        expect(
          localizer.publicDetectLocaleFromSource(
            AVAILABLE_LOCALES,
            DetectionSource.QUERY,
          ),
        ).to.be.eq('pt-BR');
      });

      it('should detect from LOCAL_STORAGE', function () {
        setupBrowserMocks({localStorageValues: {language: 'de'}});
        const localizer = new OpenLocalizer();
        expect(
          localizer.publicDetectLocaleFromSource(
            AVAILABLE_LOCALES,
            DetectionSource.LOCAL_STORAGE,
          ),
        ).to.be.eq('de');
      });

      it('should detect from HTML_TAG', function () {
        setupBrowserMocks({langAttr: 'de'});
        const localizer = new OpenLocalizer();
        expect(
          localizer.publicDetectLocaleFromSource(
            AVAILABLE_LOCALES,
            DetectionSource.HTML_TAG,
          ),
        ).to.be.eq('de');
      });

      it('should detect from NAVIGATOR', function () {
        setupBrowserMocks({languages: ['de-CH', 'en-US']});
        const localizer = new OpenLocalizer();
        expect(
          localizer.publicDetectLocaleFromSource(
            AVAILABLE_LOCALES,
            DetectionSource.NAVIGATOR,
          ),
        ).to.be.eq('de');
      });
    });
  });

  describe('formatNumerableEntry (protected)', function () {
    it('should select the correct plural form and format it', function () {
      const localizer = new OpenLocalizer();
      const entry: LocalizerNumerableEntry = {
        one: '%s item',
        few: '%s items (few)',
        many: '%s items (many)',
      };
      expect(localizer.publicFormatNumerableEntry(entry, [1])).to.be.eq(
        '1 item',
      );
      expect(localizer.publicFormatNumerableEntry(entry, [5])).to.be.eq(
        '5 items (many)',
      );
    });

    it('should use the first available form if no number is provided', function () {
      const localizer = new OpenLocalizer();
      const entry: LocalizerNumerableEntry = {
        one: 'One',
        few: 'Few',
        many: 'Many',
      };
      expect(localizer.publicFormatNumerableEntry(entry, [])).to.be.eq('One');
      const entryWithoutOne: LocalizerNumerableEntry = {
        few: 'Few',
        many: 'Many',
      };
      expect(
        localizer.publicFormatNumerableEntry(entryWithoutOne, []),
      ).to.be.eq('Few');
    });

    it('should return an empty string if the entry is empty', function () {
      const localizer = new OpenLocalizer();
      expect(localizer.publicFormatNumerableEntry({}, [5])).to.be.eq('');
    });
  });

  describe('format (protected)', function () {
    it('should format a string with placeholders', function () {
      const localizer = new OpenLocalizer();
      expect(localizer.publicFormat('Hello, %s!', 'World')).to.be.eq(
        'Hello, World!',
      );
    });

    it('should return the pattern as is if no placeholders are present', function () {
      const localizer = new OpenLocalizer();
      expect(localizer.publicFormat('Hello, World!', 'ignored')).to.be.eq(
        'Hello, World!',
      );
    });
  });
});
