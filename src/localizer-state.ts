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
  fallbackLocale: string;
  lookupUrlPathIndex: number;
  lookupQueryStringKey: string;
  lookupLocalStorageKey: string;
  detectionOrder: DetectionSource[];
  dictionaries: LocalizerDictionaries;
};

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
  fallbackLocale: DEFAULT_FALLBACK_LOCALE,
  lookupUrlPathIndex: 0,
  lookupQueryStringKey: 'lang',
  lookupLocalStorageKey: 'language',
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
    options: Partial<LocalizerOptions> = {},
    public dictionaries: LocalizerDictionaries = {},
    public currentLocale?: string,
  ) {
    if (options?.dictionaries)
      this.dictionaries = {
        ...this.dictionaries,
        ...options.dictionaries,
      };
    const filteredOptions = Object.fromEntries(
      Object.entries(options).filter(([, value]) => value != null),
    );
    this.options = Object.assign(this.options, filteredOptions);
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
