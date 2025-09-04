import 'mocha';
import {expect} from 'chai';
import {DEFAULT_FALLBACK_LOCALE, Localizer} from './localizer.js';
import {LangObject} from './localizer.js';
import {LocalizerState} from './localizer-state.js';
import {DetectionSource} from './localizer-options.js';
import {LocalizerDictionaries} from './localizer-state.js';

const dictionaries: LocalizerDictionaries = {
  en: {
    greeting: 'Hello',
    greetingWithName: 'Hello, %s!',
    item: {
      one: '%s item',
      many: '%s items',
    },
  },
  ru: {
    greeting: 'Привет',
    greetingWithName: 'Привет, %s!',
    item: {
      one: '%s товар',
      few: '%s товара',
      many: '%s товаров',
    },
  },
  'de-DE': {
    greeting: 'Hallo',
  },
};

/**
 * A test-only subclass to expose protected methods for testing.
 */
class TestLocalizer extends Localizer {
  public testDetectLocale() {
    return this._detectLocale();
  }
  public testFindSupported(
    candidate: string,
    availableLocales: string[],
  ): string | undefined {
    return this._findSupported(candidate, availableLocales);
  }

  public testDetectFromSource(source: DetectionSource): string | undefined {
    return this._detectFromSource(source);
  }
}

/**
 * Utility type to make properties of an object writable for mocking.
 */
type Writable<T> = {-readonly [P in keyof T]: T[P]};

describe('Localizer', function () {
  let originalEnv: NodeJS.ProcessEnv;
  let originalWindowDescriptor: PropertyDescriptor | undefined;
  let originalNavigatorDescriptor: PropertyDescriptor | undefined;
  let originalDocumentDescriptor: PropertyDescriptor | undefined;

  const createLocalStorageMock = (): Partial<Storage> => {
    const store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => (store[key] = String(value)),
    };
  };

  beforeEach(function () {
    originalEnv = {...process.env};
    originalWindowDescriptor = Object.getOwnPropertyDescriptor(
      global,
      'window',
    );
    originalNavigatorDescriptor = Object.getOwnPropertyDescriptor(
      global,
      'navigator',
    );
    originalDocumentDescriptor = Object.getOwnPropertyDescriptor(
      global,
      'document',
    );

    const mockWindow: Partial<Window & typeof globalThis> = {
      location: {pathname: '/', search: ''} as Location,
      localStorage: createLocalStorageMock() as Storage,
    };
    const mockNavigator: Writable<Partial<Navigator>> = {
      languages: [],
    };
    const mockDocument: Partial<Document> = {
      documentElement: {getAttribute: () => null} as unknown as HTMLElement,
    };
    process.env = {};
    Object.defineProperty(global, 'window', {
      value: mockWindow,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(global, 'navigator', {
      value: mockNavigator,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(global, 'document', {
      value: mockDocument,
      writable: true,
      configurable: true,
    });
  });

  afterEach(function () {
    process.env = originalEnv;
    if (originalWindowDescriptor) {
      Object.defineProperty(global, 'window', originalWindowDescriptor);
    }
    if (originalNavigatorDescriptor) {
      Object.defineProperty(global, 'navigator', originalNavigatorDescriptor);
    }
    if (originalDocumentDescriptor) {
      Object.defineProperty(global, 'document', originalDocumentDescriptor);
    }
  });

  describe('constructor', function () {
    it('should create an instance with default state', function () {
      const localizer = new Localizer();
      expect(localizer.state).to.be.instanceOf(LocalizerState);
      expect(localizer.state.options).to.deep.equal({});
      expect(localizer.state.dictionaries).to.deep.equal({});
      expect(localizer.state.currentLocale).to.be.undefined;
    });

    it('should create an instance with provided options', function () {
      const options = {fallbackLocale: 'ru', dictionaries};
      const localizer = new Localizer(options);
      expect(localizer.state.options.fallbackLocale).to.equal('ru');
      expect(localizer.state.dictionaries).to.deep.equal(dictionaries);
    });

    it('should create an instance from an existing state', function () {
      const state = new LocalizerState(
        {fallbackLocale: 'de-DE'},
        dictionaries,
        'ru',
      );
      const localizer = new Localizer(state);
      expect(localizer.state).to.equal(state);
      expect(localizer.getLocale()).to.equal('ru');
    });
  });

  describe('setLocale', function () {
    it('should correctly set the current locale', function () {
      const localizer = new Localizer();
      localizer.setLocale('ru');
      expect(localizer.state.currentLocale).to.equal('ru');
    });

    it('should be chainable', function () {
      const localizer = new Localizer();
      const instance = localizer.setLocale('ru');
      expect(instance).to.equal(localizer);
    });
  });

  describe('getLocale', function () {
    it('should return the currently set locale', function () {
      const localizer = new Localizer();
      localizer.setLocale('ru');
      expect(localizer.getLocale()).to.equal('ru');
    });

    it('should return the fallbackLocale from options if no locale is set', function () {
      const localizer = new Localizer({fallbackLocale: 'ru', dictionaries});
      expect(localizer.getLocale()).to.equal('ru');
    });

    it('should return the default fallback locale "en" if no locale or option is set', function () {
      const localizer = new Localizer();
      expect(localizer.getLocale()).to.equal('en');
    });

    it('should trigger detection and return the detected locale if not set', function () {
      process.env.LANG = 'ru_RU.UTF-8';
      const localizer = new Localizer({
        detectionOrder: ['env'],
        dictionaries,
      });
      expect(localizer.getLocale()).to.equal('ru');
    });
  });

  describe('cloneWithLocale', function () {
    it('should create a new instance with a different locale', function () {
      const original = new Localizer({dictionaries, fallbackLocale: 'en'});
      original.setLocale('en');
      const cloned = original.cloneWithLocale('ru');
      expect(cloned).to.not.equal(original);
      expect(cloned.getLocale()).to.equal('ru');
    });

    it('should preserve options and dictionaries from the original instance', function () {
      const original = new Localizer({dictionaries, fallbackLocale: 'en'});
      const cloned = original.cloneWithLocale('ru');
      expect(cloned.state.options).to.deep.equal(original.state.options);
      expect(cloned.state.dictionaries).to.deep.equal(
        original.state.dictionaries,
      );
    });

    it('should not modify the original instance', function () {
      const original = new Localizer({dictionaries});
      original.setLocale('en');
      original.cloneWithLocale('ru');
      expect(original.getLocale()).to.equal('en');
    });
  });

  describe('addDictionary', function () {
    it('should add a new language dictionary', function () {
      const localizer = new Localizer();
      localizer.addDictionary('fr', {greeting: 'Bonjour'});
      expect(localizer.state.dictionaries.fr).to.deep.equal({
        greeting: 'Bonjour',
      });
    });

    it('should overwrite an existing language dictionary', function () {
      const localizer = new Localizer({dictionaries: {en: {greeting: 'Hi'}}});
      localizer.addDictionary('en', {greeting: 'Hello'});
      expect(localizer.state.dictionaries.en.greeting).to.equal('Hello');
    });

    it('should be chainable', function () {
      const localizer = new Localizer();
      const instance = localizer.addDictionary('fr', {});
      expect(instance).to.equal(localizer);
    });
  });

  describe('_detectFromSource (with browser mocks)', function () {
    it('should extract locale from urlPath source', function () {
      (global.window.location as Writable<Location>).pathname = '/ru/products';
      const localizer = new TestLocalizer();
      const candidate = localizer.testDetectFromSource('urlPath');
      expect(candidate).to.equal('ru');
    });

    it('should extract locale from urlPath source with specified segment', function () {
      (global.window.location as Writable<Location>).pathname = '/products/ru';
      const localizer = new TestLocalizer({lookupUrlPathIndex: 1});
      const candidate = localizer.testDetectFromSource('urlPath');
      expect(candidate).to.equal('ru');
    });

    it('should extract locale from query source', function () {
      (global.window.location as Writable<Location>).search = '?lang=fr';
      const localizer = new TestLocalizer();
      const candidate = localizer.testDetectFromSource('query');
      expect(candidate).to.equal('fr');
    });

    it('should extract locale from query source with specified key', function () {
      (global.window.location as Writable<Location>).search = '?lng=fr';
      const localizer = new TestLocalizer({lookupQueryStringKey: 'lng'});
      const candidate = localizer.testDetectFromSource('query');
      expect(candidate).to.equal('fr');
    });

    it('should extract locale from localStorage source', function () {
      global.window.localStorage.setItem('language', 'it');
      const localizer = new TestLocalizer();
      const candidate = localizer.testDetectFromSource('localStorage');
      expect(candidate).to.equal('it');
    });

    it('should extract locale from localStorage source with specified key', function () {
      global.window.localStorage.setItem('lang', 'it');
      const localizer = new TestLocalizer({lookupLocalStorageKey: 'lang'});
      const candidate = localizer.testDetectFromSource('localStorage');
      expect(candidate).to.equal('it');
    });

    it('should extract locale from navigator source', function () {
      (global.navigator as Writable<Navigator>).languages = ['ja-JP', 'en-US'];
      const localizer = new TestLocalizer();
      const candidate = localizer.testDetectFromSource('navigator');
      expect(candidate).to.equal('ja-JP');
    });

    it('should extract locale from htmlTag source', function () {
      global.document.documentElement.getAttribute = (attr: string) =>
        attr === 'lang' ? 'zh-CN' : null;
      const localizer = new TestLocalizer();
      const candidate = localizer.testDetectFromSource('htmlTag');
      expect(candidate).to.equal('zh-CN');
    });
  });

  describe('_detectLocale', function () {
    it('should detect locale from environment variable', function () {
      process.env.LANG = 'ru-RU';
      const localizer = new TestLocalizer({
        dictionaries,
        detectionOrder: ['env'],
      });
      const detected = localizer.testDetectLocale();
      expect(detected).to.equal('ru');
    });

    it('should detect a locale listed in options.locales even without a dictionary', function () {
      process.env.LANG = 'fr-FR';
      const localizer = new TestLocalizer({
        locales: ['fr', 'en'],
        detectionOrder: ['env'],
      });
      const detected = localizer.testDetectLocale();
      expect(detected).to.equal('fr');
    });

    it('should use fallbackLocale if detection fails', function () {
      const localizer = new TestLocalizer({fallbackLocale: 'de-DE'});
      const detected = localizer.testDetectLocale();
      expect(detected).to.equal('de-DE');
    });

    it('should use fallbackLocale if no dictionary for explicity set locale', function () {
      const localizer = new TestLocalizer({fallbackLocale: 'de-DE'});
      localizer.setLocale('cn');
      const detected = localizer.testDetectLocale();
      expect(detected).to.equal('de-DE');
    });

    it('should use first locale from options instead of fallbackLocale if detection fails', function () {
      const localizer = new TestLocalizer({
        locales: ['fr', 'cn'],
        fallbackLocale: 'de-DE',
      });
      const detected = localizer.testDetectLocale();
      expect(detected).to.equal('fr');
    });

    it('should use the first available locale from dictionaries if detection and fallback fail', function () {
      const localizer = new TestLocalizer({dictionaries, fallbackLocale: 'fr'});
      const detected = localizer.testDetectLocale();
      expect(detected).to.equal('en');
    });

    it('should use the first locale from options.locales as a fallback', function () {
      const localizer = new TestLocalizer({
        locales: ['fr', 'en'],
        dictionaries: {de: {greeting: 'Hallo'}},
        fallbackLocale: 'it',
      });
      const detected = localizer.testDetectLocale();
      expect(detected).to.equal('fr');
    });

    it('should return default fallback locale if no dictionaries or locales are available', function () {
      const localizer = new TestLocalizer();
      const detected = localizer.testDetectLocale();
      expect(detected).to.be.eq(DEFAULT_FALLBACK_LOCALE);
    });
  });

  describe('_findSupported', function () {
    const localizer = new TestLocalizer();
    const available = ['en', 'ru', 'de-DE'];

    it('should find an exact match', function () {
      expect(localizer.testFindSupported('ru', available)).to.equal('ru');
    });

    it('should find a case-insensitive match', function () {
      expect(localizer.testFindSupported('RU', available)).to.equal('ru');
      expect(localizer.testFindSupported('de-de', available)).to.equal('de-DE');
    });

    it('should find a base language for a regional locale (en-US -> en)', function () {
      expect(localizer.testFindSupported('en-US', available)).to.equal('en');
    });
  });

  describe('t', function () {
    const localizer = new Localizer({dictionaries});

    it('should return the translation for the current locale', function () {
      localizer.setLocale('ru');
      expect(localizer.t('greeting')).to.equal('Привет');
    });

    it('should return the key if translation is not found', function () {
      localizer.setLocale('en');
      expect(localizer.t('nonexistent.key')).to.equal('nonexistent.key');
    });

    it('should return the key if the current locale is supported via options.locales but has no dictionary', function () {
      const customLocalizer = new Localizer({locales: ['fr']});
      customLocalizer.setLocale('fr');
      expect(customLocalizer.t('greeting')).to.equal('greeting');
    });

    it('should format placeholders in the translation', function () {
      localizer.setLocale('en');
      expect(localizer.t('greetingWithName', 'World')).to.equal(
        'Hello, World!',
      );
    });

    it('should handle numerable entries for "many"', function () {
      localizer.setLocale('ru');
      expect(localizer.t('item', 5)).to.equal('5 товаров');
    });

    it('should return the translation for the fallback locale if no dictionary for explicitly set locale', function () {
      const localizer = new Localizer({dictionaries, fallbackLocale: 'ru'});
      localizer.setLocale('cn');
      expect(localizer.t('greeting')).to.be.eq('Привет');
    });
  });

  describe('o', function () {
    const localizer = new Localizer({dictionaries, fallbackLocale: 'en'});
    const langObject: LangObject = {
      en: 'Hello',
      ru: 'Привет',
      de: {one: '%s Ding', many: '%s Dinge'},
    };

    it('should return the value for the current locale', function () {
      localizer.setLocale('ru');
      expect(localizer.o(langObject)).to.equal('Привет');
    });

    it('should return the value for the fallback locale if current is not found', function () {
      localizer.setLocale('fr');
      expect(localizer.o(langObject)).to.equal('Hello');
    });

    it('should handle numerable objects correctly', function () {
      localizer.setLocale('de');
      expect(localizer.o(langObject, 5)).to.equal('5 Dinge');
    });
  });
});
