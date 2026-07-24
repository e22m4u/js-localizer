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

    it('should require the option "noEmptyString" to be a Boolean', function () {
      const throwable = v => () => new Localizer({noEmptyString: v});
      const error = s =>
        format(
          'Option "noEmptyString" must be a Boolean, but %s was given.',
          s,
        );
      expect(throwable('str')).to.throw(error('"str"'));
      expect(throwable('')).to.throw(error('""'));
      expect(throwable(10)).to.throw(error('10'));
      expect(throwable(0)).to.throw(error('0'));
      expect(throwable([])).to.throw(error('Array'));
      expect(throwable({})).to.throw(error('Object'));
      expect(throwable(null)).to.throw(error('null'));
      throwable(true)();
      throwable(false)();
      throwable(undefined)();
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
              $one: 'I have %d apple',
              $other: 'I have %d apples',
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
              $one: 'У меня %d яблоко',
              $few: 'У меня %d яблока',
              $many: 'У меня %d яблок',
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

    describe('support nested dictionaries using dot-notation', function () {
      it('should support nested dictionaries using dot-notation for simple strings', function () {
        const S = new Localizer({
          locale: 'en',
          dictionaries: {
            en: {
              group: {
                title: 'Title',
                description: 'Description',
              },
            },
          },
        });
        expect(S.t('group.title')).to.be.eq('Title');
        expect(S.t('group.description')).to.be.eq('Description');
      });

      it('should support nested dictionaries containing declension objects', function () {
        const S = new Localizer({
          locale: 'en',
          dictionaries: {
            en: {
              group: {
                items: {
                  $one: '1 item',
                  $other: '%d items',
                },
              },
            },
          },
        });
        expect(S.t('group.items', 1)).to.be.eq('1 item');
        expect(S.t('group.items', 5)).to.be.eq('5 items');
      });

      it('should return the key if pointing to a nested dictionary (not a declension)', function () {
        const S = new Localizer({
          locale: 'en',
          dictionaries: {
            en: {
              group: {
                title: 'Title',
              },
            },
          },
        });
        expect(S.t('group')).to.be.eq('group');
      });

      it('should fallback correctly with nested keys', function () {
        const S = new Localizer({
          locale: 'ru',
          fallbackLocale: 'en',
          dictionaries: {
            ru: {
              group: {
                foo: 'Фу',
              },
            },
            en: {
              group: {
                foo: 'Foo',
                bar: 'Bar',
              },
            },
          },
        });
        expect(S.t('group.foo')).to.be.eq('Фу');
        expect(S.t('group.bar')).to.be.eq('Bar');
      });
    });

    describe('when the option "noEmptyString" is true', function () {
      it('should use a current locale when a translation is a non-empty string', function () {
        const S = new Localizer({
          locale: 'ru',
          fallbackLocale: 'en',
          noEmptyString: true,
          dictionaries: {
            ru: {hello: 'Привет'},
            de: {hello: 'Hallo'},
            en: {hello: 'Hello'},
          },
        });
        expect(S.t('hello')).to.be.eq('Привет');
      });

      it('should use a fallback locale when a translation is an empty string', function () {
        const S = new Localizer({
          locale: 'ru',
          fallbackLocale: 'en',
          noEmptyString: true,
          dictionaries: {
            ru: {hello: ''},
            de: {hello: 'Hallo'},
            en: {hello: 'Hello'},
          },
        });
        expect(S.t('hello')).to.be.eq('Hello');
      });

      it('should use a first locale when a fallback translation is an empty string', function () {
        const S = new Localizer({
          locale: 'ru',
          fallbackLocale: 'en',
          noEmptyString: true,
          dictionaries: {
            ru: {hello: ''},
            de: {hello: 'Hallo'},
            en: {hello: ''},
          },
        });
        expect(S.t('hello')).to.be.eq('Hallo');
      });

      it('should use a current locale when a declension is a non-empty string', function () {
        const S = new Localizer({
          locale: 'ru',
          fallbackLocale: 'en',
          noEmptyString: true,
          dictionaries: {
            ru: {iHaveApples: {$other: 'У меня %d яблок'}},
            de: {iHaveApples: {$other: 'Ich habe %d Äpfel'}},
            en: {iHaveApples: {$other: 'I have %d apples'}},
          },
        });
        expect(S.t('iHaveApples', 5)).to.be.eq('У меня 5 яблок');
      });

      it('should use a fallback locale when a declension is an empty string', function () {
        const S = new Localizer({
          locale: 'ru',
          fallbackLocale: 'en',
          noEmptyString: true,
          dictionaries: {
            ru: {iHaveApples: {$other: ''}},
            de: {iHaveApples: {$other: 'Ich habe %d Äpfel'}},
            en: {iHaveApples: {$other: 'I have %d apples'}},
          },
        });
        expect(S.t('iHaveApples', 5)).to.be.eq('I have 5 apples');
      });

      it('should use a first locale when a fallback declension is an empty string', function () {
        const S = new Localizer({
          locale: 'ru',
          fallbackLocale: 'en',
          noEmptyString: true,
          dictionaries: {
            ru: {iHaveApples: {$other: ''}},
            de: {iHaveApples: {$other: 'Ich habe %d Äpfel'}},
            en: {iHaveApples: {$other: ''}},
          },
        });
        expect(S.t('iHaveApples', 5)).to.be.eq('Ich habe 5 Äpfel');
      });
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
              $one: 'I have %d apple',
              $other: 'I have %d apples',
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
              $one: 'У меня %d яблоко',
              $few: 'У меня %d яблока',
              $many: 'У меня %d яблок',
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

    describe('when the option "noEmptyString" is true', function () {
      it('should use a current locale when a translation is a non-empty string', function () {
        const S = new Localizer({
          locale: 'ru',
          fallbackLocale: 'en',
          noEmptyString: true,
        });
        const res = S.o({ru: 'Привет', de: 'Hallo', en: 'Hello'});
        expect(res).to.be.eq('Привет');
      });

      it('should use a fallback locale when a translation is an empty string', function () {
        const S = new Localizer({
          locale: 'ru',
          fallbackLocale: 'en',
          noEmptyString: true,
        });
        const res = S.o({ru: '', de: 'Hallo', en: 'Hello'});
        expect(res).to.be.eq('Hello');
      });

      it('should use a first locale when a fallback translation is an empty string', function () {
        const S = new Localizer({
          locale: 'ru',
          fallbackLocale: 'en',
          noEmptyString: true,
        });
        const res = S.o({ru: '', de: 'Hallo', en: ''});
        expect(res).to.be.eq('Hallo');
      });

      it('should use a current locale when a declension is a non-empty string', function () {
        const S = new Localizer({
          locale: 'ru',
          fallbackLocale: 'en',
          noEmptyString: true,
        });
        const res = S.o(
          {
            ru: {$other: 'У меня %d яблок'},
            de: {$other: 'Ich habe %d Äpfel'},
            en: {$other: 'I have %d apples'},
          },
          5,
        );
        expect(res).to.be.eq('У меня 5 яблок');
      });

      it('should use a fallback locale when a declension is an empty string', function () {
        const S = new Localizer({
          locale: 'ru',
          fallbackLocale: 'en',
          noEmptyString: true,
        });
        const res = S.o(
          {
            ru: {$other: ''},
            de: {$other: 'Ich habe %d Äpfel'},
            en: {$other: 'I have %d apples'},
          },
          5,
        );
        expect(res).to.be.eq('I have 5 apples');
      });

      it('should use a first locale when a fallback declension is an empty string', function () {
        const S = new Localizer({
          locale: 'ru',
          fallbackLocale: 'en',
          noEmptyString: true,
        });
        const res = S.o(
          {
            ru: {$other: ''},
            de: {$other: 'Ich habe %d Äpfel'},
            en: {$other: ''},
          },
          5,
        );
        expect(res).to.be.eq('Ich habe 5 Äpfel');
      });
    });
  });

  describe('_getDeclension', function () {
    it('should return undefined if the object contains no declension fields', function () {
      const S = new Localizer();
      expect(S._getDeclension({}, [5], 'en')).to.be.undefined;
      expect(S._getDeclension({foo: 'bar'}, [5], 'en')).to.be.undefined;
    });

    it('should return the base fallback if no numeric argument is provided', function () {
      const S = new Localizer();
      const declObj = {$one: 'яблоко', $few: 'яблока', $many: 'яблок'};
      expect(S._getDeclension(declObj, [], 'ru')).to.be.eq('яблок');
      expect(S._getDeclension(declObj, ['string', true], 'ru')).to.be.eq(
        'яблок',
      );
    });

    it('should determine the base fallback based on the internal priority sequence', function () {
      const S = new Localizer();
      expect(
        S._getDeclension({$many: 'many', $other: 'other'}, [], 'en'),
      ).to.be.eq('other');
      expect(S._getDeclension({$few: 'few', $many: 'many'}, [], 'en')).to.be.eq(
        'many',
      );
      expect(S._getDeclension({$two: 'two', $few: 'few'}, [], 'en')).to.be.eq(
        'few',
      );
      expect(S._getDeclension({$one: 'one', $two: 'two'}, [], 'en')).to.be.eq(
        'two',
      );
      expect(S._getDeclension({$zero: 'zero', $one: 'one'}, [], 'en')).to.be.eq(
        'one',
      );
    });

    it('should select correct forms using standard CLDR tags for English (one, other)', function () {
      const S = new Localizer();
      const declObj = {$one: 'apple', $other: 'apples'};
      expect(S._getDeclension(declObj, [1], 'en')).to.be.eq('apple');
      expect(S._getDeclension(declObj, [5], 'en')).to.be.eq('apples');
      expect(S._getDeclension(declObj, [0], 'en')).to.be.eq('apples');
      expect(S._getDeclension(declObj, [1.5], 'en')).to.be.eq('apples');
    });

    it('should select correct forms using standard CLDR tags for Russian (one, few, many, other)', function () {
      const S = new Localizer();
      const declObj = {
        $one: 'яблоко',
        $few: 'яблока',
        $many: 'яблок',
        $other: 'яблока (дробь)',
      };
      expect(S._getDeclension(declObj, [1], 'ru')).to.be.eq('яблоко');
      expect(S._getDeclension(declObj, [3], 'ru')).to.be.eq('яблока');
      expect(S._getDeclension(declObj, [5], 'ru')).to.be.eq('яблок');
      expect(S._getDeclension(declObj, [1.5], 'ru')).to.be.eq('яблока (дробь)');
    });

    it('should select correct forms using standard CLDR tags for Arabic (zero, one, two, few, many, other)', function () {
      const S = new Localizer();
      const declObj = {
        $zero: '٠ تفاحة',
        $one: 'تفاحة واحدة',
        $two: 'تفاحتان',
        $few: '٣-١٠ تفاحات',
        $many: '١١-٩٩ تفاحة',
        $other: '+١٠٠ تفاحة',
      };
      expect(S._getDeclension(declObj, [0], 'ar')).to.be.eq('٠ تفاحة');
      expect(S._getDeclension(declObj, [1], 'ar')).to.be.eq('تفاحة واحدة');
      expect(S._getDeclension(declObj, [2], 'ar')).to.be.eq('تفاحتان');
      expect(S._getDeclension(declObj, [3], 'ar')).to.be.eq('٣-١٠ تفاحات');
      expect(S._getDeclension(declObj, [11], 'ar')).to.be.eq('١١-٩٩ تفاحة');
      expect(S._getDeclension(declObj, [100], 'ar')).to.be.eq('+١٠٠ تفاحة');
    });

    it('should gracefully fallback to $many if exact native tag $other is missing', function () {
      const S = new Localizer();
      const declObj = {$one: 'apple', $many: 'apples'};
      expect(S._getDeclension(declObj, [5], 'en')).to.be.eq('apples');
      expect(S._getDeclension(declObj, [0], 'en')).to.be.eq('apples');
    });

    it('should correctly parse numeric strings as numbers for pluralization', function () {
      const S = new Localizer();
      const declObj = {$one: 'apple', $other: 'apples'};
      expect(S._getDeclension(declObj, ['1'], 'en')).to.be.eq('apple');
      expect(S._getDeclension(declObj, ['5'], 'en')).to.be.eq('apples');
      expect(S._getDeclension(declObj, ['1.5'], 'en')).to.be.eq('apples');
      expect(S._getDeclension(declObj, ['not-a-number', '5'], 'en')).to.be.eq(
        'apples',
      );
      expect(S._getDeclension(declObj, ['not-a-number', 1], 'en')).to.be.eq(
        'apple',
      );
      expect(S._getDeclension(declObj, ['', '  ', 1], 'en')).to.be.eq('apple');
    });
  });

  describe('_getByPath', function () {
    it('should return undefined if the object is invalid', function () {
      const S = new Localizer();
      expect(S._getByPath('str', 'path')).to.be.undefined;
      expect(S._getByPath(10, 'path')).to.be.undefined;
      expect(S._getByPath([], 'path')).to.be.undefined;
      expect(S._getByPath(undefined, 'path')).to.be.undefined;
      expect(S._getByPath(null, 'path')).to.be.undefined;
    });

    it('should return the exact match if a key contains dots', function () {
      const S = new Localizer();
      const obj = {'foo.bar': 'exact', foo: {bar: 'nested'}};
      expect(S._getByPath(obj, 'foo.bar')).to.be.eq('exact');
    });

    it('should resolve nested paths using dot-notation', function () {
      const S = new Localizer();
      const obj = {a: {b: {c: 'target'}}};
      expect(S._getByPath(obj, 'a.b.c')).to.be.eq('target');
    });

    it('should return undefined if a path element is missing', function () {
      const S = new Localizer();
      const obj = {a: {b: {}}};
      expect(S._getByPath(obj, 'a.b.c')).to.be.undefined;
      expect(S._getByPath(obj, 'x.y.z')).to.be.undefined;
    });

    it('should return undefined if the path traverses a non-object value', function () {
      const S = new Localizer();
      const obj = {a: {b: 'not-an-object'}};
      expect(S._getByPath(obj, 'a.b.c')).to.be.undefined;
    });

    it('should return undefined if the path traverses an array', function () {
      const S = new Localizer();
      const obj = {a: [{b: 'value'}]};
      expect(S._getByPath(obj, 'a.0.b')).to.be.undefined;
    });
  });
});
