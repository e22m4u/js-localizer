import { IncomingMessage } from 'http';
/**
 * Lang object.
 */
export type LangObject = Record<string, LocalizerEntry>;
/**
 * Default localizer namespace.
 */
export declare const LOCALIZER_ROOT_NAMESPACE = "$root";
/**
 * Detection source.
 */
export declare const DetectionSource: {
    REQUEST_HEADER: "requestHeader";
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
export declare const DEFAULT_DETECTION_ORDER: DetectionSource[];
/**
 * Browser locale sources.
 */
export declare const BROWSER_LOCALE_SOURCES: DetectionSource[];
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
 * Localizer namespaced dictionaries.
 */
export type LocalizerNamespacedDictionaries = Map<string, LocalizerDictionaries>;
/**
 * Localizer.
 */
export declare class Localizer {
    /**
     * Dictionaries by namespace.
     */
    protected nsDictionaries: LocalizerNamespacedDictionaries;
    /**
     * Localizer options.
     */
    options: LocalizerOptions;
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
    constructor(options?: LocalizerOptionsInput);
    /**
     * Получить пространство имен.
     */
    getNamespace(): string | undefined;
    /**
     * Set request.
     */
    setRequest(req: IncomingMessage): this;
    /**
     * Получить локаль.
     */
    getLocale(): string;
    /**
     * Сбросить принудительную локаль.
     */
    resetForcedLocale(): this;
    /**
     * Установить локаль принудительно.
     *
     * @param locale
     */
    forceLocale(locale: string): this;
    /**
     * Клонирование экземпляра.
     *
     * @param options
     */
    clone(options?: LocalizerOptionsInput): Localizer;
    /**
     * Клонирование экземпляра с новой локалью.
     *
     * @param locale
     */
    cloneWithLocale(locale: string): Localizer;
    /**
     * Клонирование экземпляра с локалью из заголовка запроса.
     *
     * @param req
     */
    cloneWithRequest(req: IncomingMessage): Localizer;
    /**
     * Clone with namespace.
     *
     * @param namespace
     */
    cloneWithNamespace(namespace: string): Localizer;
    /**
     * Получить доступные локали.
     */
    getAvailableLocales(): string[];
    /**
     * Получить справочники.
     *
     * @param namespace
     */
    getDictionaries(namespace?: string): LocalizerDictionaries;
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
    getDictionary(namespace: string | undefined, locale: string): LocalizerDictionary;
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
    setDictionaries(namespace: string | undefined, dictionaries: LocalizerDictionaries): this;
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
    setDictionary(namespace: string, locale: string, dictionary: LocalizerDictionary): this;
    /**
     * Установить справочник.
     *
     * @param locale
     * @param dictionary
     * @param namespace
     */
    setDictionary(namespace: string | undefined, locale: string, dictionary: LocalizerDictionary): this;
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
    addDictionaries(namespace: string | undefined, dictionaries: LocalizerDictionaries): this;
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
    addDictionary(namespace: string, locale: string, dictionary: LocalizerDictionary): this;
    /**
     * Добавить справочник.
     *
     * @param locale
     * @param dictionary
     * @param namespace
     */
    addDictionary(namespace: string | undefined, locale: string, dictionary: LocalizerDictionary): this;
    /**
     * Определить подходящую локаль.
     *
     * @param resetForcedLocale
     */
    detectLocale(resetForcedLocale?: boolean): string;
    /**
     * Найти подходящую локаль среди доступных, включая базовый язык.
     *
     * @param candidate
     * @param availableLocales
     */
    protected findSupportedLocale(candidate: string, availableLocales: string[]): string | undefined;
    /**
     * Определить локаль по источнику.
     *
     * @param availableLocales
     * @param source
     * @param options
     */
    protected detectLocaleFromSource(availableLocales: string[], source: DetectionSource): string | undefined;
    /**
     * Найти и сформировать перевод по ключу из справочника.
     *
     * @param key
     * @param args
     */
    t(key: string, ...args: unknown[]): string;
    /**
     * Сформировать запись для множественных чисел.
     *
     * @param entry
     * @param args
     */
    protected formatNumerableEntry(entry: LocalizerNumerableEntry, args: unknown[]): string;
    /**
     * Извлечь и форматировать перевод из объекта для текущей локали.
     *
     * @param obj
     * @param args
     */
    o(obj: LangObject, ...args: unknown[]): string;
    /**
     * Format.
     *
     * @param pattern
     * @param args
     */
    protected format(pattern: string, ...args: unknown[]): string;
}
