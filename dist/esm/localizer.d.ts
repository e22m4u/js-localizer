import { LocalizerEntry } from './localizer-state.js';
import { LocalizerState } from './localizer-state.js';
import { DetectionSource } from './localizer-options.js';
import { LocalizerOptions } from './localizer-options.js';
import { LocalizerDictionary } from './localizer-state.js';
import { LocalizerNumerableEntry } from './localizer-state.js';
/**
 * Lang object.
 */
export type LangObject = Record<string, LocalizerEntry>;
/**
 * Default fallback locale.
 */
export declare const DEFAULT_FALLBACK_LOCALE = "en";
/**
 * Default detection order.
 */
export declare const DEFAULT_DETECTION_ORDER: DetectionSource[];
/**
 * Browser locale sources.
 */
export declare const BROWSER_LOCALE_SOURCES: DetectionSource[];
/**
 * Localizer.
 */
export declare class Localizer {
    /**
     * State.
     */
    readonly state: LocalizerState;
    /**
     * Конструктор класса.
     */
    constructor(optionsOrState?: LocalizerOptions | LocalizerState);
    /**
     * Возвращает текущую локаль.
     */
    getLocale(): string;
    /**
     * Устанавливает текущую локаль.
     *
     * @param locale
     */
    setLocale(locale: string): this;
    /**
     * Локаль используется при неудачном определении текущей локали,
     * или при отсутствии справочника для текущей локали.
     */
    getFallbackLocale(): string;
    /**
     * Создаёт клон экземпляра с новой локалью.
     *
     * @param locale
     */
    cloneWithLocale(locale: string): Localizer;
    /**
     * Добавляет или заменяет справочник для указанной локали.
     *
     * @param locale
     * @param dictionary
     */
    addDictionary(locale: string, dictionary: LocalizerDictionary): this;
    /**
     * Определяет и устанавливает наиболее подходящую локаль.
     */
    protected _detectLocale(): string | undefined;
    /**
     * Обход источников для поиска локали.
     *
     * @param availableLocales
     */
    protected _lookupLocale(availableLocales: string[]): string | undefined;
    /**
     * Извлекает локаль из указанного источника.
     *
     * @param source
     */
    protected _detectFromSource(source: DetectionSource): string | undefined;
    /**
     * Ищет подходящую локаль среди доступных, включая базовый язык.
     *
     * @param candidate
     * @param availableLocales
     */
    protected _findSupported(candidate: string, availableLocales: string[]): string | undefined;
    /**
     * Находит и форматирует перевод по ключу из справочника.
     *
     * @param key
     * @param args
     */
    t(key: string, ...args: unknown[]): string;
    /**
     * Форматирует запись для множественных чисел.
     *
     * @param entry
     * @param args
     */
    protected _formatNumerableEntry(entry: LocalizerNumerableEntry, args: unknown[]): string;
    /**
     * Извлекает и форматирует перевод из объекта для текущей локали.
     *
     * @param obj
     * @param args
     */
    o(obj: LangObject, ...args: unknown[]): string;
}
