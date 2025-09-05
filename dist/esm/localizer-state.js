/**
 * Detection source.
 */
export const DetectionSource = {
    URL_PATH: 'urlPath',
    QUERY: 'query',
    LOCAL_STORAGE: 'localStorage',
    HTML_TAG: 'htmlTag',
    NAVIGATOR: 'navigator',
    ENV: 'env',
};
/**
 * Default detection order.
 */
export const DEFAULT_DETECTION_ORDER = [
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
export const DEFAULT_LOCALIZER_OPTIONS = {
    locales: [],
    fallbackLocale: DEFAULT_FALLBACK_LOCALE,
    lookupUrlPathIndex: 0,
    lookupQueryStringKey: 'lang',
    lookupLocalStorageKey: 'language',
    detectionOrder: DEFAULT_DETECTION_ORDER,
    dictionaries: {},
};
/**
 * Localizer state.
 */
export class LocalizerState {
    dictionaries;
    currentLocale;
    /**
     * Localizer options.
     */
    options = JSON.parse(JSON.stringify(DEFAULT_LOCALIZER_OPTIONS));
    /**
     * Constructor.
     *
     * @param options
     * @param dictionaries
     * @param currentLocale
     */
    constructor(options = {}, dictionaries = {}, currentLocale) {
        this.dictionaries = dictionaries;
        this.currentLocale = currentLocale;
        if (options?.dictionaries)
            this.dictionaries = {
                ...this.dictionaries,
                ...options.dictionaries,
            };
        const filteredOptions = Object.fromEntries(Object.entries(options).filter(([, value]) => value != null));
        this.options = Object.assign(this.options, filteredOptions);
    }
    /**
     * Clone with locale.
     *
     * @param locale
     */
    cloneWithLocale(locale) {
        return new LocalizerState(JSON.parse(JSON.stringify(this.options)), JSON.parse(JSON.stringify(this.dictionaries)), locale);
    }
    /**
     * Get available locales.
     */
    getAvailableLocales() {
        return Array.from(new Set([
            ...(this.options.locales ?? []),
            ...Object.keys(this.dictionaries),
        ]));
    }
}
