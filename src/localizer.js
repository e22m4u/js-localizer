import {numWords} from './utils/index.js';
import {format, InvalidArgumentError} from '@e22m4u/js-format';

/**
 * Localizer.
 */
export class Localizer {
  /**
   * Locale.
   *
   * @type {string|undefined}
   */
  _locale = undefined;

  /**
   * Fallback locale.
   *
   * @type {string}
   */
  _fallbackLocale = 'en';

  /**
   * No empty string.
   *
   * @type {boolean}
   */
  _noEmptyString = false;

  /**
   * Dictionaries.
   *
   * @type {object}
   */
  _dictionaries = {};

  /**
   * Constructor.
   *
   * @param {object} [options]
   */
  constructor(options) {
    if (options !== undefined) {
      if (!options || typeof options !== 'object' || Array.isArray(options)) {
        throw new InvalidArgumentError(
          'Parameter "options" must be an Object, but %v was given.',
          options,
        );
      }
      // options.locale
      if (options.locale !== undefined) {
        if (!options.locale || typeof options.locale !== 'string') {
          throw new InvalidArgumentError(
            'Option "locale" must be a non-empty String, but %v was given.',
            options.locale,
          );
        }
        this.setLocale(options.locale);
      }
      // options.fallbackLocale
      if (options.fallbackLocale !== undefined) {
        if (
          !options.fallbackLocale ||
          typeof options.fallbackLocale !== 'string'
        ) {
          throw new InvalidArgumentError(
            'Option "fallbackLocale" must be a non-empty String, but %v was given.',
            options.fallbackLocale,
          );
        }
        this.setFallbackLocale(options.fallbackLocale);
      }
      // options.dictionaries
      if (options.dictionaries !== undefined) {
        if (
          !options.dictionaries ||
          typeof options.dictionaries !== 'object' ||
          Array.isArray(options.dictionaries)
        ) {
          throw new InvalidArgumentError(
            'Option "dictionaries" must be an Object, but %v was given.',
            options.dictionaries,
          );
        }
        // options.dictionaries[k]
        for (const locale of Object.keys(options.dictionaries)) {
          const dictionary = options.dictionaries[locale];
          if (
            !dictionary ||
            typeof dictionary !== 'object' ||
            Array.isArray(dictionary)
          ) {
            throw new InvalidArgumentError(
              'Property %v of "dictionaries" must be an Object, ' +
                'but %v was given.',
              locale,
              dictionary,
            );
          }
          this.setDictionary(locale, options.dictionaries[locale]);
        }
      }
      // options.noEmptyString
      if (options.noEmptyString !== undefined) {
        if (typeof options.noEmptyString !== 'boolean') {
          throw new InvalidArgumentError(
            'Option "noEmptyString" must be a Boolean, but %v was given.',
            options.noEmptyString,
          );
        }
        this._noEmptyString = options.noEmptyString;
      }
    }
  }

  /**
   * Установить текущую локаль.
   *
   * ```js
   * const localizer = new Localizer();
   * localizer.setLocale('ru');
   * ```
   *
   * @param {string} locale
   * @returns {this}
   */
  setLocale(locale) {
    if (!locale || typeof locale !== 'string') {
      throw new InvalidArgumentError(
        'Parameter "locale" must be a non-empty String, but %v was given.',
        locale,
      );
    }
    this._locale = locale;
    return this;
  }

  /**
   * Получить текущую локаль или альтернативную.
   *
   * Пример:
   * ```js
   * const localizer = new Localizer();
   *
   * // если текущая локаль не определена,
   * // то возвращается альтернативная локаль (en)
   * const res1 = localizer.getLocale();
   * console.log(res1); // "en"
   *
   * // если текущая локаль определена,
   * // то приоритет отдается ей
   * localizer.setLocale('ru');
   * const res2 = localizer.getLocale();
   * console.log(res2); // "ru"
   * ```
   *
   * @returns {string}
   */
  getLocale() {
    return this._locale || this._fallbackLocale;
  }

  /**
   * Установить альтернативную локаль.
   *
   * Пример:
   * ```js
   * const localizer = new Localizer();
   *
   * const res1 = localizer.getFallbackLocale();
   * console.log(res1); // "en"
   *
   * localizer.setFallbackLocale('ru');
   * const res2 = localizer.getFallbackLocale();
   * console.log(res2); // "ru"
   * ```
   *
   * @param {string} locale
   * @returns {this}
   */
  setFallbackLocale(locale) {
    if (!locale || typeof locale !== 'string') {
      throw new InvalidArgumentError(
        'Parameter "locale" must be a non-empty String, but %v was given.',
        locale,
      );
    }
    this._fallbackLocale = locale;
    return this;
  }

  /**
   * Получить альтернативную локаль.
   *
   * Пример:
   * ```js
   * const localizer = new Localizer();
   *
   * const res1 = localizer.getFallbackLocale();
   * console.log(res1); // "en"
   *
   * localizer.setFallbackLocale('ru');
   * const res2 = localizer.getFallbackLocale();
   * console.log(res2); // "ru"
   * ```
   *
   * @returns {string}
   */
  getFallbackLocale() {
    return this._fallbackLocale;
  }

  /**
   * Получить локали имеющихся справочников.
   *
   * Пример:
   * ```js
   * const localizer = new Localizer({
   *   dictionaries: {
   *     ru: {hello: 'Привет'},
   *     en: {hello: 'Hello'},
   *   },
   * });
   * const locales = localizer.getAvailableLocales();
   * console.log(locales); // ["ru", "en"]
   * ```
   *
   * @returns {string[]}
   */
  getAvailableLocales() {
    return Object.keys(this._dictionaries);
  }

  /**
   * Установить или заменить словарь для указанной локали.
   *
   * Пример:
   * ```js
   * localizer.setDictionary('ru', {
   *   'hello': 'Привет',
   *   'helloName': 'Привет, %s!',
   *   'iHaveApples': {
   *     one: 'У меня одно яблоко',
   *     few: 'У меня %d яблока',
   *     many: 'У меня %d яблок',
   *   },
   * });
   * ```
   *
   * @param {string} locale
   * @param {object} dictionary
   * @returns {this}
   */
  setDictionary(locale, dictionary) {
    if (!locale || typeof locale !== 'string') {
      throw new InvalidArgumentError(
        'Parameter "locale" must be a non-empty String, but %v was given.',
        locale,
      );
    }
    if (
      !dictionary ||
      typeof dictionary !== 'object' ||
      Array.isArray(dictionary)
    ) {
      throw new InvalidArgumentError(
        'Parameter "dictionary" must be an Object, but %v was given.',
        dictionary,
      );
    }
    this._dictionaries[locale] = dictionary;
    return this;
  }

  /**
   * Найти и сформировать перевод по ключу из справочника.
   *
   * Пример:
   * ```js
   * const localizer = new Localizer({
   *   locale: 'ru',
   *   dictionaries: {
   *     ru: {
   *       'hello': 'Привет',
   *       'helloName': 'Привет, %s!',
   *       'iHaveApples': {
   *         one: 'У меня одно яблоко',
   *         few: 'У меня %d яблока',
   *         many: 'У меня %d яблок',
   *       },
   *     },
   *   },
   * });
   *
   * // базовый пример
   * const res1 = localizer.t('hello');
   * console.log(res1); // "Привет"
   *
   * // интерполяция
   * const res2 = localizer.t('helloName', 'Мир');
   * console.log(res2); // "Привет, Мир!"
   *
   * // склонение
   * const res3 = localizer.t('iHaveApples', 10);
   * console.log(res3); // "У меня 10 яблок"
   * ```
   *
   * @param {string} key
   * @param {*[]} args
   * @returns {string}
   */
  t(key, ...args) {
    if (typeof key !== 'string') {
      throw new InvalidArgumentError(
        'Parameter "key" must be a String, but %v was given.',
        key,
      );
    }
    // распаковывает объект склонений
    // или возвращает как есть
    const resolveValue = val => {
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        return this._getDeclension(val, args);
      }
      return val;
    };
    // вспомогательная функция проверяет,
    // подходит ли итоговое значение
    const isValid = val =>
      val != null && !(this._noEmptyString && String(val).trim() === '');
    let entry;
    // проверка наличия перевода или объекта
    // склонений в текущей локали
    if (this._locale && this._dictionaries[this._locale]) {
      entry = resolveValue(this._dictionaries[this._locale][key]);
    }
    // проверка наличия перевода или объекта
    // склонений в fallback локали
    if (
      !isValid(entry) &&
      this._fallbackLocale &&
      this._dictionaries[this._fallbackLocale]
    ) {
      entry = resolveValue(this._dictionaries[this._fallbackLocale][key]);
    }
    // проверка наличия перевода или объекта
    // склонений в оставшихся локалях
    if (!isValid(entry)) {
      for (const locale in this._dictionaries) {
        // пропуск проверенных локалей,
        // чтобы не делать лишнюю работу
        if (locale === this._locale || locale === this._fallbackLocale) {
          continue;
        }
        const tempEntry = resolveValue(this._dictionaries[locale][key]);
        if (isValid(tempEntry)) {
          entry = tempEntry;
          break;
        }
      }
    }
    // если значением является строка,
    // то выполняется форматирование
    if (typeof entry === 'string') {
      return this._format(entry, ...args);
    }
    // если корректный перевод не найден,
    // то возвращается ключ
    if (!isValid(entry)) {
      return this._format(key, ...args);
    }
    return String(entry);
  }

  /**
   * Извлечь и форматировать перевод из объекта для текущей локали.
   *
   * Пример:
   * ```js
   * const localizer = new Localizer({locale: 'ru'});
   *
   * // базовый пример
   * const res1 = localizer.o({
   *   ru: 'Привет',
   *   en: 'Hello',
   * });
   * console.log(res1); // "Привет"
   *
   * // интерполяция
   * const res2 = localizer.o({
   *   ru: 'Привет, %s!',
   *   en: 'Hello, %s!',
   * }, 'Мир');
   * console.log(res2); // "Привет, Мир!"
   *
   * // склонение
   * const res3 = localizer.o({
   *   ru: {
   *     one: 'У меня одно яблоко',
   *     few: 'У меня %d яблока',
   *     many: 'У меня %d яблок',
   *   },
   *   en: {
   *     one: 'I have an apple',
   *     many: 'I have %d apples',
   *   },
   * }, 10);
   * console.log(res3); // "У меня 10 яблок"
   * ```
   *
   * @param {object} langObject
   * @param {*[]} args
   * @returns {string}
   */
  o(langObject, ...args) {
    if (
      !langObject ||
      typeof langObject !== 'object' ||
      Array.isArray(langObject)
    ) {
      throw new InvalidArgumentError(
        'Parameter "langObject" must be an Object, but %v was given.',
        langObject,
      );
    }
    // распаковывает объект склонений
    // или возвращает как есть
    const resolveValue = val => {
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        return this._getDeclension(val, args);
      }
      return val;
    };
    // вспомогательная функция проверяет,
    // подходит ли итоговое значение
    const isValid = val =>
      val != null && !(this._noEmptyString && String(val).trim() === '');
    let entry;
    // проверка наличия перевода или объекта
    // склонений в текущей локали
    if (this._locale) {
      entry = resolveValue(langObject[this._locale]);
    }
    // проверка наличия перевода или объекта
    // склонений в fallback локали
    if (!isValid(entry) && this._fallbackLocale) {
      entry = resolveValue(langObject[this._fallbackLocale]);
    }
    // проверка наличия перевода или объекта
    // склонений в оставшихся локалях
    if (!isValid(entry)) {
      for (const locale in langObject) {
        // пропуск проверенных локалей,
        // чтобы не делать лишнюю работу
        if (locale === this._locale || locale === this._fallbackLocale) {
          continue;
        }
        const tempEntry = resolveValue(langObject[locale]);
        if (isValid(tempEntry)) {
          entry = tempEntry;
          break;
        }
      }
    }
    // если значением является строка,
    // то выполняется форматирование
    if (typeof entry === 'string') {
      return this._format(entry, ...args);
    }
    // если корректный перевод не найден,
    // то возвращается пустая строка
    if (!isValid(entry)) {
      return '';
    }
    return String(entry);
  }

  /**
   * Format.
   *
   * @param {string} pattern
   * @param {*[]} args
   * @returns {string}
   */
  _format(pattern, ...args) {
    if (typeof pattern === 'string' && /%[a-zA-Z]/.test(pattern)) {
      return format(pattern, ...args);
    } else {
      return pattern;
    }
  }

  /**
   * Извлечь подходящее склонение из объекта склонений
   * согласно аргументам.
   *
   * @param {object} declObj
   * @param {*[]} args
   * @returns {string|undefined}
   */
  _getDeclension(declObj, args) {
    let fallback;
    if (declObj.one != undefined) {
      fallback = declObj.one;
    } else if (declObj.few != undefined) {
      fallback = declObj.few;
    } else if (declObj.many != undefined) {
      fallback = declObj.many;
    }
    const numArg = args.find(v => typeof v === 'number');
    if (typeof numArg === 'number') {
      let entry = numWords(numArg, declObj.one, declObj.few, declObj.many);
      if (entry == null) {
        entry = fallback;
      }
      return entry;
    }
    return fallback;
  }
}
