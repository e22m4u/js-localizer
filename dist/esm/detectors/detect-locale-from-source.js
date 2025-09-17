import { DetectionSource } from '../localizer-state.js';
import { findSupportedLocale } from '../find-supported-locale.js';
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
 * Detect locale from source.
 *
 * @param availableLocales
 * @param source
 * @param options
 */
export function detectLocaleFromSource(availableLocales, source, options) {
    if (typeof window === 'undefined') {
        if (BROWSER_LOCALE_SOURCES.includes(source)) {
            return;
        }
    }
    let candidate;
    switch (source) {
        case DetectionSource.URL_PATH: {
            const index = options?.urlPathIndex ?? 0;
            const segments = window.location.pathname
                .replace(/^\/|\/$/g, '')
                .split('/');
            if (segments.length > index && segments[index])
                candidate = segments[index];
            break;
        }
        case DetectionSource.QUERY: {
            const key = options?.queryStringKey ?? 'lang';
            const params = new URLSearchParams(window.location.search);
            candidate = params.get(key) ?? undefined;
            break;
        }
        case DetectionSource.LOCAL_STORAGE: {
            const key = options?.localStorageKey ?? 'language';
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
        return findSupportedLocale(candidate, availableLocales);
}
