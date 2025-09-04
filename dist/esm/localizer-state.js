export class LocalizerState {
    options;
    dictionaries;
    currentLocale;
    constructor(options = {}, dictionaries = {}, currentLocale) {
        this.options = options;
        this.dictionaries = dictionaries;
        this.currentLocale = currentLocale;
        if (options?.dictionaries)
            this.dictionaries = {
                ...this.dictionaries,
                ...options.dictionaries,
            };
    }
    cloneWithLocale(locale) {
        return new LocalizerState(JSON.parse(JSON.stringify(this.options)), JSON.parse(JSON.stringify(this.dictionaries)), locale);
    }
    getAvailableLocales() {
        return Array.from(new Set([
            ...(this.options.locales ?? []),
            ...Object.keys(this.dictionaries),
        ]));
    }
}
