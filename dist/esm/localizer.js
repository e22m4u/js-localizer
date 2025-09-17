import { format } from '@e22m4u/js-format';
import { numWords } from './utils/num-words.js';
import { LocalizerState } from './localizer-state.js';
import { detectLocaleFromSource } from './detectors/index.js';
import { detectLocaleFromRequestHeader } from './detectors/index.js';
/**
 * Localizer.
 */
export class Localizer {
    /**
     * State.
     */
    state;
    /**
     * Options.
     */
    get options() {
        return this.state.options;
    }
    /**
     * Конструктор класса.
     */
    constructor(optionsOrState) {
        if (optionsOrState instanceof LocalizerState) {
            this.state = optionsOrState;
        }
        else {
            this.state = new LocalizerState(optionsOrState);
        }
    }
    /**
     * Get locale.
     */
    getLocale() {
        if (!this.state.currentLocale)
            this.state.currentLocale = this._detectSupportedLocale();
        return (this.state.currentLocale ??
            this.options.defaultLocale ??
            this.options.fallbackLocale);
    }
    /**
     * Устанавливает текущую локаль.
     *
     * @param locale
     */
    setLocale(locale) {
        this.state.currentLocale = locale;
        return this;
    }
    /**
     * Клонирование экземпляра.
     */
    clone() {
        return new Localizer(this.state.clone());
    }
    /**
     * Клонирование экземпляра с новой локалью.
     *
     * @param locale
     */
    cloneWithLocale(locale) {
        return new Localizer(this.state.cloneWithLocale(locale));
    }
    /**
     * Клонирование экземпляра с локалью из заголовка запроса.
     *
     * @param req
     */
    cloneWithLocaleFromRequest(req) {
        const locale = detectLocaleFromRequestHeader(this.state.getAvailableLocales(), req.headers, this.options.requestHeaderKey);
        if (!locale)
            return this.clone();
        return this.cloneWithLocale(locale);
    }
    /**
     * Добавляет или заменяет справочник для указанной локали.
     *
     * @param locale
     * @param dictionary
     */
    addDictionary(locale, dictionary) {
        this.state.dictionaries[locale] = dictionary;
        return this;
    }
    /**
     * Определяет наиболее подходящую локаль.
     */
    _detectSupportedLocale() {
        const availableLocales = this.state.getAvailableLocales();
        let detected;
        for (const source of this.options.detectionOrder) {
            detected = detectLocaleFromSource(availableLocales, source, this.options);
            if (detected)
                break;
        }
        // определяем финальную локаль с учетом fallback'а
        let finalLocale = detected;
        const fallback = this.options.fallbackLocale;
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
        return finalLocale;
    }
    /**
     * Находит и форматирует перевод по ключу из справочника.
     *
     * @param key
     * @param args
     */
    t(key, ...args) {
        let locale = this.getLocale();
        let dict = this.state.dictionaries[locale];
        if (!dict) {
            locale = this.options.fallbackLocale;
            dict = this.state.dictionaries[locale];
        }
        if (!dict)
            return format(key, ...args);
        const entry = dict[key];
        if (!entry)
            return format(key, ...args);
        if (typeof entry === 'string')
            return format(entry, ...args);
        if (typeof entry !== 'object')
            return format(key, ...args);
        const res = this._formatNumerableEntry(entry, args);
        if (!res)
            return format(key, ...args);
        return res;
    }
    /**
     * Форматирует запись для множественных чисел.
     *
     * @param entry
     * @param args
     */
    _formatNumerableEntry(entry, args) {
        const one = entry.one || '';
        const few = entry.few || undefined;
        const many = entry.many || '';
        const numArg = args.find(v => typeof v === 'number');
        if (typeof numArg === 'number') {
            const pattern = numWords(numArg, one, few, many);
            if (!pattern)
                return '';
            return format(pattern, ...args);
        }
        const pattern = one || few || many;
        if (!pattern)
            return '';
        return format(pattern, ...args);
    }
    /**
     * Извлекает и форматирует перевод из объекта для текущей локали.
     *
     * @param obj
     * @param args
     */
    o(obj, ...args) {
        let locale = this.getLocale();
        let entry = obj[locale];
        if (!entry) {
            locale = this.options.fallbackLocale;
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
            return (this._formatNumerableEntry(entry, args) ?? '');
        }
        if (typeof entry === 'string') {
            return format(entry, ...args);
        }
        return '';
    }
}
