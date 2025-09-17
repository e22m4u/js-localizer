import {expect} from 'chai';
import {findSupportedLocale} from './find-supported-locale.js';

describe('findSupportedLocale', function () {
  const availableLocales = ['en', 'en-US', 'ru', 'de-DE'];

  describe('when an exact match exists', function () {
    it('should return the exact match (case-sensitive from available list)', function () {
      const result = findSupportedLocale('en-US', availableLocales);
      expect(result).to.equal('en-US');
    });

    it('should find the exact match regardless of the candidate case', function () {
      const result = findSupportedLocale('en-us', availableLocales);
      expect(result).to.equal('en-US');
    });

    it('should find a simple language code as an exact match', function () {
      const result = findSupportedLocale('ru', availableLocales);
      expect(result).to.equal('ru');
    });

    it('should find an exact match even with different casing in available locales', function () {
      const result = findSupportedLocale('DE-de', availableLocales);
      expect(result).to.equal('de-DE');
    });
  });

  describe('when only a base language match exists', function () {
    it('should return the base language for a candidate with a region (hyphen)', function () {
      const result = findSupportedLocale('ru-RU', availableLocales);
      expect(result).to.equal('ru');
    });

    it('should return the base language for a candidate with a region (underscore)', function () {
      const locales = ['en', 'ru'];
      const result = findSupportedLocale('ru_RU', locales);
      expect(result).to.equal('ru');
    });

    it('should find the base language regardless of case', function () {
      const result = findSupportedLocale('EN-gb', availableLocales);
      expect(result).to.equal('en');
    });

    it('should prioritize exact match over base language match', function () {
      const result = findSupportedLocale('en-US', availableLocales);
      expect(result).to.equal('en-US');
    });
  });

  describe('when no match exists', function () {
    it('should return undefined if the locale is not supported', function () {
      const result = findSupportedLocale('fr', availableLocales);
      expect(result).to.be.undefined;
    });

    it('should return undefined if the base language is not supported', function () {
      const result = findSupportedLocale('fr-CA', availableLocales);
      expect(result).to.be.undefined;
    });

    it('should return undefined for an empty list of available locales', function () {
      const result = findSupportedLocale('en', []);
      expect(result).to.be.undefined;
    });
  });

  describe('with edge case inputs', function () {
    it('should return undefined for an empty string candidate', function () {
      const result = findSupportedLocale('', availableLocales);
      expect(result).to.be.undefined;
    });

    it('should return undefined for a null candidate', function () {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = findSupportedLocale(null as any, availableLocales);
      expect(result).to.be.undefined;
    });

    it('should return undefined for an undefined candidate', function () {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = findSupportedLocale(undefined as any, availableLocales);
      expect(result).to.be.undefined;
    });
  });
});
