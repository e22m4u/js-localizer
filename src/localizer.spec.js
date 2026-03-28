import {format} from '@e22m4u/js-format';
import {Localizer} from './localizer.js';
import {expect} from 'chai';

describe('Localizer', function () {
  describe('constructor', function () {
    it('should require the parameter "options" to be an Object', function () {
      const throwable = v => () => new Localizer(v);
      const error = s =>
        format('Parameter "options" must be an Object, but %s was given.', s);
      expect(throwable('str')).to.throw(error('"str"'));
      expect(throwable('')).to.throw(error('""'));
      expect(throwable(10)).to.throw(error('10'));
      expect(throwable(0)).to.throw(error('0'));
      expect(throwable(true)).to.throw(error('true'));
      expect(throwable(false)).to.throw(error('false'));
      expect(throwable([])).to.throw(error('Array'));
      expect(throwable(null)).to.throw(error('null'));
      throwable({})();
      throwable(undefined)();
    });

    it('should require the option "locale" to be a non-empty String', function () {
      const throwable = v => () => new Localizer({locale: v});
      const error = s =>
        format(
          'Option "locale" must be a non-empty String, but %s was given.',
          s,
        );
      expect(throwable('')).to.throw(error('""'));
      expect(throwable(true)).to.throw(error('true'));
      expect(throwable(false)).to.throw(error('false'));
      expect(throwable(10)).to.throw(error('10'));
      expect(throwable(0)).to.throw(error('0'));
      expect(throwable([])).to.throw(error('Array'));
      expect(throwable({})).to.throw(error('Object'));
      expect(throwable(null)).to.throw(error('null'));
      throwable('str')();
      throwable(undefined)();
    });

    it('should require the option "fallbackLocale" to be a non-empty String', function () {
      const throwable = v => () => new Localizer({fallbackLocale: v});
      const error = s =>
        format(
          'Option "fallbackLocale" must be a non-empty String, but %s was given.',
          s,
        );
      expect(throwable('')).to.throw(error('""'));
      expect(throwable(true)).to.throw(error('true'));
      expect(throwable(false)).to.throw(error('false'));
      expect(throwable(10)).to.throw(error('10'));
      expect(throwable(0)).to.throw(error('0'));
      expect(throwable([])).to.throw(error('Array'));
      expect(throwable({})).to.throw(error('Object'));
      expect(throwable(null)).to.throw(error('null'));
      throwable('str')();
      throwable(undefined)();
    });

    it('should require the option "dictionaries" to be an Object', function () {
      const throwable = v => () => new Localizer({dictionaries: v});
      const error = s =>
        format('Option "dictionaries" must be an Object, but %s was given.', s);
      expect(throwable('str')).to.throw(error('"str"'));
      expect(throwable('')).to.throw(error('""'));
      expect(throwable(10)).to.throw(error('10'));
      expect(throwable(0)).to.throw(error('0'));
      expect(throwable(true)).to.throw(error('true'));
      expect(throwable(false)).to.throw(error('false'));
      expect(throwable([])).to.throw(error('Array'));
      expect(throwable(null)).to.throw(error('null'));
      throwable({})();
      throwable(undefined)();
    });

    it('should require a value in the option "dictionaries" to be an Object', function () {
      const throwable = v => () => new Localizer({dictionaries: {en: v}});
      const error = s =>
        format(
          'Property "en" of "dictionaries" must be an Object, but %s was given.',
          s,
        );
      expect(throwable('str')).to.throw(error('"str"'));
      expect(throwable('')).to.throw(error('""'));
      expect(throwable(10)).to.throw(error('10'));
      expect(throwable(0)).to.throw(error('0'));
      expect(throwable(true)).to.throw(error('true'));
      expect(throwable(false)).to.throw(error('false'));
      expect(throwable([])).to.throw(error('Array'));
      expect(throwable(undefined)).to.throw(error('undefined'));
      expect(throwable(null)).to.throw(error('null'));
      throwable({})();
    });

    it('should allow create an instance without options', function () {
      new Localizer();
    });

    it('should set "en" as the default value for the fallback locale', function () {
      const S = new Localizer();
      expect(S.getFallbackLocale()).to.be.eq('en');
    });
  });

  describe('setLocale', function () {
    it('should require the parameter "locale" to be a non-empty String', function () {
      const throwable = v => () => {
        const S = new Localizer();
        S.setLocale(v);
      };
      const error = s =>
        format(
          'Parameter "locale" must be a non-empty String, but %s was given.',
          s,
        );
      expect(throwable('')).to.throw(error('""'));
      expect(throwable(true)).to.throw(error('true'));
      expect(throwable(false)).to.throw(error('false'));
      expect(throwable(10)).to.throw(error('10'));
      expect(throwable(0)).to.throw(error('0'));
      expect(throwable([])).to.throw(error('Array'));
      expect(throwable({})).to.throw(error('Object'));
      expect(throwable(undefined)).to.throw(error('undefined'));
      expect(throwable(null)).to.throw(error('null'));
      throwable('str')();
    });

    it('should return the current instance and set the current locale', function () {
      const S = new Localizer();
      expect(S.getLocale()).to.be.eq('en');
      const res = S.setLocale('ru');
      expect(res).to.be.eq(S);
      expect(S.getLocale()).to.be.eq('ru');
    });
  });

  describe('getLocale', function () {
    it('should return the fallback locale or the current locale if specified', function () {
      const S = new Localizer();
      expect(S.getLocale()).to.be.eq('en');
      S.setFallbackLocale('de');
      expect(S.getLocale()).to.be.eq('de');
      S.setLocale('ru');
      expect(S.getLocale()).to.be.eq('ru');
    });
  });

  describe('setFallbackLocale', function () {
    it('should require the parameter "locale" to be a non-empty String', function () {
      const throwable = v => () => {
        const S = new Localizer();
        S.setFallbackLocale(v);
      };
      const error = s =>
        format(
          'Parameter "locale" must be a non-empty String, but %s was given.',
          s,
        );
      expect(throwable('')).to.throw(error('""'));
      expect(throwable(true)).to.throw(error('true'));
      expect(throwable(false)).to.throw(error('false'));
      expect(throwable(10)).to.throw(error('10'));
      expect(throwable(0)).to.throw(error('0'));
      expect(throwable([])).to.throw(error('Array'));
      expect(throwable({})).to.throw(error('Object'));
      expect(throwable(undefined)).to.throw(error('undefined'));
      expect(throwable(null)).to.throw(error('null'));
      throwable('str')();
    });

    it('should return the current instance and set the fallback locale', function () {
      const S = new Localizer();
      expect(S.getFallbackLocale()).to.be.eq('en');
      const res = S.setFallbackLocale('ru');
      expect(res).to.be.eq(S);
      expect(S.getFallbackLocale()).to.be.eq('ru');
    });
  });

  describe('getFallbackLocale', function () {
    it('should return the fallback locale', function () {
      const S = new Localizer();
      expect(S.getFallbackLocale()).to.be.eq('en');
      S.setFallbackLocale('ru');
      expect(S.getFallbackLocale()).to.be.eq('ru');
    });
  });

  describe('getAvailableLocales', function () {
    it('should return available locales of dictionaries', function () {
      const S = new Localizer();
      expect(S.getAvailableLocales()).to.be.eql([]);
      S.setDictionary('en', {hello: 'Hello'});
      expect(S.getAvailableLocales()).to.be.eql(['en']);
      S.setDictionary('ru', {hello: 'Привет'});
      expect(S.getAvailableLocales()).to.be.eql(['en', 'ru']);
    });
  });

  describe('setDictionary', function () {
    it('should require the parameter "locale" to be a non-empty String', function () {
      const throwable = v => () => {
        const S = new Localizer();
        S.setDictionary(v, {});
      };
      const error = s =>
        format(
          'Parameter "locale" must be a non-empty String, but %s was given.',
          s,
        );
      expect(throwable('')).to.throw(error('""'));
      expect(throwable(true)).to.throw(error('true'));
      expect(throwable(false)).to.throw(error('false'));
      expect(throwable(10)).to.throw(error('10'));
      expect(throwable(0)).to.throw(error('0'));
      expect(throwable([])).to.throw(error('Array'));
      expect(throwable({})).to.throw(error('Object'));
      expect(throwable(undefined)).to.throw(error('undefined'));
      expect(throwable(null)).to.throw(error('null'));
      throwable('str')();
    });

    it('should require the parameter "dictionary" to be an Object', function () {
      const throwable = v => () => {
        const S = new Localizer();
        S.setDictionary('ru', v);
      };
      const error = s =>
        format(
          'Parameter "dictionary" must be an Object, but %s was given.',
          s,
        );
      expect(throwable('str')).to.throw(error('"str"'));
      expect(throwable('')).to.throw(error('""'));
      expect(throwable(true)).to.throw(error('true'));
      expect(throwable(false)).to.throw(error('false'));
      expect(throwable(10)).to.throw(error('10'));
      expect(throwable(0)).to.throw(error('0'));
      expect(throwable([])).to.throw(error('Array'));
      expect(throwable(undefined)).to.throw(error('undefined'));
      expect(throwable(null)).to.throw(error('null'));
      throwable({})();
    });

    it('should set the given dictionary to the dictionaries map', function () {
      const S = new Localizer();
      S.setDictionary('ru', {hello: 'Привет!'});
      expect(S['_dictionaries'].ru).to.be.eql({hello: 'Привет!'});
    });

    it('should override an existing dictionary for the specified locale', function () {
      const S = new Localizer();
      S.setDictionary('ru', {hello: 'Привет!'});
      expect(S['_dictionaries'].ru).to.be.eql({hello: 'Привет!'});
      S.setDictionary('ru', {hello: 'Здравствуйте!'});
      expect(S['_dictionaries'].ru).to.be.eql({hello: 'Здравствуйте!'});
    });
  });

  describe('t', function () {
    it('should require the parameter "key" to be a String', function () {
      const throwable = v => () => {
        const S = new Localizer();
        S.t(v);
      };
      const error = s =>
        format('Parameter "key" must be a String, but %s was given.', s);
      expect(throwable(true)).to.throw(error('true'));
      expect(throwable(false)).to.throw(error('false'));
      expect(throwable(10)).to.throw(error('10'));
      expect(throwable(0)).to.throw(error('0'));
      expect(throwable([])).to.throw(error('Array'));
      expect(throwable({})).to.throw(error('Object'));
      expect(throwable(undefined)).to.throw(error('undefined'));
      expect(throwable(null)).to.throw(error('null'));
      throwable('str')();
      throwable('')();
    });

    it('should return the given key when no translation is found', function () {
      const S = new Localizer();
      expect(S.t('key')).to.be.eq('key');
    });

    it('should interpolate the given key when no translation is found', function () {
      const S = new Localizer();
      expect(S.t('Hello, %s!', 'World')).to.be.eq('Hello, World!');
    });

    it('should use the fallback locale when the current locale is not specified', function () {
      const S = new Localizer({
        fallbackLocale: 'en',
        dictionaries: {
          ru: {hello: 'Привет!'},
          en: {hello: 'Hello!'},
        },
      });
      expect(S.t('hello')).to.be.eq('Hello!');
    });

    it('should use the current locale even when the fallback locale is specified', function () {
      const S = new Localizer({
        locale: 'ru',
        fallbackLocale: 'en',
        dictionaries: {
          ru: {hello: 'Привет!'},
          en: {hello: 'Hello!'},
        },
      });
      expect(S.t('hello')).to.be.eq('Привет!');
    });

    it('should use the first available locale that has the given key when no locale matches', function () {
      const S = new Localizer({
        locale: 'fr',
        fallbackLocale: 'en',
        dictionaries: {
          de: {hello: 'Hallo!'},
          ru: {bye: 'Пока!'},
        },
      });
      expect(S.t('hello')).to.be.eq('Hallo!');
      expect(S.t('bye')).to.be.eq('Пока!');
    });

    it('should interpolate a translation with provided arguments', function () {
      const S = new Localizer({
        locale: 'en',
        dictionaries: {en: {hello: 'Hello, %s!'}},
      });
      expect(S.t('hello', 'World')).to.be.eq('Hello, World!');
    });

    it('should select a correct translation from the declension object with 2 forms', function () {
      const S = new Localizer({
        locale: 'en',
        dictionaries: {
          en: {
            iHaveApples: {
              one: 'I have %d apple',
              many: 'I have %d apples',
            },
          },
        },
      });
      expect(S.t('iHaveApples', 1)).to.be.eq('I have 1 apple');
      expect(S.t('iHaveApples', 3)).to.be.eq('I have 3 apples');
      expect(S.t('iHaveApples', 5)).to.be.eq('I have 5 apples');
    });

    it('should select a correct translation from the declension object with 3 forms', function () {
      const S = new Localizer({
        locale: 'ru',
        dictionaries: {
          ru: {
            iHaveApples: {
              one: 'У меня %d яблоко',
              few: 'У меня %d яблока',
              many: 'У меня %d яблок',
            },
          },
        },
      });
      expect(S.t('iHaveApples', 1)).to.be.eq('У меня 1 яблоко');
      expect(S.t('iHaveApples', 3)).to.be.eq('У меня 3 яблока');
      expect(S.t('iHaveApples', 5)).to.be.eq('У меня 5 яблок');
    });

    it('should interpolate the given key when the correct declension is not found', function () {
      const S = new Localizer({
        locale: 'ru',
        dictionaries: {ru: {'I have %d apples': {}}},
      });
      expect(S.t('I have %d apples', 5)).to.be.eq('I have 5 apples');
    });
  });

  describe('o', function () {
    it('should require the parameter "langObject" to be an Object', function () {
      const throwable = v => () => {
        const S = new Localizer();
        S.o(v);
      };
      const error = s =>
        format(
          'Parameter "langObject" must be an Object, but %s was given.',
          s,
        );
      expect(throwable('str')).to.throw(error('"str"'));
      expect(throwable('')).to.throw(error('""'));
      expect(throwable(true)).to.throw(error('true'));
      expect(throwable(false)).to.throw(error('false'));
      expect(throwable(10)).to.throw(error('10'));
      expect(throwable(0)).to.throw(error('0'));
      expect(throwable([])).to.throw(error('Array'));
      expect(throwable(undefined)).to.throw(error('undefined'));
      expect(throwable(null)).to.throw(error('null'));
      throwable({})();
    });

    it('should return an empty string when no translation is found', function () {
      const S = new Localizer();
      expect(S.o({})).to.be.eq('');
    });

    it('should use the fallback locale when the current locale is not specified', function () {
      const S = new Localizer({fallbackLocale: 'en'});
      expect(S.o({ru: 'Привет!', en: 'Hello!'})).to.be.eq('Hello!');
    });

    it('should use the current locale even when the fallback locale is specified', function () {
      const S = new Localizer({locale: 'ru', fallbackLocale: 'en'});
      expect(S.o({ru: 'Привет!', en: 'Hello!'})).to.be.eq('Привет!');
    });

    it('should use the first available locale when no locale matches', function () {
      const S = new Localizer({locale: 'de', fallbackLocale: 'en'});
      expect(S.o({ru: 'Привет!'})).to.be.eq('Привет!');
    });

    it('should interpolate a translation with provided arguments', function () {
      const S = new Localizer({locale: 'en'});
      const res = S.o({ru: 'Привет, %s!', en: 'Hello, %s!'}, 'World');
      expect(res).to.be.eq('Hello, World!');
    });

    it('should select a correct translation from the declension object with 2 forms', function () {
      const S = new Localizer({locale: 'en'});
      const fn = d =>
        S.o(
          {
            en: {
              one: 'I have %d apple',
              many: 'I have %d apples',
            },
          },
          d,
        );
      expect(fn(1)).to.be.eq('I have 1 apple');
      expect(fn(3)).to.be.eq('I have 3 apples');
      expect(fn(5)).to.be.eq('I have 5 apples');
    });

    it('should select a correct translation from the declension object with 3 forms', function () {
      const S = new Localizer({locale: 'ru'});
      const fn = d =>
        S.o(
          {
            ru: {
              one: 'У меня %d яблоко',
              few: 'У меня %d яблока',
              many: 'У меня %d яблок',
            },
          },
          d,
        );
      expect(fn(1)).to.be.eq('У меня 1 яблоко');
      expect(fn(3)).to.be.eq('У меня 3 яблока');
      expect(fn(5)).to.be.eq('У меня 5 яблок');
    });

    it('should return an empty string when the correct declension is not found', function () {
      const S = new Localizer({locale: 'en'});
      expect(S.o({en: {}})).to.be.eq('');
    });
  });
});
