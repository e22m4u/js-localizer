import { removeEmptyKeys } from './utils/index.js';
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
        return new LocalizerState(JSON.parse(JSON.stringify(this.options)), JSON.parse(JSON.stringify(this.dictionaries)), this.currentLocale);
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
