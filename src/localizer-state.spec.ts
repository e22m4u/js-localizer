import {expect} from 'chai';
import {LocalizerState} from './localizer-state.js';

describe('LocalizerState', function () {
  describe('getAvailableLocales', function () {
    it('should return locales from dictionaries if options.locales is not provided', function () {
      const state = new LocalizerState({}, {en: {}, ru: {}});
      expect(state.getAvailableLocales()).to.have.members(['en', 'ru']);
    });

    it('should return locales from options.locales if dictionaries are empty', function () {
      const state = new LocalizerState({locales: ['en', 'fr']});
      expect(state.getAvailableLocales()).to.have.members(['en', 'fr']);
    });

    it('should return a combined unique list of locales from options and dictionaries', function () {
      const state = new LocalizerState(
        {locales: ['en', 'fr']},
        {en: {}, de: {}},
      );
      expect(state.getAvailableLocales()).to.have.members(['en', 'fr', 'de']);
      expect(state.getAvailableLocales()).to.have.lengthOf(3);
    });
  });
});
