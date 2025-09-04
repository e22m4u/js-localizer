import {LocalizerOptions} from './localizer-options.js';

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

export class LocalizerState {
  constructor(
    public options: LocalizerOptions = {},
    public dictionaries: LocalizerDictionaries = {},
    public currentLocale?: string,
  ) {
    if (options?.dictionaries)
      this.dictionaries = {
        ...this.dictionaries,
        ...options.dictionaries,
      };
  }

  cloneWithLocale(locale: string) {
    return new LocalizerState(
      JSON.parse(JSON.stringify(this.options)),
      JSON.parse(JSON.stringify(this.dictionaries)),
      locale,
    );
  }

  getAvailableLocales(): string[] {
    return Array.from(
      new Set([
        ...(this.options.locales ?? []),
        ...Object.keys(this.dictionaries),
      ]),
    );
  }
}
