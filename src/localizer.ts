import {format} from '@e22m4u/js-format';
import type {IncomingMessage} from 'http';
import {assignDeep} from './utils/index.js';
import {numWords} from './utils/num-words.js';
import {ServiceContainer} from '@e22m4u/js-service';
import {isServiceContainer} from '@e22m4u/js-service';
import {Constructor, Service} from '@e22m4u/js-service';

/**
 * Lang object.
 */
export type LangObject = Record<string, LocalizerEntry>;

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
 * Localizer state.
 */
export type LocalizerState = {
  supportedLocales: string[];
  fallbackLocale: string;
  detectedLocale: string | undefined;
  forcedLocale: string | undefined;
  urlPathIndex: number;
  queryStringKey: string;
  localStorageKey: string;
  requestHeaderName: string;
  detectionOrder: DetectionSource[];
  dictionaries: LocalizerDictionaries;
  httpRequest: IncomingMessage | undefined;
};

/**
 * Localizer options.
 */
export type LocalizerOptions = Partial<LocalizerState>;

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
 * Localizer initial state.
 */
export const LOCALIZER_INITIAL_STATE: LocalizerState = {
  supportedLocales: [],
  fallbackLocale: 'en',
  detectedLocale: undefined,
  forcedLocale: undefined,
  urlPathIndex: 0,
  queryStringKey: 'lang',
  localStorageKey: 'language',
  requestHeaderName: 'accept-language',
  detectionOrder: DEFAULT_DETECTION_ORDER,
  dictionaries: {},
  httpRequest: undefined,
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
 * Localizer.
 */
export class Localizer extends Service {
  /**
   * Localizer state.
   */
  protected state: LocalizerState = structuredClone(LOCALIZER_INITIAL_STATE);

  /**
   * Constructor.
   *
   * @param containerOrOptions
   * @param options
   */
  constructor(
    containerOrOptions?: ServiceContainer | LocalizerOptions,
    options?: LocalizerOptions,
  ) {
    if (isServiceContainer(containerOrOptions)) {
      super(containerOrOptions);
    } else {
      super();
      options = containerOrOptions;
    }
    if (options) {
      const optionsClone: LocalizerOptions = structuredClone({
        ...options,
        httpRequest: undefined,
      });
      optionsClone.httpRequest = options.httpRequest;
      Object.assign(this.state, optionsClone);
    }
  }

  /**
   * Get state.
   */
  getState() {
    const state: LocalizerState = structuredClone({
      ...this.state,
      httpRequest: undefined,
    });
    state.httpRequest = this.state.httpRequest;
    return state;
  }

  /**
   * Get http request.
   */
  getHttpRequest() {
    if (this.state.httpRequest) {
      return this.state.httpRequest;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const servicesMap = (this.container as any)['_services'] as Map<
      unknown,
      unknown
    >;
    const servicesCtors = Array.from(servicesMap.keys());
    const requestCtor = servicesCtors.find(
      ctor => typeof ctor === 'function' && ctor.name === 'IncomingMessage',
    ) as Constructor;
    if (requestCtor && this.hasService(requestCtor)) {
      return this.getService(requestCtor) as IncomingMessage;
    }
  }

  /**
   * Получить локаль.
   */
  getLocale(): string {
    if (this.state.forcedLocale) return this.state.forcedLocale;
    if (this.state.detectedLocale) return this.state.detectedLocale;
    this.detectLocale(true);
    return this.state.detectedLocale ?? this.state.fallbackLocale;
  }

  /**
   * Установить локаль принудительно.
   *
   * @param locale
   */
  setLocale(locale: string): this {
    this.state.forcedLocale = locale;
    return this;
  }

  /**
   * Сбросить принудительную локаль.
   */
  resetLocale() {
    this.state.forcedLocale = undefined;
    return this;
  }

  /**
   * Клонирование экземпляра.
   *
   * @param options
   */
  clone(options?: LocalizerOptions) {
    const newState = this.getState();
    Object.assign(newState, options);
    return new Localizer(this.container, newState);
  }

  /**
   * Клонирование экземпляра с новой локалью.
   *
   * @param locale
   */
  withLocale(locale: string) {
    const inst = this.clone();
    inst.setLocale(locale);
    return inst;
  }

  /**
   * Клонирование экземпляра с локалью из заголовка запроса.
   *
   * @param req
   */
  withHttpRequest(req: IncomingMessage) {
    const inst = this.clone({httpRequest: req, detectedLocale: undefined});
    return inst;
  }

  /**
   * Получить доступные локали.
   */
  getAvailableLocales(): string[] {
    const locales = new Set([
      ...Object.keys(this.state.dictionaries),
      ...this.state.supportedLocales,
    ]);
    if (this.state.forcedLocale) locales.add(this.state.forcedLocale);
    return Array.from(locales);
  }

  /**
   * Получить справочники.
   */
  getDictionaries(): LocalizerDictionaries {
    return structuredClone(this.state.dictionaries);
  }

  /**
   * Получить справочник.
   *
   * @param locale
   */
  getDictionary(locale: string): LocalizerDictionary {
    const dicts = this.state.dictionaries;
    return dicts[locale] ? structuredClone(dicts[locale]) : {};
  }

  /**
   * Установить справочники.
   *
   * @param dictionaries
   */
  setDictionaries(dictionaries: LocalizerDictionaries) {
    this.state.dictionaries = dictionaries;
    this.state.detectedLocale = undefined;
    return this;
  }

  /**
   * Установить справочник.
   *
   * @param locale
   * @param dictionary
   */
  setDictionary(locale: string, dictionary: LocalizerDictionary) {
    this.state.dictionaries[locale] = dictionary;
    this.state.detectedLocale = undefined;
    return this;
  }

  /**
   * Добавить справочники.
   *
   * @param dictionaries
   */
  addDictionaries(dictionaries: LocalizerDictionaries) {
    assignDeep(this.state.dictionaries, dictionaries);
    this.state.detectedLocale = undefined;
    return this;
  }

  /**
   * Добавить справочник.
   *
   * @param locale
   * @param dictionary
   */
  addDictionary(locale: string, dictionary: LocalizerDictionary) {
    this.state.dictionaries[locale] = this.state.dictionaries[locale] ?? {};
    assignDeep(this.state.dictionaries[locale], dictionary);
    this.state.detectedLocale = undefined;
    return this;
  }

  /**
   * Определить подходящую локаль.
   *
   * @param noResetLocale
   */
  detectLocale(noResetLocale?: boolean): string {
    const availableLocales = this.getAvailableLocales();
    let detected: string | undefined;
    for (const source of this.state.detectionOrder) {
      detected = this.detectLocaleFromSource(availableLocales, source);
      if (detected) break;
    }
    // определяем финальную локаль с учетом fallback'а
    let finalLocale: string | undefined = detected;
    const fallback = this.state.fallbackLocale;
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
    this.state.detectedLocale = finalLocale;
    if (!noResetLocale) this.resetLocale();
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
        const httpRequest = this.getHttpRequest();
        if (!httpRequest) break;
        const headerName = this.state.requestHeaderName.toLocaleLowerCase();
        const headerValue = httpRequest.headers[headerName];
        if (headerValue && typeof headerValue === 'string') {
          candidate = headerValue;
        }
        break;
      }
      case DetectionSource.URL_PATH: {
        const index = this.state.urlPathIndex;
        const segments = window.location.pathname
          .replace(/^\/|\/$/g, '')
          .split('/');
        if (segments.length > index && segments[index])
          candidate = segments[index];
        break;
      }
      case DetectionSource.QUERY: {
        const key = this.state.queryStringKey;
        const params = new URLSearchParams(window.location.search);
        candidate = params.get(key) ?? undefined;
        break;
      }
      case DetectionSource.LOCAL_STORAGE: {
        const key = this.state.localStorageKey;
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
    const locale = this.getLocale();
    const fallbackLocale = this.state.fallbackLocale;
    let dict = this.state.dictionaries[locale] ?? {};
    let entry = dict[key];
    if (!entry) {
      dict = this.state.dictionaries[fallbackLocale] ?? {};
      entry = dict[key];
      if (!entry) {
        return this.format(key, ...args);
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
      locale = this.state.fallbackLocale;
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
