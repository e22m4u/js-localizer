import { DetectionSource } from '../localizer-state.js';
/**
 * Browser locale sources.
 */
export declare const BROWSER_LOCALE_SOURCES: DetectionSource[];
/**
 * Locale detection options.
 */
export type LocaleDetectionOptions = {
    urlPathIndex?: number;
    queryStringKey?: string;
    localStorageKey?: string;
};
/**
 * Detect locale from source.
 *
 * @param availableLocales
 * @param source
 * @param options
 */
export declare function detectLocaleFromSource(availableLocales: string[], source: DetectionSource, options?: LocaleDetectionOptions): string | undefined;
