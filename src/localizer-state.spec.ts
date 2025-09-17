import {expect} from 'chai';
import {removeEmptyKeys} from './utils/index.js';
import {LocalizerState} from './localizer-state.js';
import {LocalizerOptions} from './localizer-state.js';
import {DEFAULT_LOCALIZER_OPTIONS} from './localizer-state.js';

describe('LocalizerState', function () {
  describe('constructor', function () {
    it('should initialize with default options if none are provided', function () {
      const state = new LocalizerState();
      const expectedOptions = removeEmptyKeys(DEFAULT_LOCALIZER_OPTIONS);
      expect(state.options).to.be.eql(expectedOptions);
      expect(state.dictionaries).to.deep.equal({});
      expect(state.currentLocale).to.be.undefined;
    });

    it('should override default options with provided options', function () {
      const options: Partial<LocalizerOptions> = {
        fallbackLocale: 'fr',
        queryStringKey: 'langue',
      };
      const state = new LocalizerState(options);
      expect(state.options.fallbackLocale).to.equal('fr');
      expect(state.options.queryStringKey).to.equal('langue');
      // проверка, что остальные опции остались по умолчанию
      expect(state.options.urlPathIndex).to.equal(
        DEFAULT_LOCALIZER_OPTIONS.urlPathIndex,
      );
    });

    it('should correctly initialize dictionaries and currentLocale', function () {
      const dictionaries = {en: {hello: 'Hello'}};
      const currentLocale = 'en';
      const state = new LocalizerState({}, dictionaries, currentLocale);
      expect(state.dictionaries).to.deep.equal(dictionaries);
      expect(state.currentLocale).to.equal(currentLocale);
    });

    it('should merge dictionaries from options into the main dictionaries property', function () {
      const options = {
        dictionaries: {
          en: {fromOptions: 'Hi'},
        },
      };
      const initialDictionaries = {
        fr: {fromInitial: 'Salut'},
        en: {fromInitial: 'Hello'}, // это значение будет перезаписано
      };
      const state = new LocalizerState(options, initialDictionaries);
      expect(state.dictionaries).to.deep.equal({
        en: {fromOptions: 'Hi'},
        fr: {fromInitial: 'Salut'},
      });
    });

    it('should filter out null and undefined values from provided options', function () {
      const options = {
        fallbackLocale: null, // это значение должно быть проигнорировано
        urlPathIndex: 0,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const state = new LocalizerState(options as any);
      // fallbackLocale должен остаться стандартным, а не стать null
      expect(state.options.fallbackLocale).to.equal(
        DEFAULT_LOCALIZER_OPTIONS.fallbackLocale,
      );
      expect(state.options.urlPathIndex).to.equal(0);
    });

    it('should set the current locale by the "defaultLocale" option value', function () {
      const state = new LocalizerState({defaultLocale: 'ru'});
      expect(state.currentLocale).to.be.eq('ru');
    });
  });

  describe('getAvailableLocales', function () {
    it('should return locales from options.locales', function () {
      const state = new LocalizerState({locales: ['en', 'de']});
      expect(state.getAvailableLocales()).to.have.members(['en', 'de']);
    });

    it('should return locales from dictionary keys', function () {
      const state = new LocalizerState({}, {fr: {}, es: {}});
      expect(state.getAvailableLocales()).to.have.members(['fr', 'es']);
    });

    it('should combine and deduplicate locales from both sources', function () {
      const state = new LocalizerState(
        {locales: ['en', 'de']},
        {de: {}, fr: {}},
      );
      const available = state.getAvailableLocales();
      expect(available).to.have.lengthOf(3);
      expect(available).to.have.members(['en', 'de', 'fr']);
    });

    it('should return an empty array if no locales are defined', function () {
      const state = new LocalizerState();
      expect(state.getAvailableLocales()).to.be.an('array').that.is.empty;
    });
  });

  describe('cloning', function () {
    let originalState: LocalizerState;

    beforeEach(function () {
      originalState = new LocalizerState(
        {fallbackLocale: 'de', locales: ['de']},
        {de: {test: 'Test'}},
        'de',
      );
    });

    describe('clone', function () {
      it('should create a new instance that is a deep copy of the original', function () {
        const clonedState = originalState.clone();
        // это новый объект
        expect(clonedState).to.not.equal(originalState);
        // но его содержимое идентично
        expect(clonedState.options).to.deep.equal(originalState.options);
        expect(clonedState.dictionaries).to.deep.equal(
          originalState.dictionaries,
        );
        expect(clonedState.currentLocale).to.equal(originalState.currentLocale);
      });

      it('should ensure that modifying the clone does not affect the original', function () {
        const clonedState = originalState.clone();
        clonedState.options.fallbackLocale = 'fr';
        clonedState.dictionaries['fr'] = {new: 'New'};
        expect(originalState.options.fallbackLocale).to.equal('de');
        expect(originalState.dictionaries['fr']).to.be.undefined;
      });
    });

    describe('cloneWithLocale', function () {
      it('should create a new instance with the specified locale', function () {
        const newLocale = 'en-US';
        const clonedState = originalState.cloneWithLocale(newLocale);
        expect(clonedState).to.not.equal(originalState);
        expect(clonedState.currentLocale).to.equal(newLocale);
        expect(clonedState.options).to.deep.equal(originalState.options);
      });

      it('should not modify the original state', function () {
        originalState.cloneWithLocale('fr');
        expect(originalState.currentLocale).to.equal('de');
      });
    });
  });
});
