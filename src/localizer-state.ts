import {Flatten} from './types.js';
import {removeEmptyKeys} from './utils/index.js';

/**
 * Detection source.
 */
export const DetectionSource = {
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
  locales: string[];
  defaultLocale: string | undefined;
  fallbackLocale: string;
  urlPathIndex: number;
  queryStringKey: string;
  localStorageKey: string;
  requestHeaderKey: string;
  detectionOrder: DetectionSource[];
  dictionaries: LocalizerDictionaries;
};

/**
 * Localizer options input.
 */
export type LocalizerOptionsInput = Flatten<Partial<LocalizerOptions>>;

/**
 * Default detection order.
 */
export const DEFAULT_DETECTION_ORDER: DetectionSource[] = [
  DetectionSource.URL_PATH,
  DetectionSource.QUERY,
  DetectionSource.LOCAL_STORAGE,
  DetectionSource.HTML_TAG,
  DetectionSource.NAVIGATOR,
  DetectionSource.ENV,
];

/**
 * Default fallback locale.
 */
export const DEFAULT_FALLBACK_LOCALE = 'en';

/**
 * Default localizer options.
 */
export const DEFAULT_LOCALIZER_OPTIONS: LocalizerOptions = {
  locales: [],
  defaultLocale: undefined,
  fallbackLocale: DEFAULT_FALLBACK_LOCALE,
  urlPathIndex: 0,
  queryStringKey: 'lang',
  localStorageKey: 'language',
  requestHeaderKey: 'accept-language',
  detectionOrder: DEFAULT_DETECTION_ORDER,
  dictionaries: {},
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
 * Localizer state.
 */
export class LocalizerState {
  /**
   * Localizer options.
   */
  options: LocalizerOptions = JSON.parse(
    JSON.stringify(DEFAULT_LOCALIZER_OPTIONS),
  );

  /**
   * Constructor.
   *
   * @param options
   * @param dictionaries
   * @param currentLocale
   */
  constructor(
    options: LocalizerOptionsInput = {},
    public dictionaries: LocalizerDictionaries = {},
    public currentLocale?: string,
  ) {
    // установка справочников (при наличии)
    if (options?.dictionaries)
      this.dictionaries = {
        ...this.dictionaries,
        ...options.dictionaries,
      };
    // установка опций имеющих не пустые значения
    const filteredOptions = removeEmptyKeys(options);
    this.options = Object.assign(this.options, filteredOptions);
    // переопределение текущей локали согласно опции "defaultLocale"
    if (this.options.defaultLocale && !currentLocale)
      this.currentLocale = this.options.defaultLocale;
  }

  /**
   * Clone.
   */
  clone() {
    return new LocalizerState(
      JSON.parse(JSON.stringify(this.options)),
      JSON.parse(JSON.stringify(this.dictionaries)),
      this.currentLocale,
    );
  }

  /**
   * Clone with locale.
   *
   * @param locale
   */
  cloneWithLocale(locale: string) {
    return new LocalizerState(
      JSON.parse(JSON.stringify(this.options)),
      JSON.parse(JSON.stringify(this.dictionaries)),
      locale,
    );
  }

  /**
   * Get available locales.
   */
  getAvailableLocales(): string[] {
    return Array.from(
      new Set([
        ...(this.options.locales ?? []),
        ...Object.keys(this.dictionaries),
      ]),
    );
  }
}
