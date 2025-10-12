import {IncomingMessage} from 'http';
import {format} from '@e22m4u/js-format';
import {numWords} from './utils/num-words.js';
import {removeEmptyKeys} from './utils/index.js';

/**
 * Lang object.
 */
export type LangObject = Record<string, LocalizerEntry>;

/**
 * Default localizer namespace.
 */
export const LOCALIZER_ROOT_NAMESPACE = '$root';

/**
 * Detection source.
 */
export const DetectionSource = {
  REQUEST_HEADER: 'requestHeader' as const,
  URL_PATH: 'urlPath' as const,
  QUERY: 'query' as const,
  LOCAL_STORAGE: 'localStorage' as const,
  HTML_TAG: 'htmlTag' as const,
  NAVIGATOR: 'navigator' as const,
  ENV: 'env' as const,
};

/**
 * Type of DetectionSource.
 */
export type DetectionSource =
  (typeof DetectionSource)[keyof typeof DetectionSource];

/**
 * Localizer options.
 */
export type LocalizerOptions = {
  namespace: string | undefined;
  locales: string[];
  fallbackLocale: string;
  urlPathIndex: number;
  queryStringKey: string;
  localStorageKey: string;
  requestHeaderName: string;
  detectionOrder: DetectionSource[];
};

/**
 * Localizer options input.
 */
export type LocalizerOptionsInput = Partial<LocalizerOptions>;

/**
 * Default detection order.
 */
export const DEFAULT_DETECTION_ORDER: DetectionSource[] = [
  DetectionSource.REQUEST_HEADER,
  DetectionSource.URL_PATH,
  DetectionSource.QUERY,
  DetectionSource.LOCAL_STORAGE,
  DetectionSource.HTML_TAG,
  DetectionSource.NAVIGATOR,
  DetectionSource.ENV,
];

/**
 * Browser locale sources.
 */
export const BROWSER_LOCALE_SOURCES: DetectionSource[] = [
  DetectionSource.URL_PATH,
  DetectionSource.QUERY,
  DetectionSource.LOCAL_STORAGE,
  DetectionSource.NAVIGATOR,
  DetectionSource.HTML_TAG,
];

/**
 * Default fallback locale.
 */
export const DEFAULT_FALLBACK_LOCALE = 'en';

/**
 * Default localizer options.
 */
export const DEFAULT_LOCALIZER_OPTIONS: LocalizerOptions = {
  namespace: undefined,
  locales: [],
  fallbackLocale: DEFAULT_FALLBACK_LOCALE,
  urlPathIndex: 0,
  queryStringKey: 'lang',
  localStorageKey: 'language',
  requestHeaderName: 'accept-language',
  detectionOrder: DEFAULT_DETECTION_ORDER,
};

/**
 * Localizer numerable entry.
 */
export type LocalizerNumerableEntry = {
  one?: string;
  few?: string;
  many?: string;
};

/**
 * Localizer entry.
 */
export type LocalizerEntry = string | LocalizerNumerableEntry;

/**
 * Localizer dictionary.
 */
export type LocalizerDictionary = {
  [key: string]: LocalizerEntry;
};

/**
 * Localizer dictionaries.
 */
export type LocalizerDictionaries = {
  [locale: string]: LocalizerDictionary;
};

/**
 * Localizer namespaced dictionaries.
 */
export type LocalizerNamespacedDictionaries = Map<
  string,
  LocalizerDictionaries
>;

/**
 * Localizer.
 */
export class Localizer {
  /**
   * Dictionaries by namespace.
   */
  protected nsDictionaries: LocalizerNamespacedDictionaries = new Map();

  /**
   * Localizer options.
   */
  options: LocalizerOptions = structuredClone(DEFAULT_LOCALIZER_OPTIONS);

  /**
   * Detected locale.
   */
  protected detectedLocale?: string;

  /**
   * Forced locale.
   */
  protected forcedLocale?: string;

  /**
   * Request.
   */
  protected request?: IncomingMessage;

  /**
   * Constructor.
   */
  constructor(options?: LocalizerOptionsInput) {
    // установка опций имеющих не пустые значения
    if (options) {
      const filteredOptions = removeEmptyKeys(options);
      Object.assign(this.options, filteredOptions);
    }
  }

  /**
   * Получить пространство имен.
   */
  getNamespace() {
    return this.options.namespace;
  }

  /**
   * Set request.
   */
  setRequest(req: IncomingMessage) {
    this.request = req;
    this.detectLocale();
    return this;
  }

  /**
   * Получить локаль.
   */
  getLocale(): string {
    if (this.forcedLocale) return this.forcedLocale;
    if (this.detectedLocale) return this.detectedLocale;
    this.detectLocale();
    return this.detectedLocale ?? this.options.fallbackLocale;
  }

  /**
   * Сбросить принудительную локаль.
   */
  resetForcedLocale() {
    this.forcedLocale = undefined;
    return this;
  }

  /**
   * Установить локаль принудительно.
   *
   * @param locale
   */
  forceLocale(locale: string): this {
    this.forcedLocale = locale;
    return this;
  }

  /**
   * Клонирование экземпляра.
   *
   * @param options
   */
  clone(options?: LocalizerOptionsInput) {
    const newOptions = structuredClone(this.options);
    if (options) {
      const filteredOptions = removeEmptyKeys(options);
      Object.assign(newOptions, filteredOptions);
    }
    const inst = new Localizer(newOptions);
    inst.nsDictionaries = structuredClone(this.nsDictionaries);
    inst.detectedLocale = this.detectedLocale;
    inst.forcedLocale = this.forcedLocale;
    inst.request = this.request;
    return inst;
  }

  /**
   * Клонирование экземпляра с новой локалью.
   *
   * @param locale
   */
  cloneWithLocale(locale: string) {
    const inst = this.clone();
    inst.forceLocale(locale);
    return inst;
  }

  /**
   * Клонирование экземпляра с локалью из заголовка запроса.
   *
   * @param req
   */
  cloneWithRequest(req: IncomingMessage) {
    const inst = this.clone();
    inst.request = req;
    inst.detectLocale(true);
    return inst;
  }

  /**
   * Clone with namespace.
   *
   * @param namespace
   */
  cloneWithNamespace(namespace: string) {
    return this.clone({namespace});
  }

  /**
   * Получить доступные локали.
   */
  getAvailableLocales(): string[] {
    const ns = this.getNamespace() || LOCALIZER_ROOT_NAMESPACE;
    const nsDicts = this.nsDictionaries.get(ns);
    const rootDicts = this.nsDictionaries.get(LOCALIZER_ROOT_NAMESPACE);
    const locales = new Set([
      ...Object.keys(rootDicts || {}),
      ...Object.keys(nsDicts || {}),
    ]);
    return Array.from(locales);
  }

  /**
   * Получить справочники.
   *
   * @param namespace
   */
  getDictionaries(namespace?: string) {
    if (namespace) {
      return this.nsDictionaries.get(namespace || '') || {};
    }
    return this.nsDictionaries.get(LOCALIZER_ROOT_NAMESPACE) || {};
  }

  /**
   * Получить справочник.
   *
   * @param locale
   */
  getDictionary(locale: string): LocalizerDictionary;

  /**
   * Получить справочник.
   *
   * @param locale
   */
  getDictionary(namespace: string, locale: string): LocalizerDictionary;

  /**
   * Получить справочник.
   *
   * @param namespace
   * @param locale
   */
  getDictionary(
    namespace: string | undefined,
    locale: string,
  ): LocalizerDictionary;

  /**
   * Получить справочник.
   *
   * @param namespace
   * @param locale
   */
  getDictionary(namespaceOrLocale: string | undefined, locale?: string) {
    let namespace: string | undefined;
    if (arguments.length === 2) {
      namespace = namespaceOrLocale as string;
      locale = locale as string;
    } else {
      locale = namespaceOrLocale as string;
    }
    const dicts = this.getDictionaries(namespace);
    return dicts[locale] || {};
  }

  /**
   * Установить справочники.
   *
   * @param dictionaries
   */
  setDictionaries(dictionaries: LocalizerDictionaries): this;

  /**
   * Установить справочники.
   *
   * @param namespace
   * @param dictionaries
   */
  setDictionaries(namespace: string, dictionaries: LocalizerDictionaries): this;

  /**
   * Установить справочники.
   *
   * @param namespace
   * @param dictionaries
   */
  setDictionaries(
    namespace: string | undefined,
    dictionaries: LocalizerDictionaries,
  ): this;

  /**
   * Установить справочники.
   *
   * @param namespaceOrDictionaries
   * @param dictionaries
   */
  setDictionaries(
    namespaceOrDictionaries: string | LocalizerDictionaries | undefined,
    dictionaries?: LocalizerDictionaries,
  ) {
    let namespace: string | undefined;
    if (arguments.length === 2) {
      namespace = namespaceOrDictionaries as string;
      dictionaries = dictionaries as LocalizerDictionaries;
    } else {
      dictionaries = namespaceOrDictionaries as LocalizerDictionaries;
    }
    const ns = namespace ?? LOCALIZER_ROOT_NAMESPACE;
    this.nsDictionaries.set(ns, dictionaries);
    this.detectLocale();
    return this;
  }

  /**
   * Установить справочник.
   *
   * @param locale
   * @param dictionary
   */
  setDictionary(locale: string, dictionary: LocalizerDictionary): this;

  /**
   * Установить справочник.
   *
   * @param locale
   * @param dictionary
   * @param namespace
   */
  setDictionary(
    namespace: string,
    locale: string,
    dictionary: LocalizerDictionary,
  ): this;

  /**
   * Установить справочник.
   *
   * @param locale
   * @param dictionary
   * @param namespace
   */
  setDictionary(
    namespace: string | undefined,
    locale: string,
    dictionary: LocalizerDictionary,
  ): this;

  /**
   * Установить справочник.
   *
   * @param locale
   * @param dictionary
   * @param namespace
   */
  setDictionary(
    namespaceOrLocale: string | undefined,
    localeOrDictionary: string | LocalizerDictionary,
    dictionary?: LocalizerDictionary,
  ) {
    let namespace: string | undefined, locale: string;
    if (arguments.length === 3) {
      namespace = namespaceOrLocale;
      locale = localeOrDictionary as string;
      dictionary = dictionary as LocalizerDictionary;
    } else {
      locale = namespaceOrLocale as string;
      dictionary = localeOrDictionary as LocalizerDictionary;
    }
    const ns = namespace ?? LOCALIZER_ROOT_NAMESPACE;
    const dicts = this.nsDictionaries.get(ns) || {};
    dicts[locale] = dictionary;
    this.nsDictionaries.set(ns, dicts);
    this.detectLocale();
    return this;
  }

  /**
   * Добавить справочники.
   *
   * @param dictionaries
   */
  addDictionaries(dictionaries: LocalizerDictionaries): this;

  /**
   * Добавить справочники.
   *
   * @param dictionaries
   * @param namespace
   */
  addDictionaries(namespace: string, dictionaries: LocalizerDictionaries): this;

  /**
   * Добавить справочники.
   *
   * @param dictionaries
   * @param namespace
   */
  addDictionaries(
    namespace: string | undefined,
    dictionaries: LocalizerDictionaries,
  ): this;

  /**
   * Добавить справочники.
   *
   * @param dictionaries
   * @param namespace
   */
  addDictionaries(
    namespaceOrDictionaries: string | LocalizerDictionaries | undefined,
    dictionaries?: LocalizerDictionaries,
  ) {
    let namespace: string | undefined;
    if (arguments.length === 2) {
      namespace = namespaceOrDictionaries as string;
      dictionaries = dictionaries as LocalizerDictionaries;
    } else {
      dictionaries = namespaceOrDictionaries as LocalizerDictionaries;
    }
    Object.keys(dictionaries).forEach(locale => {
      this.addDictionary(namespace, locale, dictionaries[locale]);
    });
    this.detectLocale();
    return this;
  }

  /**
   * Добавить справочник.
   *
   * @param locale
   * @param dictionary
   */
  addDictionary(locale: string, dictionary: LocalizerDictionary): this;

  /**
   * Добавить справочник.
   *
   * @param locale
   * @param dictionary
   * @param namespace
   */
  addDictionary(
    namespace: string,
    locale: string,
    dictionary: LocalizerDictionary,
  ): this;

  /**
   * Добавить справочник.
   *
   * @param locale
   * @param dictionary
   * @param namespace
   */
  addDictionary(
    namespace: string | undefined,
    locale: string,
    dictionary: LocalizerDictionary,
  ): this;

  /**
   * Добавить справочник.
   *
   * @param locale
   * @param dictionary
   * @param namespace
   */
  addDictionary(
    namespaceOrLocale: string | undefined,
    localeOrDictionary: string | LocalizerDictionary,
    dictionary?: LocalizerDictionary,
  ) {
    let namespace: string | undefined, locale: string;
    if (arguments.length === 3) {
      namespace = namespaceOrLocale;
      locale = localeOrDictionary as string;
      dictionary = dictionary as LocalizerDictionary;
    } else {
      locale = namespaceOrLocale as string;
      dictionary = localeOrDictionary as LocalizerDictionary;
    }
    const ns = namespace ?? LOCALIZER_ROOT_NAMESPACE;
    const dicts = this.nsDictionaries.get(ns) || {};
    dicts[locale] = dicts[locale] || {};
    Object.assign(dicts[locale], dictionary);
    this.nsDictionaries.set(ns, dicts);
    this.detectLocale();
    return this;
  }

  /**
   * Определить подходящую локаль.
   *
   * @param resetForcedLocale
   */
  detectLocale(resetForcedLocale?: boolean): string {
    const availableLocales = this.getAvailableLocales();
    let detected: string | undefined;
    for (const source of this.options.detectionOrder) {
      detected = this.detectLocaleFromSource(availableLocales, source);
      if (detected) break;
    }
    // определяем финальную локаль с учетом fallback'а
    let finalLocale: string | undefined = detected;
    const fallback = this.options.fallbackLocale;
    if (!finalLocale) {
      if (fallback && availableLocales.includes(fallback)) {
        finalLocale = fallback;
      } else if (availableLocales.length) {
        // если нет даже fallback'а, берем первый доступный
        finalLocale = availableLocales[0];
      } else {
        finalLocale = fallback;
      }
    }
    this.detectedLocale = finalLocale;
    if (resetForcedLocale) this.resetForcedLocale();
    return finalLocale;
  }

  /**
   * Найти подходящую локаль среди доступных, включая базовый язык.
   *
   * @param candidate
   * @param availableLocales
   */
  protected findSupportedLocale(
    candidate: string,
    availableLocales: string[],
  ): string | undefined {
    if (!candidate) return;
    // en-US,en;q=0.9,zh-CN;q=0.8,zh; -> en-US
    const exactLang = candidate.split(',')[0];
    const normalizedCandidate = exactLang.toLowerCase();
    const exactMatch = availableLocales.find(
      l => l.toLowerCase() === normalizedCandidate,
    );
    if (exactMatch) return exactMatch;
    // en_US -> de, en-US -> en
    const baseLang = normalizedCandidate.split('-')[0].split('_')[0];
    const baseMatch = availableLocales.find(l => l.toLowerCase() === baseLang);
    if (baseMatch) return baseMatch;
    return;
  }

  /**
   * Определить локаль по источнику.
   *
   * @param availableLocales
   * @param source
   * @param options
   */
  protected detectLocaleFromSource(
    availableLocales: string[],
    source: DetectionSource,
  ): string | undefined {
    if (typeof window === 'undefined') {
      if (BROWSER_LOCALE_SOURCES.includes(source)) {
        return;
      }
    }
    let candidate: string | undefined;
    switch (source) {
      case DetectionSource.REQUEST_HEADER: {
        if (!this.request) break;
        const headerName = this.options.requestHeaderName.toLocaleLowerCase();
        const headerValue = this.request.headers[headerName];
        if (headerValue && typeof headerValue === 'string') {
          candidate = headerValue;
        }
        break;
      }
      case DetectionSource.URL_PATH: {
        const index = this.options.urlPathIndex;
        const segments = window.location.pathname
          .replace(/^\/|\/$/g, '')
          .split('/');
        if (segments.length > index && segments[index])
          candidate = segments[index];
        break;
      }
      case DetectionSource.QUERY: {
        const key = this.options.queryStringKey ?? 'lang';
        const params = new URLSearchParams(window.location.search);
        candidate = params.get(key) ?? undefined;
        break;
      }
      case DetectionSource.LOCAL_STORAGE: {
        const key = this.options.localStorageKey ?? 'language';
        candidate = window.localStorage.getItem(key) ?? undefined;
        break;
      }
      case DetectionSource.HTML_TAG: {
        candidate = document.documentElement.getAttribute('lang') ?? undefined;
        break;
      }
      case DetectionSource.NAVIGATOR: {
        candidate = navigator.languages?.[0] ?? undefined;
        break;
      }
      case DetectionSource.ENV: {
        if (
          typeof process === 'undefined' ||
          !process.env ||
          typeof process.env !== 'object'
        ) {
          break;
        }
        const envLang =
          process.env.LANG ||
          process.env.LANGUAGE ||
          process.env.LC_MESSAGES ||
          process.env.LC_ALL;
        // формат может быть 'ru_RU.UTF-8', извлекаем 'ru_RU'
        candidate = envLang ? envLang.split('.')[0] : undefined;
        break;
      }
    }
    if (candidate) return this.findSupportedLocale(candidate, availableLocales);
  }

  /**
   * Найти и сформировать перевод по ключу из справочника.
   *
   * @param key
   * @param args
   */
  t(key: string, ...args: unknown[]) {
    const ns = this.getNamespace();
    const locale = this.getLocale();
    const fallbackLocale = this.options.fallbackLocale;
    // ns + locale
    let dict = this.getDictionary(ns, locale);
    let entry = dict[key];
    if (!entry) {
      // ns + fallback
      dict = this.getDictionary(ns, fallbackLocale);
      entry = dict[key];
      if (!entry) {
        if (LOCALIZER_ROOT_NAMESPACE !== ns) {
          // root + locale
          dict = this.getDictionary(locale);
          entry = dict[key];
          if (!entry) {
            // root + fallback
            dict = this.getDictionary(fallbackLocale);
            entry = dict[key];
            if (!entry) {
              return this.format(key, ...args);
            }
          }
        } else {
          return this.format(key, ...args);
        }
      }
    }
    if (typeof entry === 'string') return this.format(entry, ...args);
    if (typeof entry !== 'object') return this.format(key, ...args);
    const res = this.formatNumerableEntry(entry, args);
    if (!res) return this.format(key, ...args);
    return res;
  }

  /**
   * Сформировать запись для множественных чисел.
   *
   * @param entry
   * @param args
   */
  protected formatNumerableEntry(
    entry: LocalizerNumerableEntry,
    args: unknown[],
  ) {
    const one = entry.one || undefined;
    const few = entry.few || undefined;
    const many = entry.many || undefined;
    const fallback = one || few || many || '';
    const numArg = args.find(v => typeof v === 'number');
    if (typeof numArg === 'number') {
      let pattern = numWords(numArg, one || '', few, many);
      if (!pattern) pattern = numWords(numArg, fallback);
      if (!pattern) return fallback;
      return this.format(pattern, ...args);
    }
    if (!fallback) return '';
    return this.format(fallback, ...args);
  }

  /**
   * Извлечь и форматировать перевод из объекта для текущей локали.
   *
   * @param obj
   * @param args
   */
  o(obj: LangObject, ...args: unknown[]): string {
    let locale = this.getLocale();
    let entry = obj[locale];
    if (!entry) {
      locale = this.options.fallbackLocale;
      entry = obj[locale];
    }
    if (entry == null) {
      const firstAvailableKey = Object.keys(obj).find(
        key => obj[key] !== undefined,
      );
      if (firstAvailableKey) {
        entry = obj[firstAvailableKey];
      }
    }
    if (entry == null) return '';
    if (typeof entry === 'object' && entry != null) {
      return (
        this.formatNumerableEntry(entry as LocalizerNumerableEntry, args) ?? ''
      );
    }
    if (typeof entry === 'string') {
      return this.format(entry, ...args);
    }
    return '';
  }

  /**
   * Format.
   *
   * @param pattern
   * @param args
   */
  protected format(pattern: string, ...args: unknown[]) {
    if (/%[sdjvl]/.test(pattern)) {
      return format(pattern, ...args);
    } else {
      return pattern;
    }
  }
}
