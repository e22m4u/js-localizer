import { LocalizerDictionaries } from './localizer-state.js';
export type DetectionSource = 'urlPath' | 'query' | 'localStorage' | 'htmlTag' | 'navigator' | 'env';
export type LocalizerOptions = {
    locales?: string[];
    fallbackLocale?: string;
    lookupUrlPathIndex?: number;
    lookupQueryStringKey?: string;
    lookupLocalStorageKey?: string;
    detectionOrder?: DetectionSource[];
    dictionaries?: LocalizerDictionaries;
};
