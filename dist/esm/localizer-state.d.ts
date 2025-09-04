import { LocalizerOptions } from './localizer-options.js';
export type LocalizerNumerableEntry = {
    one?: string;
    few?: string;
    many?: string;
};
export type LocalizerEntry = string | LocalizerNumerableEntry;
export type LocalizerDictionary = {
    [key: string]: LocalizerEntry;
};
export type LocalizerDictionaries = {
    [locale: string]: LocalizerDictionary;
};
export declare class LocalizerState {
    options: LocalizerOptions;
    dictionaries: LocalizerDictionaries;
    currentLocale?: string | undefined;
    constructor(options?: LocalizerOptions, dictionaries?: LocalizerDictionaries, currentLocale?: string | undefined);
    cloneWithLocale(locale: string): LocalizerState;
    getAvailableLocales(): string[];
}
