/**
 * Detection source.
 */
export declare const DetectionSource: {
    URL_PATH: "urlPath";
    QUERY: "query";
    LOCAL_STORAGE: "localStorage";
    HTML_TAG: "htmlTag";
    NAVIGATOR: "navigator";
    ENV: "env";
};
/**
 * Type of DetectionSource.
 */
export type DetectionSource = (typeof DetectionSource)[keyof typeof DetectionSource];
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
 * Default detection order.
 */
export declare const DEFAULT_DETECTION_ORDER: DetectionSource[];
/**
 * Default fallback locale.
 */
export declare const DEFAULT_FALLBACK_LOCALE = "en";
/**
 * Default localizer options.
 */
export declare const DEFAULT_LOCALIZER_OPTIONS: LocalizerOptions;
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
export declare class LocalizerState {
    dictionaries: LocalizerDictionaries;
    currentLocale?: string | undefined;
    /**
     * Localizer options.
     */
    options: LocalizerOptions;
    /**
     * Constructor.
     *
     * @param options
     * @param dictionaries
     * @param currentLocale
     */
    constructor(options?: Partial<LocalizerOptions>, dictionaries?: LocalizerDictionaries, currentLocale?: string | undefined);
    /**
     * Clone.
     */
    clone(): LocalizerState;
    /**
     * Clone with locale.
     *
     * @param locale
     */
    cloneWithLocale(locale: string): LocalizerState;
    /**
     * Get available locales.
     */
    getAvailableLocales(): string[];
}
