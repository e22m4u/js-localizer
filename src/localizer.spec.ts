import 'mocha';
import {expect} from 'chai';
import {IncomingMessage} from 'http';
import {Localizer} from './localizer.js';
import {LangObject} from './localizer.js';
import {removeEmptyKeys} from './utils/index.js';
import {LocalizerState} from './localizer-state.js';
import {LocalizerDictionaries} from './localizer-state.js';
import {DEFAULT_FALLBACK_LOCALE} from './localizer-state.js';
import {DEFAULT_LOCALIZER_OPTIONS} from './localizer-state.js';

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
    return this._detectSupportedLocale();
  }
}

/**
 * Разрешить запись в свойства объекта.
 */
type Writable<T> = {-readonly [P in keyof T]: T[P]};

/**
 * Вспомогательная функция для создания IncomingMessage.
 */
function createMockReq(headers: {
  [key: string]: string | string[] | undefined;
}): IncomingMessage {
  return {headers} as IncomingMessage;
}

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
      const expectedOptions = removeEmptyKeys(DEFAULT_LOCALIZER_OPTIONS);
      expect(localizer.state.options).to.deep.equal(expectedOptions);
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

  describe('locale setter', function () {
    it('should correctly set the current locale', function () {
      const localizer = new Localizer();
      localizer.setLocale('ru');
      expect(localizer.getLocale()).to.equal('ru');
    });
  });

  describe('locale getter', function () {
    it('should return the currently set locale', function () {
      const localizer = new Localizer();
      localizer.setLocale('ru');
      expect(localizer.getLocale()).to.equal('ru');
    });

    it('should return the defaultLocale from options if no locale is set', function () {
      const localizer = new Localizer({defaultLocale: 'ru', dictionaries});
      expect(localizer.getLocale()).to.equal('ru');
    });

    it('should return the fallbackLocale from options if no locale is set', function () {
      const localizer = new Localizer({fallbackLocale: 'ru', dictionaries});
      expect(localizer.getLocale()).to.equal('ru');
    });

    it('should return the defaultLocale from options instead of the fallbackLocale option', function () {
      const localizer = new Localizer({
        defaultLocale: 'ru',
        fallbackLocale: 'fr',
        dictionaries,
      });
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

  describe('cloneWithLocaleFromRequest', function () {
    let localizer: Localizer;

    beforeEach(function () {
      localizer = new Localizer({
        locales: ['en-US', 'fr', 'ru'],
        requestHeaderKey: 'Accept-Language',
      });
      localizer.setLocale('en');
    });

    it('should set the locale when a single string header has an exact match', function () {
      const req = createMockReq({'accept-language': 'fr'});
      const res = localizer.cloneWithLocaleFromRequest(req);
      expect(res.getLocale()).to.be.eq('fr');
      expect(res).to.be.not.eq(req); // проверка, что объект новый
    });

    it('should set the locale when a single string header has a base language match', function () {
      const req = createMockReq({'accept-language': 'ru-RU,en;q=0.9'});
      const res = localizer.cloneWithLocaleFromRequest(req);
      expect(res.getLocale()).to.be.eq('ru');
    });

    it('should find the first supported locale in an array of candidates', function () {
      // 'de' не поддерживается, 'fr' — первый поддерживаемый в списке кандидатов
      const req = createMockReq({'accept-language': ['de-DE', 'fr', 'en-US']});
      const res = localizer.cloneWithLocaleFromRequest(req);
      expect(res.getLocale()).to.be.eq('fr');
    });

    it('should correctly use the case-insensitive header key from options', function () {
      // в опциях 'Accept-Language', а в запросе 'accept-language'
      const req = createMockReq({'accept-language': 'en-US'});
      const res = localizer.cloneWithLocaleFromRequest(req);
      expect(res.getLocale()).to.be.eq('en-US');
    });

    it('should skip invalid entries in an array and find a valid one', function () {
      const req = createMockReq({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'accept-language': ['de', null, '', 'ru-RU'] as any,
      });
      const res = localizer.cloneWithLocaleFromRequest(req);
      expect(res.getLocale()).to.be.eq('ru');
    });

    it('should return a clone with unchanged locale if the header is missing', function () {
      localizer.setLocale('fr'); // устанавливаем начальное состояние
      const req = createMockReq({}); // заголовка нет
      const res = localizer.cloneWithLocaleFromRequest(req);
      expect(res.getLocale()).to.be.eq('fr');
      expect(res).to.be.not.eq(req); // проверка, что объект новый
    });

    it('should return a clone with unchanged locale if no supported locales are found', function () {
      localizer.setLocale('en-US');
      const req = createMockReq({'accept-language': ['es-ES', 'ja-JP']});
      const res = localizer.cloneWithLocaleFromRequest(req);
      expect(res.getLocale()).to.be.eq('en-US');
    });

    it('should return a clone with unchanged locale for an empty array header', function () {
      localizer.setLocale('ru');
      const req = createMockReq({'accept-language': []});
      const res = localizer.cloneWithLocaleFromRequest(req);
      expect(res.getLocale()).to.be.eq('ru');
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

  describe('_detectSupportedLocale', function () {
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

    it('should handle numerable entries for "one"', function () {
      localizer.setLocale('ru');
      expect(localizer.t('item', 1)).to.equal('1 товар');
    });

    it('should handle numerable entries for "few"', function () {
      localizer.setLocale('ru');
      expect(localizer.t('item', 3)).to.equal('3 товара');
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

    it('should return the value from the explicitly set locale', function () {
      const localizer = new Localizer();
      localizer.setLocale('ru');
      expect(localizer.o(langObject)).to.be.eq('Привет');
    });
  });
});
