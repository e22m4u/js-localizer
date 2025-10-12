/* eslint-disable mocha/no-setup-in-describe */
import {expect} from 'chai';
import {IncomingMessage} from 'http';

import {
  Localizer,
  DetectionSource,
  LocalizerDictionaries,
  LOCALIZER_ROOT_NAMESPACE,
  DEFAULT_LOCALIZER_OPTIONS,
  DEFAULT_FALLBACK_LOCALE,
  LocalizerNumerableEntry,
} from './localizer.js';

const createMockRequest = (headers: {
  [key: string]: string;
}): IncomingMessage => {
  return {
    headers,
  } as IncomingMessage;
};

const ROOT_DICTIONARIES: LocalizerDictionaries = {
  en: {
    greeting: 'Hello, %s!',
    item: {
      one: 'You have %s item.',
      few: 'You have %s items.',
      many: 'You have %s items.',
    },
  },
  de: {
    greeting: 'Hallo, %s!',
    farewell: 'Auf Wiedersehen!',
  },
  'pt-BR': {
    greeting: 'Olá, %s!',
  },
};

const ADMIN_DICTIONARIES: LocalizerDictionaries = {
  en: {
    dashboard: 'Dashboard',
  },
  de: {
    dashboard: 'Instrumententafel',
  },
};

const AVAILABLE_LOCALES = ['en', 'de', 'pt-BR'];

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
      getItem: (key: string) => localStorageValues[key] || null,
    },
    URLSearchParams: URLSearchParams,
  };
  const mockDocument = {
    documentElement: {
      getAttribute: (name: string) => (name === 'lang' ? langAttr : null),
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
  ): string | undefined {
    return this.formatNumerableEntry(entry, args);
  }
}

describe('Localizer', function () {
  describe('constructor', function () {
    it('should create an instance with default options', function () {
      const localizer = new Localizer();
      expect(localizer.options).to.be.eql(DEFAULT_LOCALIZER_OPTIONS);
    });

    it('should override default options with provided options', function () {
      const localizer = new Localizer({
        fallbackLocale: 'fr',
        queryStringKey: 'langue',
      });
      expect(localizer.options.fallbackLocale).to.be.eq('fr');
      expect(localizer.options.queryStringKey).to.be.eq('langue');
    });

    it('should ignore empty or undefined values in provided options', function () {
      const localizer = new Localizer({fallbackLocale: undefined});
      expect(localizer.options.fallbackLocale).to.be.eq(
        DEFAULT_FALLBACK_LOCALE,
      );
    });
  });

  describe('getNamespace', function () {
    it('should return undefined when no namespace is set', function () {
      const localizer = new Localizer();
      expect(localizer.getNamespace()).to.be.undefined;
    });

    it('should return the correct namespace when it is set', function () {
      const localizer = new Localizer({namespace: 'admin'});
      expect(localizer.getNamespace()).to.be.eq('admin');
    });
  });

  describe('getLocale', function () {
    let localizer: Localizer;

    beforeEach(function () {
      localizer = new Localizer();
      localizer.setDictionaries(ROOT_DICTIONARIES);
    });

    it('should return the forced locale if set', function () {
      localizer.forceLocale('de');
      expect(localizer.getLocale()).to.be.eq('de');
    });

    it('should return the fallback locale if no locale is detected and no dictionaries are present', function () {
      const emptyLocalizer = new Localizer({fallbackLocale: 'fr'});
      expect(emptyLocalizer.getLocale()).to.be.eq('fr');
    });

    it('should detect locale if not already detected or forced (mocking env)', function () {
      process.env.LANG = 'de_DE.UTF-8';
      const envLocalizer = new Localizer({
        detectionOrder: [DetectionSource.ENV],
      });
      envLocalizer.setDictionaries(ROOT_DICTIONARIES);
      expect(envLocalizer.getLocale()).to.be.eq('de');
      delete process.env.LANG;
    });

    it('should return the first available locale if fallback is not available', function () {
      const customFallbackLocalizer = new Localizer({fallbackLocale: 'fr'});
      customFallbackLocalizer.setDictionaries({
        es: {hello: 'Hola'},
        it: {hello: 'Ciao'},
      });
      // 'es' is the first key in the object
      expect(customFallbackLocalizer.getLocale()).to.be.eq('es');
    });
  });

  describe('forceLocale and resetForcedLocale', function () {
    it('should allow forcing a locale and then resetting it', function () {
      const localizer = new Localizer();
      localizer.setDictionaries(ROOT_DICTIONARIES);
      localizer.forceLocale('de');
      expect(localizer.getLocale()).to.be.eq('de');
      expect(localizer.t('greeting', 'World')).to.be.eq('Hallo, World!');

      localizer.resetForcedLocale();
      // Should fall back to default 'en' after reset
      expect(localizer.getLocale()).to.be.eq('en');
      expect(localizer.t('greeting', 'World')).to.be.eq('Hello, World!');
    });
  });

  describe('clone', function () {
    let localizer: Localizer;

    beforeEach(function () {
      localizer = new Localizer({fallbackLocale: 'de'});
      localizer.setDictionaries(ROOT_DICTIONARIES);
      localizer.forceLocale('de');
    });

    it('should create a new instance with the same properties', function () {
      const clone = localizer.clone();
      expect(clone).to.be.an.instanceOf(Localizer);
      expect(clone).to.not.equal(localizer);
      expect(clone.getLocale()).to.be.eq('de');
      expect(clone.options.fallbackLocale).to.be.eq('de');
      expect(clone.t('farewell')).to.be.eq('Auf Wiedersehen!');
    });

    it('should allow overriding options during cloning', function () {
      const clone = localizer.clone({fallbackLocale: 'en'});
      expect(clone.options.fallbackLocale).to.be.eq('en');
      // The forced locale is still preserved from the original
      expect(clone.getLocale()).to.be.eq('de');
    });
  });

  describe('cloneWithLocale', function () {
    it('should create a clone with a specific locale forced', function () {
      const localizer = new Localizer();
      localizer.setDictionaries(ROOT_DICTIONARIES);

      const deLocalizer = localizer.cloneWithLocale('de');
      expect(deLocalizer.getLocale()).to.be.eq('de');
      expect(deLocalizer.t('greeting', 'Welt')).to.be.eq('Hallo, Welt!');

      const enLocalizer = localizer.cloneWithLocale('en');
      expect(enLocalizer.getLocale()).to.be.eq('en');
      expect(enLocalizer.t('greeting', 'World')).to.be.eq('Hello, World!');
    });
  });

  describe('cloneWithRequest', function () {
    it('should create a clone and detect locale from the request header', function () {
      const localizer = new Localizer({
        detectionOrder: [DetectionSource.REQUEST_HEADER],
      });
      localizer.setDictionaries(ROOT_DICTIONARIES);
      const req = createMockRequest({
        'accept-language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
      });
      const reqLocalizer = localizer.cloneWithRequest(req);
      expect(reqLocalizer.getLocale()).to.be.eq('de');
      expect(reqLocalizer.t('farewell')).to.be.eq('Auf Wiedersehen!');
    });

    it('should reset a forced locale when cloning with a request', function () {
      const localizer = new Localizer({
        detectionOrder: [DetectionSource.REQUEST_HEADER],
      });
      localizer.setDictionaries(ROOT_DICTIONARIES);
      localizer.forceLocale('en');
      const req = createMockRequest({'accept-language': 'de'});
      const reqLocalizer = localizer.cloneWithRequest(req);
      expect(reqLocalizer.getLocale()).to.be.eq('de');
    });
  });

  describe('cloneWithNamespace', function () {
    it('should create a clone with a new namespace', function () {
      const localizer = new Localizer();
      localizer.setDictionaries('admin', ADMIN_DICTIONARIES);

      const adminLocalizer = localizer.cloneWithNamespace('admin');
      expect(adminLocalizer.getNamespace()).to.be.eq('admin');
      expect(adminLocalizer.t('dashboard')).to.be.eq('Dashboard');
    });
  });

  describe('getAvailableLocales', function () {
    it('should return locales from the root namespace', function () {
      const localizer = new Localizer();
      localizer.setDictionaries(ROOT_DICTIONARIES);
      expect(localizer.getAvailableLocales()).to.have.members([
        'en',
        'de',
        'pt-BR',
      ]);
    });

    it('should return locales from a specific namespace, merged with root', function () {
      const localizer = new Localizer({namespace: 'admin'});
      localizer.setDictionaries(ROOT_DICTIONARIES);
      localizer.setDictionaries('admin', {de: {}, fr: {}});
      expect(localizer.getAvailableLocales()).to.have.members([
        'en',
        'de',
        'pt-BR',
        'fr',
      ]);
    });
  });

  describe('getDictionaries', function () {
    it('should get dictionaries from the root namespace by default', function () {
      const localizer = new Localizer();
      localizer.setDictionaries(ROOT_DICTIONARIES);
      expect(localizer.getDictionaries()).to.be.eql(ROOT_DICTIONARIES);
    });

    it('should get dictionaries from a specified namespace', function () {
      const localizer = new Localizer();
      localizer.setDictionaries('admin', ADMIN_DICTIONARIES);
      expect(localizer.getDictionaries('admin')).to.be.eql(ADMIN_DICTIONARIES);
    });

    it('should return an empty object for a namespace with no dictionaries', function () {
      const localizer = new Localizer();
      expect(localizer.getDictionaries('nonexistent')).to.be.eql({});
    });

    it('should get root dictionaries when the root namespace is explicitly requested', function () {
      const localizer = new Localizer();
      localizer.setDictionaries(ROOT_DICTIONARIES);
      expect(localizer.getDictionaries(LOCALIZER_ROOT_NAMESPACE)).to.be.eql(
        ROOT_DICTIONARIES,
      );
    });
  });

  describe('getDictionary', function () {
    it('should get a dictionary for a locale from the root namespace', function () {
      const localizer = new Localizer();
      localizer.setDictionaries(ROOT_DICTIONARIES);
      expect(localizer.getDictionary('de')).to.be.eql(ROOT_DICTIONARIES.de);
    });

    it('should get a dictionary for a locale from a specific namespace', function () {
      const localizer = new Localizer();
      localizer.setDictionaries('admin', ADMIN_DICTIONARIES);
      expect(localizer.getDictionary('admin', 'de')).to.be.eql(
        ADMIN_DICTIONARIES.de,
      );
    });

    it('should return an empty object if the locale does not exist in the namespace', function () {
      const localizer = new Localizer();
      localizer.setDictionaries(ROOT_DICTIONARIES);
      expect(localizer.getDictionary('fr')).to.be.eql({});
    });

    it('should return an empty object if the namespace does not exist', function () {
      const localizer = new Localizer();
      expect(localizer.getDictionary('nonexistent', 'en')).to.be.eql({});
    });
  });

  describe('setDictionaries', function () {
    it('should set dictionaries for the root namespace', function () {
      const localizer = new Localizer();
      localizer.setDictionaries(ROOT_DICTIONARIES);
      expect(localizer.getDictionaries()).to.be.eql(ROOT_DICTIONARIES);
    });

    it('should set dictionaries for a specific namespace', function () {
      const localizer = new Localizer();
      localizer.setDictionaries('admin', ADMIN_DICTIONARIES);
      expect(localizer.getDictionaries('admin')).to.be.eql(ADMIN_DICTIONARIES);
      expect(localizer.getDictionaries()).to.be.eql({});
    });

    it('should overwrite any existing dictionaries for the given namespace', function () {
      const localizer = new Localizer();
      localizer.setDictionaries({en: {greeting: 'Hi'}});
      const newDictionaries = {
        en: {greeting: 'Hello'},
        de: {greeting: 'Hallo'},
      };
      localizer.setDictionaries(newDictionaries);
      expect(localizer.getDictionaries()).to.be.eql(newDictionaries);
    });

    it('should return the localizer instance for chaining', function () {
      const localizer = new Localizer();
      const instance = localizer.setDictionaries(ROOT_DICTIONARIES);
      expect(instance).to.be.eq(localizer);
    });
  });

  describe('setDictionary', function () {
    it('should set a dictionary for a specific locale in the root namespace', function () {
      const localizer = new Localizer();
      const enDict = {greeting: 'Hello'};
      localizer.setDictionary('en', enDict);
      expect(localizer.getDictionary('en')).to.be.eql(enDict);
    });

    it('should set a dictionary for a specific locale in a given namespace', function () {
      const localizer = new Localizer();
      const deDict = {dashboard: 'Instrumententafel'};
      localizer.setDictionary('admin', 'de', deDict);
      expect(localizer.getDictionary('admin', 'de')).to.be.eql(deDict);
      expect(localizer.getDictionary('de')).to.be.eql({});
    });

    it('should overwrite an existing dictionary for the same locale', function () {
      const localizer = new Localizer();
      const initialDict = {greeting: 'Hi'};
      const newDict = {greeting: 'Hello, World!'};
      localizer.setDictionary('en', initialDict);
      localizer.setDictionary('en', newDict);
      expect(localizer.getDictionary('en')).to.be.eql(newDict);
    });

    it('should return the localizer instance for chaining', function () {
      const localizer = new Localizer();
      const instance = localizer.setDictionary('en', {greeting: 'Hello'});
      expect(instance).to.be.eq(localizer);
    });
  });

  describe('addDictionaries', function () {
    it('should add new locales to the root namespace without overwriting existing ones', function () {
      const localizer = new Localizer();
      const initialDict = {en: {greeting: 'Hello'}};
      const additionalDict = {de: {greeting: 'Hallo'}};
      localizer.setDictionaries(initialDict);
      localizer.addDictionaries(additionalDict);
      expect(localizer.getDictionaries()).to.be.eql({
        ...initialDict,
        ...additionalDict,
      });
    });

    it('should merge dictionaries for existing locales in the root namespace', function () {
      const localizer = new Localizer();
      const initialEnDict = {greeting: 'Hello'};
      const additionalEnDict = {farewell: 'Goodbye'};
      localizer.setDictionaries({en: initialEnDict});
      localizer.addDictionaries({en: additionalEnDict});
      expect(localizer.getDictionary('en')).to.be.eql({
        ...initialEnDict,
        ...additionalEnDict,
      });
    });

    it('should merge dictionaries for a specific namespace', function () {
      const localizer = new Localizer();
      localizer.setDictionaries('admin', {en: {a: '1'}});
      localizer.addDictionaries('admin', {en: {b: '2'}, de: {c: '3'}});
      expect(localizer.getDictionary('admin', 'en')).to.be.eql({
        a: '1',
        b: '2',
      });
      expect(localizer.getDictionary('admin', 'de')).to.be.eql({c: '3'});
    });

    it('should return the localizer instance for chaining', function () {
      const localizer = new Localizer();
      const instance = localizer.addDictionaries({en: {greeting: 'Hello'}});
      expect(instance).to.be.eq(localizer);
    });
  });

  describe('addDictionary', function () {
    it('should add a dictionary for a new locale in the root namespace', function () {
      const localizer = new Localizer();
      const enDict = {greeting: 'Hello'};
      localizer.addDictionary('en', enDict);
      expect(localizer.getDictionary('en')).to.be.eql(enDict);
    });

    it('should merge with an existing dictionary for a locale in the root namespace', function () {
      const localizer = new Localizer();
      const initialEnDict = {greeting: 'Hello'};
      const additionalEnDict = {farewell: 'Goodbye'};
      localizer.setDictionary('en', initialEnDict);
      localizer.addDictionary('en', additionalEnDict);
      expect(localizer.getDictionary('en')).to.be.eql({
        ...initialEnDict,
        ...additionalEnDict,
      });
    });

    it('should merge with an existing dictionary for a locale in a specific namespace', function () {
      const localizer = new Localizer();
      const initialEnDict = {dashboard: 'Dashboard'};
      const additionalEnDict = {settings: 'Settings'};
      localizer.setDictionary('admin', 'en', initialEnDict);
      localizer.addDictionary('admin', 'en', additionalEnDict);
      expect(localizer.getDictionary('admin', 'en')).to.be.eql({
        ...initialEnDict,
        ...additionalEnDict,
      });
    });

    it('should return the localizer instance for chaining', function () {
      const localizer = new Localizer();
      const instance = localizer.addDictionary('en', {greeting: 'Hello'});
      expect(instance).to.be.eq(localizer);
    });
  });

  describe('detectLocale', function () {
    afterEach(function () {
      delete process.env.LANG;
    });

    it('should detect a locale based on the detection order and return it', function () {
      process.env.LANG = 'de-DE';
      const localizer = new Localizer({
        detectionOrder: [DetectionSource.ENV],
      });
      localizer.setDictionaries(ROOT_DICTIONARIES);
      const detected = localizer.detectLocale();
      expect(detected).to.be.eq('de');
    });

    it('should update the internal detectedLocale property, which getLocale uses', function () {
      process.env.LANG = 'de-DE';
      const localizer = new Localizer({
        detectionOrder: [DetectionSource.ENV],
      });
      localizer.setDictionaries(ROOT_DICTIONARIES);
      localizer.detectLocale();
      expect(localizer.getLocale()).to.be.eq('de');
    });

    it('should return the fallbackLocale if no locale is detected and it is available', function () {
      const localizer = new Localizer({
        fallbackLocale: 'de',
        detectionOrder: [DetectionSource.URL_PATH, DetectionSource.QUERY],
      });
      localizer.setDictionaries(ROOT_DICTIONARIES);
      const detected = localizer.detectLocale();
      expect(detected).to.be.eq('de');
    });

    it('should return the first available locale if no locale is detected and the fallback is not available', function () {
      const localizer = new Localizer({
        fallbackLocale: 'fr',
        detectionOrder: [],
      });
      localizer.setDictionaries({
        de: {a: 'a'},
        en: {b: 'b'},
      });
      const detected = localizer.detectLocale();
      expect(detected).to.be.eq('de');
    });

    it('should return the fallbackLocale if no dictionaries are set at all', function () {
      const localizer = new Localizer({
        fallbackLocale: 'fr',
        detectionOrder: [DetectionSource.ENV],
      });
      const detected = localizer.detectLocale();
      expect(detected).to.be.eq('fr');
    });

    it('should not reset a forced locale by default', function () {
      process.env.LANG = 'en-US';
      const localizer = new Localizer({
        detectionOrder: [DetectionSource.ENV],
      });
      localizer.setDictionaries(ROOT_DICTIONARIES);
      localizer.forceLocale('de');
      localizer.detectLocale();
      expect(localizer.getLocale()).to.be.eq('de');
    });

    it('should reset a forced locale when the resetForcedLocale parameter is true', function () {
      process.env.LANG = 'en-US';
      const localizer = new Localizer({
        detectionOrder: [DetectionSource.ENV],
      });
      localizer.setDictionaries(ROOT_DICTIONARIES);
      localizer.forceLocale('de');
      localizer.detectLocale(true);
      expect(localizer.getLocale()).to.be.eq('en');
    });

    it('should be re-triggered automatically when dictionaries are changed', function () {
      process.env.LANG = 'de-DE';
      const localizer = new Localizer({
        detectionOrder: [DetectionSource.ENV],
      });
      expect(localizer.getLocale()).to.be.eq(DEFAULT_FALLBACK_LOCALE);
      localizer.setDictionaries(ROOT_DICTIONARIES);
      expect(localizer.getLocale()).to.be.eq('de');
    });
  });

  describe('findSupportedLocale', function () {
    it('should find an exact match', function () {
      const localizer = new OpenLocalizer();
      const result = localizer.publicFindSupportedLocale(
        'de',
        AVAILABLE_LOCALES,
      );
      expect(result).to.be.eq('de');
    });

    it('should find an exact match case-insensitively', function () {
      const localizer = new OpenLocalizer();
      const result = localizer.publicFindSupportedLocale(
        'PT-br',
        AVAILABLE_LOCALES,
      );
      expect(result).to.be.eq('pt-BR');
    });

    it('should find a base language match from a regional candidate', function () {
      const localizer = new OpenLocalizer();
      const result = localizer.publicFindSupportedLocale(
        'en-US',
        AVAILABLE_LOCALES,
      );
      expect(result).to.be.eq('en');
    });

    it('should find a base language match from a candidate with underscore', function () {
      const localizer = new OpenLocalizer();
      const result = localizer.publicFindSupportedLocale(
        'en_GB',
        AVAILABLE_LOCALES,
      );
      expect(result).to.be.eq('en');
    });

    it('should return undefined if no match is found', function () {
      const localizer = new OpenLocalizer();
      const result = localizer.publicFindSupportedLocale(
        'fr',
        AVAILABLE_LOCALES,
      );
      expect(result).to.be.undefined;
    });

    it('should return undefined for an empty candidate string', function () {
      const localizer = new OpenLocalizer();
      const result = localizer.publicFindSupportedLocale('', AVAILABLE_LOCALES);
      expect(result).to.be.undefined;
    });

    it('should correctly parse a complex accept-language header string', function () {
      const localizer = new OpenLocalizer();
      const result = localizer.publicFindSupportedLocale(
        'de-DE,de;q=0.9,en-US;q=0.8',
        AVAILABLE_LOCALES,
      );
      expect(result).to.be.eq('de');
    });

    it('should correctly find an exact regional match from a complex header', function () {
      const localizer = new OpenLocalizer();
      const result = localizer.publicFindSupportedLocale(
        'pt-BR,pt;q=0.9',
        AVAILABLE_LOCALES,
      );
      expect(result).to.be.eq('pt-BR');
    });
  });

  describe('detectLocaleFromSource', function () {
    afterEach(function () {
      delete process.env.LANG;
      delete process.env.LANGUAGE;
    });

    it('should return undefined for browser sources when in a Node.js environment', function () {
      const localizer = new OpenLocalizer();
      const result = localizer.publicDetectLocaleFromSource(
        AVAILABLE_LOCALES,
        DetectionSource.URL_PATH,
      );
      expect(result).to.be.undefined;
    });

    context('when detecting from REQUEST_HEADER', function () {
      it('should extract locale from the request header', function () {
        const localizer = new OpenLocalizer();
        const req = createMockRequest({'accept-language': 'de,en;q=0.9'});
        localizer.setRequest(req);
        const result = localizer.publicDetectLocaleFromSource(
          AVAILABLE_LOCALES,
          DetectionSource.REQUEST_HEADER,
        );
        expect(result).to.be.eq('de');
      });

      it('should return undefined if request is not set', function () {
        const localizer = new OpenLocalizer();
        // No request is set on the instance
        const result = localizer.publicDetectLocaleFromSource(
          AVAILABLE_LOCALES,
          DetectionSource.REQUEST_HEADER,
        );
        expect(result).to.be.undefined;
      });

      it('should use a custom request header name', function () {
        const localizer = new OpenLocalizer({requestHeaderName: 'x-lang'});
        const req = createMockRequest({'x-lang': 'pt-BR'});
        localizer.setRequest(req);
        const result = localizer.publicDetectLocaleFromSource(
          AVAILABLE_LOCALES,
          DetectionSource.REQUEST_HEADER,
        );
        expect(result).to.be.eq('pt-BR');
      });
    });

    context('when detecting from ENV', function () {
      it('should extract locale from process.env.LANG', function () {
        process.env.LANG = 'de_DE.UTF-8';
        const localizer = new OpenLocalizer();
        const result = localizer.publicDetectLocaleFromSource(
          AVAILABLE_LOCALES,
          DetectionSource.ENV,
        );
        expect(result).to.be.eq('de');
      });

      it('should return undefined if no relevant env vars are set', function () {
        const localizer = new OpenLocalizer();
        const result = localizer.publicDetectLocaleFromSource(
          AVAILABLE_LOCALES,
          DetectionSource.ENV,
        );
        expect(result).to.be.undefined;
      });
    });

    context('in a mocked browser environment', function () {
      it('should detect from URL_PATH at a specific index', function () {
        setupBrowserMocks({pathname: '/api/v1/en/data'});
        const localizer = new OpenLocalizer({urlPathIndex: 2});
        const result = localizer.publicDetectLocaleFromSource(
          AVAILABLE_LOCALES,
          DetectionSource.URL_PATH,
        );
        expect(result).to.be.eq('en');
      });

      it('should detect from QUERY with a custom key', function () {
        setupBrowserMocks({search: '?locale=pt-BR'});
        const localizer = new OpenLocalizer({queryStringKey: 'locale'});
        const result = localizer.publicDetectLocaleFromSource(
          AVAILABLE_LOCALES,
          DetectionSource.QUERY,
        );
        expect(result).to.be.eq('pt-BR');
      });

      it('should detect from LOCAL_STORAGE with a custom key', function () {
        setupBrowserMocks({localStorageValues: {myAppLang: 'de'}});
        const localizer = new OpenLocalizer({localStorageKey: 'myAppLang'});
        const result = localizer.publicDetectLocaleFromSource(
          AVAILABLE_LOCALES,
          DetectionSource.LOCAL_STORAGE,
        );
        expect(result).to.be.eq('de');
      });

      it('should detect from HTML_TAG', function () {
        setupBrowserMocks({langAttr: 'de'});
        const localizer = new OpenLocalizer();
        const result = localizer.publicDetectLocaleFromSource(
          AVAILABLE_LOCALES,
          DetectionSource.HTML_TAG,
        );
        expect(result).to.be.eq('de');
      });

      it('should detect from NAVIGATOR', function () {
        setupBrowserMocks({languages: ['de-CH', 'en-US']});
        const localizer = new OpenLocalizer();
        const result = localizer.publicDetectLocaleFromSource(
          AVAILABLE_LOCALES,
          DetectionSource.NAVIGATOR,
        );
        expect(result).to.be.eq('de');
      });
    });
  });

  describe('Dictionary Management', function () {
    let localizer: Localizer;

    beforeEach(function () {
      localizer = new Localizer();
    });

    it('setDictionaries/getDictionaries should work for root namespace', function () {
      localizer.setDictionaries(ROOT_DICTIONARIES);
      expect(localizer.getDictionaries()).to.be.eql(ROOT_DICTIONARIES);
    });

    it('setDictionaries/getDictionaries should work for a specific namespace', function () {
      localizer.setDictionaries('admin', ADMIN_DICTIONARIES);
      expect(localizer.getDictionaries('admin')).to.be.eql(ADMIN_DICTIONARIES);
      expect(localizer.getDictionaries(LOCALIZER_ROOT_NAMESPACE)).to.be.eql({});
    });

    it('setDictionary/getDictionary should work for root namespace', function () {
      localizer.setDictionary('fr', {hello: 'Bonjour'});
      expect(localizer.getDictionary('fr')).to.be.eql({hello: 'Bonjour'});
    });

    it('setDictionary/getDictionary should work for a specific namespace', function () {
      localizer.setDictionary('admin', 'fr', {dashboard: 'Tableau de bord'});
      expect(localizer.getDictionary('admin', 'fr')).to.be.eql({
        dashboard: 'Tableau de bord',
      });
    });

    it('addDictionaries should merge dictionaries', function () {
      localizer.setDictionaries({en: {a: '1'}});
      localizer.addDictionaries({en: {b: '2'}, de: {c: '3'}});
      expect(localizer.getDictionary('en')).to.be.eql({a: '1', b: '2'});
      expect(localizer.getDictionary('de')).to.be.eql({c: '3'});
    });

    it('addDictionary should merge a single dictionary', function () {
      localizer.setDictionary('en', {a: '1'});
      localizer.addDictionary('en', {b: '2'});
      expect(localizer.getDictionary('en')).to.be.eql({a: '1', b: '2'});
    });
  });

  describe('t (translation)', function () {
    let localizer: Localizer;

    beforeEach(function () {
      localizer = new Localizer({fallbackLocale: 'en'});
      localizer.setDictionaries(ROOT_DICTIONARIES);
      localizer.setDictionaries('admin', ADMIN_DICTIONARIES);
    });

    it('should translate a simple key for the current locale', function () {
      localizer.forceLocale('de');
      expect(localizer.t('farewell')).to.be.eq('Auf Wiedersehen!');
    });

    it('should format the translated string with arguments', function () {
      localizer.forceLocale('en');
      expect(localizer.t('greeting', 'Alice')).to.be.eq('Hello, Alice!');
    });

    it('should fall back to the fallback locale if key is missing', function () {
      localizer.forceLocale('de');
      expect(localizer.t('farewell')).to.be.eq('Auf Wiedersehen!');
    });

    it('should return the key if translation is not found in any locale', function () {
      expect(localizer.t('nonexistent.key')).to.be.eq('nonexistent.key');
    });

    it('should handle pluralization correctly', function () {
      localizer.forceLocale('en');
      expect(localizer.t('item', 1)).to.be.eq('You have 1 item.');
      expect(localizer.t('item', 5)).to.be.eq('You have 5 items.');
      expect(localizer.t('item', 0)).to.be.eq('You have 0 items.');
    });

    it('should work with namespaces', function () {
      const adminLocalizer = localizer.cloneWithNamespace('admin');
      adminLocalizer.forceLocale('de');
      expect(adminLocalizer.t('dashboard')).to.be.eq('Instrumententafel');
      expect(adminLocalizer.t('greeting', 'Admin')).to.be.eq('Hallo, Admin!');
    });

    it('should fall back to the fallback locale within the same namespace', function () {
      const localizer = new Localizer({
        fallbackLocale: 'en',
        namespace: 'admin',
      });
      localizer.setDictionaries('admin', {
        en: {dashboard: 'Dashboard'},
        fr: {settings: 'Paramètres'},
      });
      localizer.setDictionaries(ROOT_DICTIONARIES);
      localizer.forceLocale('fr');
      expect(localizer.t('dashboard')).to.be.eq('Dashboard');
    });

    it('should handle missing "few" form gracefully', function () {
      const localizer = new Localizer();
      localizer.setDictionary('en', {
        item: {one: '%s item', many: '%s items'},
      });
      localizer.forceLocale('en');
      expect(localizer.t('item', 1)).to.be.eq('1 item');
      expect(localizer.t('item', 2)).to.be.eq('2 items');
    });

    it('should use the "one" form if no number is provided', function () {
      const localizer = new Localizer();
      localizer.setDictionary('en', {
        message: {one: 'A message'},
      });
      expect(localizer.t('message')).to.be.eq('A message');
    });

    it('should return the key if the numerable entry is an empty object', function () {
      const localizer = new Localizer();
      localizer.setDictionary('en', {
        emptyItem: {},
      });
      localizer.forceLocale('en');
      expect(localizer.t('emptyItem', 5)).to.be.eq('emptyItem');
    });
  });

  describe('formatNumerableEntry', function () {
    it('should select the "one" form for the number 1', function () {
      const localizer = new OpenLocalizer();
      const entry = {one: '%s ticket', many: '%s tickets'};
      const result = localizer.publicFormatNumerableEntry(entry, [1]);
      expect(result).to.be.eq('1 ticket');
    });

    it('should select the "many" form for numbers other than 1 (e.g., 0, 2, 5)', function () {
      const localizer = new OpenLocalizer();
      const entry = {one: '%s apple', many: '%s apples'};
      expect(localizer.publicFormatNumerableEntry(entry, [0])).to.be.eq(
        '0 apples',
      );
      expect(localizer.publicFormatNumerableEntry(entry, [2])).to.be.eq(
        '2 apples',
      );
      expect(localizer.publicFormatNumerableEntry(entry, [5])).to.be.eq(
        '5 apples',
      );
    });

    it('should correctly use the "few" form when available', function () {
      const localizer = new OpenLocalizer();
      const entry = {one: 'one', few: 'few', many: 'many'};
      expect(localizer.publicFormatNumerableEntry(entry, [2])).to.be.eq('few');
    });

    it('should format the chosen string with all provided arguments', function () {
      const localizer = new OpenLocalizer();
      const entry = {many: 'Found %d results for %v.'};
      const result = localizer.publicFormatNumerableEntry(entry, [
        15,
        'search',
      ]);
      expect(result).to.be.eq('Found 15 results for "search".');
    });

    it('should use the "one" form if no number is provided in arguments', function () {
      const localizer = new OpenLocalizer();
      const entry = {one: 'A thing', many: 'Some things'};
      const result = localizer.publicFormatNumerableEntry(entry, ['extra']);
      expect(result).to.be.eq('A thing');
    });

    it('should fall back to "few" then "many" if "one" is missing and no number is provided', function () {
      const localizer = new OpenLocalizer();
      const entryWithFew = {few: 'A few things', many: 'Many things'};
      const entryWithMany = {many: 'Many things'};
      expect(localizer.publicFormatNumerableEntry(entryWithFew, [])).to.be.eq(
        'A few things',
      );
      expect(localizer.publicFormatNumerableEntry(entryWithMany, [])).to.be.eq(
        'Many things',
      );
    });

    it('should return an empty string if the entry object is empty', function () {
      const localizer = new OpenLocalizer();
      const entry = {};
      const result = localizer.publicFormatNumerableEntry(entry, [5]);
      expect(result).to.be.eq('');
    });

    it('should return an empty string if no suitable key (one, few, many) is found', function () {
      const localizer = new OpenLocalizer();
      const entry = {other: 'some value'};
      const result = localizer.publicFormatNumerableEntry(
        entry as LocalizerNumerableEntry,
        [1],
      );
      expect(result).to.be.eq('');
    });

    it('should handle entries with undefined values gracefully', function () {
      const localizer = new OpenLocalizer();
      const entry = {one: undefined, many: 'Many items'};
      expect(localizer.publicFormatNumerableEntry(entry, [1])).to.be.eq(
        'Many items',
      );
      expect(localizer.publicFormatNumerableEntry(entry, [])).to.be.eq(
        'Many items',
      );
    });
  });

  describe('o (object translation)', function () {
    let localizer: Localizer;
    const langObj = {
      en: 'English Title',
      de: 'Deutscher Titel',
      pt: {
        one: '%s título',
        many: '%s títulos',
      },
    };

    beforeEach(function () {
      localizer = new Localizer({fallbackLocale: 'en'});
    });

    it('should pick the string for the current locale', function () {
      localizer.forceLocale('de');
      expect(localizer.o(langObj)).to.be.eq('Deutscher Titel');
    });

    it('should fall back to the fallback locale', function () {
      localizer.forceLocale('fr'); // French is not in the object
      expect(localizer.o(langObj)).to.be.eq('English Title');
    });

    it('should fall back to the first available key if no other locale matches', function () {
      const localizerFr = new Localizer({fallbackLocale: 'es'});
      localizerFr.forceLocale('fr');
      expect(localizerFr.o(langObj)).to.be.eq('English Title');
    });

    it('should handle pluralization from an object entry', function () {
      localizer.forceLocale('pt');
      expect(localizer.o(langObj, 1)).to.be.eq('1 título');
      expect(localizer.o(langObj, 5)).to.be.eq('5 títulos');
    });

    it('should return an empty string if object is empty or no value is found', function () {
      expect(localizer.o({})).to.be.eq('');
      expect(
        localizer.o({
          en: undefined,
          de: null,
        } as unknown as LocalizerDictionaries),
      ).to.be.eq('');
    });
  });

  describe('Locale Detection (Node.js Environment)', function () {
    afterEach(function () {
      delete process.env.LANG;
      delete process.env.LANGUAGE;
      delete process.env.LC_MESSAGES;
      delete process.env.LC_ALL;
    });

    it('should detect locale from process.env.LANG', function () {
      process.env.LANG = 'de_DE.UTF-8';
      const localizer = new Localizer({detectionOrder: [DetectionSource.ENV]});
      localizer.setDictionaries(ROOT_DICTIONARIES);
      expect(localizer.getLocale()).to.be.eq('de');
    });

    it('should detect locale from process.env.LANGUAGE', function () {
      process.env.LANGUAGE = 'de_DE:de';
      const localizer = new Localizer({detectionOrder: [DetectionSource.ENV]});
      localizer.setDictionaries(ROOT_DICTIONARIES);
      expect(localizer.getLocale()).to.be.eq('de');
    });

    it('should detect locale from process.env.LC_MESSAGES', function () {
      process.env.LC_MESSAGES = 'de_AT.UTF-8';
      const localizer = new Localizer({detectionOrder: [DetectionSource.ENV]});
      localizer.setDictionaries(ROOT_DICTIONARIES);
      expect(localizer.getLocale()).to.be.eq('de');
    });

    it('should detect locale from process.env.LC_ALL', function () {
      process.env.LC_ALL = 'de-CH';
      const localizer = new Localizer({detectionOrder: [DetectionSource.ENV]});
      localizer.setDictionaries(ROOT_DICTIONARIES);
      expect(localizer.getLocale()).to.be.eq('de');
    });

    it('should prioritize LANG over LC_ALL', function () {
      process.env.LANG = 'en-US';
      process.env.LC_ALL = 'de_DE.UTF-8';
      const localizer = new Localizer({detectionOrder: [DetectionSource.ENV]});
      localizer.setDictionaries(ROOT_DICTIONARIES);
      expect(localizer.getLocale()).to.be.eq('en');
    });

    it('should detect locale from request header', function () {
      const localizer = new Localizer({
        detectionOrder: [DetectionSource.REQUEST_HEADER],
      });
      localizer.setDictionaries(ROOT_DICTIONARIES);
      const req = createMockRequest({'accept-language': 'pt-BR,pt;q=0.9'});
      localizer.setRequest(req);
      expect(localizer.getLocale()).to.be.eq('pt-BR');
    });

    it('should find supported base locale from request header', function () {
      const localizer = new Localizer({
        detectionOrder: [DetectionSource.REQUEST_HEADER],
      });
      localizer.setDictionaries({de: {}, en: {}});
      const req = createMockRequest({'accept-language': 'de-AT,de;q=0.9'});
      const reqLocalizer = localizer.cloneWithRequest(req);
      expect(reqLocalizer.getLocale()).to.be.eq('de');
    });

    it('should ignore empty string from a source and proceed to the next', function () {
      setupBrowserMocks({localStorageValues: {language: ''}, langAttr: 'de'});
      const localizer = new Localizer({
        detectionOrder: [
          DetectionSource.LOCAL_STORAGE,
          DetectionSource.HTML_TAG,
        ],
      });
      localizer.setDictionaries(ROOT_DICTIONARIES);
      expect(localizer.getLocale()).to.be.eq('de');
    });
  });

  describe('Locale Detection (Browser Environment)', function () {
    const originalWindow = global.window;
    const originalDocument = global.document;
    const originalNavigator = global.navigator;

    after(function () {
      global.window = originalWindow;
      global.document = originalDocument;
      global.navigator = originalNavigator;
    });

    it('should detect locale from URL path', function () {
      setupBrowserMocks({pathname: '/de/page'});
      const localizer = new Localizer({
        detectionOrder: [DetectionSource.URL_PATH],
        urlPathIndex: 0,
      });
      localizer.setDictionaries(ROOT_DICTIONARIES);
      expect(localizer.getLocale()).to.be.eq('de');
    });

    it('should detect locale from query string', function () {
      setupBrowserMocks({search: '?lang=pt-BR'});
      const localizer = new Localizer({
        detectionOrder: [DetectionSource.QUERY],
        queryStringKey: 'lang',
      });
      localizer.setDictionaries(ROOT_DICTIONARIES);
      expect(localizer.getLocale()).to.be.eq('pt-BR');
    });

    it('should detect locale from localStorage', function () {
      setupBrowserMocks({localStorageValues: {language: 'de'}});
      const localizer = new Localizer({
        detectionOrder: [DetectionSource.LOCAL_STORAGE],
        localStorageKey: 'language',
      });
      localizer.setDictionaries(ROOT_DICTIONARIES);
      expect(localizer.getLocale()).to.be.eq('de');
    });

    it('should detect locale from HTML tag', function () {
      setupBrowserMocks({langAttr: 'de'});
      const localizer = new Localizer({
        detectionOrder: [DetectionSource.HTML_TAG],
      });
      localizer.setDictionaries(ROOT_DICTIONARIES);
      expect(localizer.getLocale()).to.be.eq('de');
    });

    it('should detect locale from navigator.languages', function () {
      setupBrowserMocks({languages: ['de-DE', 'en-US']});
      const localizer = new Localizer({
        detectionOrder: [DetectionSource.NAVIGATOR],
      });
      localizer.setDictionaries(ROOT_DICTIONARIES);
      expect(localizer.getLocale()).to.be.eq('de');
    });

    it('should respect the detectionOrder', function () {
      setupBrowserMocks({
        pathname: '/en/page',
        search: '?lang=de',
        localStorageValues: {language: 'pt-BR'},
      });
      const localizer = new Localizer({
        detectionOrder: [
          DetectionSource.LOCAL_STORAGE,
          DetectionSource.QUERY,
          DetectionSource.URL_PATH,
        ],
      });
      localizer.setDictionaries(ROOT_DICTIONARIES);
      expect(localizer.getLocale()).to.be.eq('pt-BR');
    });
  });
});
