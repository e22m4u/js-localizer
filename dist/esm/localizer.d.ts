import { Service } from '@e22m4u/js-service';
import { IncomingMessage } from './http-polyfill.js';
import { ServiceContainer } from '@e22m4u/js-service';
/**
 * Lang object.
 */
export type LangObject = Record<string, LocalizerEntry>;
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
export declare const DEFAULT_DETECTION_ORDER: DetectionSource[];
/**
 * Browser locale sources.
 */
export declare const BROWSER_LOCALE_SOURCES: DetectionSource[];
/**
 * Localizer initial state.
 */
export declare const LOCALIZER_INITIAL_STATE: LocalizerState;
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
export declare class Localizer extends Service {
    /**
     * Localizer state.
     */
    protected state: LocalizerState;
    /**
     * Constructor.
     *
     * @param containerOrOptions
     * @param options
     */
    constructor(containerOrOptions?: ServiceContainer | LocalizerOptions, options?: LocalizerOptions);
    /**
     * Get state.
     */
    getState(): LocalizerState;
    /**
     * Get http request.
     */
    getHttpRequest(): import("http").IncomingMessage | undefined;
    /**
     * Получить локаль.
     */
    getLocale(): string;
    /**
     * Установить локаль принудительно.
     *
     * @param locale
     */
    setLocale(locale: string): this;
    /**
     * Сбросить принудительную локаль.
     */
    resetLocale(): this;
    /**
     * Клонирование экземпляра.
     *
     * @param options
     */
    clone(options?: LocalizerOptions): Localizer;
    /**
     * Клонирование экземпляра с новой локалью.
     *
     * @param locale
     */
    withLocale(locale: string): Localizer;
    /**
     * Клонирование экземпляра с локалью из заголовка запроса.
     *
     * @param req
     */
    withHttpRequest(req: IncomingMessage): Localizer;
    /**
     * Получить доступные локали.
     */
    getAvailableLocales(): string[];
    /**
     * Получить справочники.
     */
    getDictionaries(): LocalizerDictionaries;
    /**
     * Получить справочник.
     *
     * @param locale
     */
    getDictionary(locale: string): LocalizerDictionary;
    /**
     * Установить справочники.
     *
     * @param dictionaries
     */
    setDictionaries(dictionaries: LocalizerDictionaries): this;
    /**
     * Установить справочник.
     *
     * @param locale
     * @param dictionary
     */
    setDictionary(locale: string, dictionary: LocalizerDictionary): this;
    /**
     * Добавить справочники.
     *
     * @param dictionaries
     */
    addDictionaries(dictionaries: LocalizerDictionaries): this;
    /**
     * Добавить справочник.
     *
     * @param locale
     * @param dictionary
     */
    addDictionary(locale: string, dictionary: LocalizerDictionary): this;
    /**
     * Определить подходящую локаль.
     *
     * @param noResetLocale
     */
    detectLocale(noResetLocale?: boolean): string;
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
