/**
 * Localizer options.
 */
export type LocalizerOptions = {
  locale?: string;
  fallbackLocale?: string;
  dictionaries?: LocalizerDictionaries;
  noEmptyString?: boolean;
};

/**
 * Localizer dictionaries.
 */
export type LocalizerDictionaries = {
  [locale: string]: LocalizerDictionary;
};

/**
 * Localizer dictionary.
 */
export type LocalizerDictionary = {
  [key: string]: LocalizerEntry | LocalizerDictionary | undefined;
};

/**
 * Localizer entry.
 */
export type LocalizerEntry = string | DeclensionObject;

/**
 * Declension object.
 */
export type DeclensionObject = {
  one?: string;
  few?: string;
  many?: string;
};

/**
 * Lang object.
 */
export type LangObject = {
  [locale: string]: LocalizerEntry | undefined;
};

/**
 * Localizer.
 */
export declare class Localizer {
  /**
   * Constructor.
   */
  constructor(options?: LocalizerOptions);

  /**
   * Установить текущую локаль.
   *
   * ```js
   * const localizer = new Localizer();
   * localizer.setLocale('ru');
   * ```
   *
   * @param locale
   */
  setLocale(locale: string): this;

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
   */
  getLocale(): string;

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
   * @param locale
   */
  setFallbackLocale(locale: string): this;

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
   */
  getFallbackLocale(): string;

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
   */
  getAvailableLocales(): string[];

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
   * @param locale
   * @param dictionary
   */
  setDictionary(locale: string, dictionary: LocalizerDictionary): this;

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
   * @param key
   * @param args
   */
  t(key: string, ...args: unknown[]): string;

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
   * @param langObject
   * @param args
   */
  o(langObject: LangObject, ...args: unknown[]): string;
}
