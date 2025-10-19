import { format } from '@e22m4u/js-format';
import { Service } from '@e22m4u/js-service';
import { assignDeep } from './utils/index.js';
import { numWords } from './utils/num-words.js';
import { IncomingMessage } from './incoming-message.js';
import { isServiceContainer } from '@e22m4u/js-service';
/**
 * Detection source.
 */
export const DetectionSource = {
    REQUEST_HEADER: 'requestHeader',
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
export const BROWSER_LOCALE_SOURCES = [
    DetectionSource.URL_PATH,
    DetectionSource.QUERY,
    DetectionSource.LOCAL_STORAGE,
    DetectionSource.NAVIGATOR,
    DetectionSource.HTML_TAG,
];
/**
 * Localizer initial state.
 */
export const LOCALIZER_INITIAL_STATE = {
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
 * Localizer.
 */
export class Localizer extends Service {
    /**
     * Localizer state.
     */
    state = structuredClone(LOCALIZER_INITIAL_STATE);
    /**
     * Constructor.
     *
     * @param containerOrOptions
     * @param options
     */
    constructor(containerOrOptions, options) {
        if (isServiceContainer(containerOrOptions)) {
            super(containerOrOptions);
        }
        else {
            super();
            options = containerOrOptions;
        }
        if (options) {
            const optionsClone = structuredClone({
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
        const state = structuredClone({
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
        if (this.hasService(IncomingMessage)) {
            return this.getService(IncomingMessage);
        }
    }
    /**
     * Получить локаль.
     */
    getLocale() {
        if (this.state.forcedLocale)
            return this.state.forcedLocale;
        if (this.state.detectedLocale)
            return this.state.detectedLocale;
        this.detectLocale(true);
        return this.state.detectedLocale ?? this.state.fallbackLocale;
    }
    /**
     * Установить локаль принудительно.
     *
     * @param locale
     */
    setLocale(locale) {
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
    clone(options) {
        const newState = this.getState();
        Object.assign(newState, options);
        return new Localizer(this.container, newState);
    }
    /**
     * Клонирование экземпляра с новой локалью.
     *
     * @param locale
     */
    withLocale(locale) {
        const inst = this.clone();
        inst.setLocale(locale);
        return inst;
    }
    /**
     * Клонирование экземпляра с локалью из заголовка запроса.
     *
     * @param req
     */
    withHttpRequest(req) {
        const inst = this.clone({ httpRequest: req, detectedLocale: undefined });
        return inst;
    }
    /**
     * Получить доступные локали.
     */
    getAvailableLocales() {
        const locales = new Set([
            ...Object.keys(this.state.dictionaries),
            ...this.state.supportedLocales,
        ]);
        if (this.state.forcedLocale)
            locales.add(this.state.forcedLocale);
        return Array.from(locales);
    }
    /**
     * Получить справочники.
     */
    getDictionaries() {
        return structuredClone(this.state.dictionaries);
    }
    /**
     * Получить справочник.
     *
     * @param locale
     */
    getDictionary(locale) {
        const dicts = this.state.dictionaries;
        return dicts[locale] ? structuredClone(dicts[locale]) : {};
    }
    /**
     * Установить справочники.
     *
     * @param dictionaries
     */
    setDictionaries(dictionaries) {
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
    setDictionary(locale, dictionary) {
        this.state.dictionaries[locale] = dictionary;
        this.state.detectedLocale = undefined;
        return this;
    }
    /**
     * Добавить справочники.
     *
     * @param dictionaries
     */
    addDictionaries(dictionaries) {
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
    addDictionary(locale, dictionary) {
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
    detectLocale(noResetLocale) {
        const availableLocales = this.getAvailableLocales();
        let detected;
        for (const source of this.state.detectionOrder) {
            detected = this.detectLocaleFromSource(availableLocales, source);
            if (detected)
                break;
        }
        // определяем финальную локаль с учетом fallback'а
        let finalLocale = detected;
        const fallback = this.state.fallbackLocale;
        if (!finalLocale) {
            if (fallback && availableLocales.includes(fallback)) {
                finalLocale = fallback;
            }
            else if (availableLocales.length) {
                // если нет даже fallback'а, берем первый доступный
                finalLocale = availableLocales[0];
            }
            else {
                finalLocale = fallback;
            }
        }
        this.state.detectedLocale = finalLocale;
        if (!noResetLocale)
            this.resetLocale();
        return finalLocale;
    }
    /**
     * Найти подходящую локаль среди доступных, включая базовый язык.
     *
     * @param candidate
     * @param availableLocales
     */
    findSupportedLocale(candidate, availableLocales) {
        if (!candidate)
            return;
        // en-US,en;q=0.9,zh-CN;q=0.8,zh; -> en-US
        const exactLang = candidate.split(',')[0];
        const normalizedCandidate = exactLang.toLowerCase();
        const exactMatch = availableLocales.find(l => l.toLowerCase() === normalizedCandidate);
        if (exactMatch)
            return exactMatch;
        // en_US -> de, en-US -> en
        const baseLang = normalizedCandidate.split('-')[0].split('_')[0];
        const baseMatch = availableLocales.find(l => l.toLowerCase() === baseLang);
        if (baseMatch)
            return baseMatch;
        return;
    }
    /**
     * Определить локаль по источнику.
     *
     * @param availableLocales
     * @param source
     * @param options
     */
    detectLocaleFromSource(availableLocales, source) {
        if (typeof window === 'undefined') {
            if (BROWSER_LOCALE_SOURCES.includes(source)) {
                return;
            }
        }
        let candidate;
        switch (source) {
            case DetectionSource.REQUEST_HEADER: {
                const httpRequest = this.getHttpRequest();
                if (!httpRequest)
                    break;
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
                if (typeof process === 'undefined' ||
                    !process.env ||
                    typeof process.env !== 'object') {
                    break;
                }
                const envLang = process.env.LANG ||
                    process.env.LANGUAGE ||
                    process.env.LC_MESSAGES ||
                    process.env.LC_ALL;
                // формат может быть 'ru_RU.UTF-8', извлекаем 'ru_RU'
                candidate = envLang ? envLang.split('.')[0] : undefined;
                break;
            }
        }
        if (candidate)
            return this.findSupportedLocale(candidate, availableLocales);
    }
    /**
     * Найти и сформировать перевод по ключу из справочника.
     *
     * @param key
     * @param args
     */
    t(key, ...args) {
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
        if (typeof entry === 'string')
            return this.format(entry, ...args);
        if (typeof entry !== 'object')
            return this.format(key, ...args);
        const res = this.formatNumerableEntry(entry, args);
        if (!res)
            return this.format(key, ...args);
        return res;
    }
    /**
     * Сформировать запись для множественных чисел.
     *
     * @param entry
     * @param args
     */
    formatNumerableEntry(entry, args) {
        const one = entry.one || undefined;
        const few = entry.few || undefined;
        const many = entry.many || undefined;
        const fallback = one || few || many || '';
        const numArg = args.find(v => typeof v === 'number');
        if (typeof numArg === 'number') {
            let pattern = numWords(numArg, one || '', few, many);
            if (!pattern)
                pattern = numWords(numArg, fallback);
            if (!pattern)
                return fallback;
            return this.format(pattern, ...args);
        }
        if (!fallback)
            return '';
        return this.format(fallback, ...args);
    }
    /**
     * Извлечь и форматировать перевод из объекта для текущей локали.
     *
     * @param obj
     * @param args
     */
    o(obj, ...args) {
        let locale = this.getLocale();
        let entry = obj[locale];
        if (!entry) {
            locale = this.state.fallbackLocale;
            entry = obj[locale];
        }
        if (entry == null) {
            const firstAvailableKey = Object.keys(obj).find(key => obj[key] !== undefined);
            if (firstAvailableKey) {
                entry = obj[firstAvailableKey];
            }
        }
        if (entry == null)
            return '';
        if (typeof entry === 'object' && entry != null) {
            return (this.formatNumerableEntry(entry, args) ?? '');
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
    format(pattern, ...args) {
        if (/%[sdjvl]/.test(pattern)) {
            return format(pattern, ...args);
        }
        else {
            return pattern;
        }
    }
}
