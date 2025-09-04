import {format} from '@e22m4u/js-format';
import {numWords} from './utils/num-words.js';
import {LocalizerEntry} from './localizer-state.js';
import {LocalizerState} from './localizer-state.js';
import {DetectionSource} from './localizer-options.js';
import {LocalizerOptions} from './localizer-options.js';
import {LocalizerDictionary} from './localizer-state.js';
import {LocalizerNumerableEntry} from './localizer-state.js';

/**
 * Lang object.
 */
export type LangObject = Record<string, LocalizerEntry>;

/**
 * Default fallback locale.
 */
export const DEFAULT_FALLBACK_LOCALE = 'en';

/**
 * Default detection order.
 */
export const DEFAULT_DETECTION_ORDER: DetectionSource[] = [
  'urlPath',
  'query',
  'localStorage',
  'htmlTag',
  'navigator',
  'env',
];

/**
 * Browser locale sources.
 */
export const BROWSER_LOCALE_SOURCES: DetectionSource[] = [
  'urlPath',
  'query',
  'localStorage',
  'navigator',
  'htmlTag',
];

/**
 * Localizer.
 */
export class Localizer {
  /**
   * State.
   */
  readonly state: LocalizerState;

  /**
   * Конструктор класса.
   */
  constructor(optionsOrState?: LocalizerOptions | LocalizerState) {
    if (optionsOrState instanceof LocalizerState) {
      this.state = optionsOrState;
      return;
    }
    this.state = new LocalizerState(optionsOrState ?? {});
  }

  /**
   * Возвращает текущую локаль.
   */
  getLocale(): string {
    if (!this.state.currentLocale) {
      this._detectLocale();
    }
    return this.state.currentLocale ?? this.getFallbackLocale();
  }

  /**
   * Устанавливает текущую локаль.
   *
   * @param locale
   */
  setLocale(locale: string) {
    this.state.currentLocale = locale;
    return this;
  }

  /**
   * Локаль используется при неудачном определении текущей локали,
   * или при отсутствии справочника для текущей локали.
   */
  getFallbackLocale() {
    return this.state.options.fallbackLocale || DEFAULT_FALLBACK_LOCALE;
  }

  /**
   * Создаёт клон экземпляра с новой локалью.
   *
   * @param locale
   */
  cloneWithLocale(locale: string) {
    return new Localizer(this.state.cloneWithLocale(locale));
  }

  /**
   * Добавляет или заменяет справочник для указанной локали.
   *
   * @param locale
   * @param dictionary
   */
  addDictionary(locale: string, dictionary: LocalizerDictionary) {
    this.state.dictionaries[locale] = dictionary;
    return this;
  }

  /**
   * Определяет и устанавливает наиболее подходящую локаль.
   */
  protected _detectLocale(): string | undefined {
    // пытаемся найти локаль с помощью детекторов
    const availableLocales = this.state.getAvailableLocales();
    const detected = this._lookupLocale(availableLocales);
    // определяем финальную локаль с учетом fallback'а
    let finalLocale: string | undefined = detected;
    const fallback = this.getFallbackLocale();
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
    this.state.currentLocale = finalLocale;
    return finalLocale;
  }

  /**
   * Обход источников для поиска локали.
   *
   * @param availableLocales
   */
  protected _lookupLocale(availableLocales: string[]): string | undefined {
    const order = this.state.options.detectionOrder ?? DEFAULT_DETECTION_ORDER;
    for (const source of order) {
      const candidate = this._detectFromSource(source);
      if (candidate) {
        const supported = this._findSupported(candidate, availableLocales);
        if (supported) return supported;
      }
    }
    return;
  }

  /**
   * Извлекает локаль из указанного источника.
   *
   * @param source
   */
  protected _detectFromSource(source: DetectionSource): string | undefined {
    if (typeof window === 'undefined') {
      if (BROWSER_LOCALE_SOURCES.includes(source)) {
        return;
      }
    }
    switch (source) {
      case 'urlPath': {
        const index = this.state.options.lookupUrlPathIndex ?? 0;
        const segments = window.location.pathname
          .replace(/^\/|\/$/g, '')
          .split('/');
        if (segments.length > index && segments[index]) return segments[index];
        return;
      }
      case 'query': {
        const key = this.state.options.lookupQueryStringKey ?? 'lang';
        const params = new URLSearchParams(window.location.search);
        return params.get(key) ?? undefined;
      }
      case 'localStorage': {
        const key = this.state.options.lookupLocalStorageKey ?? 'language';
        return window.localStorage.getItem(key) ?? undefined;
      }
      case 'navigator': {
        return navigator.languages?.[0] ?? undefined;
      }
      case 'htmlTag': {
        return document.documentElement.getAttribute('lang') ?? undefined;
      }
      case 'env': {
        if (
          typeof process === 'undefined' ||
          !process.env ||
          typeof process.env !== 'object'
        ) {
          return;
        }
        const envLang =
          process.env.LANG ||
          process.env.LANGUAGE ||
          process.env.LC_MESSAGES ||
          process.env.LC_ALL;
        // формат может быть 'ru_RU.UTF-8', извлекаем 'ru_RU'
        return envLang ? envLang.split('.')[0] : undefined;
      }
      default:
        return;
    }
  }

  /**
   * Ищет подходящую локаль среди доступных, включая базовый язык.
   *
   * @param candidate
   * @param availableLocales
   */
  protected _findSupported(
    candidate: string,
    availableLocales: string[],
  ): string | undefined {
    if (!candidate) return;
    const normalizedCandidate = candidate.toLowerCase();
    const exactMatch = availableLocales.find(
      l => l.toLowerCase() === normalizedCandidate,
    );
    if (exactMatch) return exactMatch;
    const baseLang = normalizedCandidate.split('-')[0].split('_')[0];
    const baseMatch = availableLocales.find(l => l.toLowerCase() === baseLang);
    if (baseMatch) return baseMatch;
    return;
  }

  /**
   * Находит и форматирует перевод по ключу из справочника.
   *
   * @param key
   * @param args
   */
  t(key: string, ...args: unknown[]) {
    let locale = this.getLocale();
    let dict = this.state.dictionaries[locale];
    if (!dict) {
      locale = this.getFallbackLocale();
      dict = this.state.dictionaries[locale];
    }
    if (!dict) return format(key, ...args);
    const entry = dict[key];
    if (!entry) return format(key, ...args);
    if (typeof entry === 'string') return format(entry, ...args);
    if (typeof entry !== 'object') return format(key, ...args);
    const res = this._formatNumerableEntry(entry, args);
    if (!res) return format(key, ...args);
    return res;
  }

  /**
   * Форматирует запись для множественных чисел.
   *
   * @param entry
   * @param args
   */
  protected _formatNumerableEntry(
    entry: LocalizerNumerableEntry,
    args: unknown[],
  ) {
    const one = entry.one || '';
    const few = entry.few || '';
    const many = entry.many || '';
    const numArg = args.find(v => typeof v === 'number');
    if (typeof numArg === 'number') {
      const pattern = numWords(numArg, one, few, many);
      if (!pattern) return '';
      return format(pattern, ...args);
    }
    const pattern = one || few || many;
    if (!pattern) return '';
    return format(pattern, ...args);
  }

  /**
   * Извлекает и форматирует перевод из объекта для текущей локали.
   *
   * @param obj
   * @param args
   */
  o(obj: LangObject, ...args: unknown[]): string {
    let locale = this.getLocale();
    let entry = obj[locale];
    if (!entry) {
      locale = this.getFallbackLocale();
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
        this._formatNumerableEntry(entry as LocalizerNumerableEntry, args) ?? ''
      );
    }
    if (typeof entry === 'string') {
      return format(entry, ...args);
    }
    return '';
  }
}
