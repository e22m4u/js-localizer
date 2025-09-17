import { IncomingMessage } from 'http';
import { LocalizerEntry } from './localizer-state.js';
import { LocalizerState } from './localizer-state.js';
import { LocalizerOptions } from './localizer-state.js';
import { LocalizerDictionary } from './localizer-state.js';
import { LocalizerNumerableEntry } from './localizer-state.js';
/**
 * Lang object.
 */
export type LangObject = Record<string, LocalizerEntry>;
/**
 * Localizer.
 */
export declare class Localizer {
    /**
     * State.
     */
    readonly state: LocalizerState;
    /**
     * Options.
     */
    get options(): LocalizerOptions;
    /**
     * Конструктор класса.
     */
    constructor(optionsOrState?: Partial<LocalizerOptions> | LocalizerState);
    /**
     * Get locale.
     */
    getLocale(): string;
    /**
     * Устанавливает текущую локаль.
     *
     * @param locale
     */
    setLocale(locale: string): this;
    /**
     * Клонирование экземпляра.
     */
    clone(): Localizer;
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
    cloneWithLocaleFromRequest(req: IncomingMessage): Localizer;
    /**
     * Добавляет или заменяет справочник для указанной локали.
     *
     * @param locale
     * @param dictionary
     */
    addDictionary(locale: string, dictionary: LocalizerDictionary): this;
    /**
     * Определяет наиболее подходящую локаль.
     */
    protected _detectSupportedLocale(): string;
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
