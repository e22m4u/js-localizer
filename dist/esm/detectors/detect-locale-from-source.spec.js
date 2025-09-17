/* eslint-disable mocha/no-setup-in-describe */
import { expect } from 'chai';
import { DetectionSource } from '../localizer-state.js';
import { detectLocaleFromSource } from './detect-locale-from-source.js';
const AVAILABLE_LOCALES = ['en', 'fr', 'de', 'it', 'es', 'pt-BR', 'cn', 'ru'];
const setupBrowserMocks = ({ pathname = '', search = '', langAttr = null, languages = [], localStorageValues = {}, }) => {
    const mockWindow = {
        location: { pathname, search },
        localStorage: {
            getItem: (key) => localStorageValues[key] || null,
        },
        URLSearchParams: URLSearchParams,
    };
    const mockDocument = {
        documentElement: {
            getAttribute: (name) => (name === 'lang' ? langAttr : null),
        },
    };
    const mockNavigator = {
        languages,
    };
    Object.defineProperty(global, 'window', {
        value: mockWindow,
        writable: true,
        configurable: true,
    });
    Object.defineProperty(global, 'document', {
        value: mockDocument,
        writable: true,
        configurable: true,
    });
    Object.defineProperty(global, 'navigator', {
        value: mockNavigator,
        writable: true,
        configurable: true,
    });
};
describe('detectLocaleFromSource', function () {
    describe('in a browser environment', function () {
        const originalWindow = global.window;
        const originalDocument = global.document;
        const originalNavigator = global.navigator;
        after(function () {
            global.window = originalWindow;
            global.document = originalDocument;
            global.navigator = originalNavigator;
        });
        describe('when detecting from URL_PATH', function () {
            it('should get locale from the first path segment by default', function () {
                setupBrowserMocks({ pathname: '/en/products' });
                const locale = detectLocaleFromSource(AVAILABLE_LOCALES, DetectionSource.URL_PATH);
                expect(locale).to.equal('en');
            });
            it('should get locale from a specific path segment index', function () {
                setupBrowserMocks({ pathname: '/api/v1/fr/users' });
                const locale = detectLocaleFromSource(AVAILABLE_LOCALES, DetectionSource.URL_PATH, {
                    urlPathIndex: 2,
                });
                expect(locale).to.equal('fr');
            });
            it('should return undefined if path segment does not exist', function () {
                setupBrowserMocks({ pathname: '/about' });
                const locale = detectLocaleFromSource(AVAILABLE_LOCALES, DetectionSource.URL_PATH, {
                    urlPathIndex: 1,
                });
                expect(locale).to.be.undefined;
            });
        });
        describe('when detecting from QUERY', function () {
            it('should get locale from "lang" query param by default', function () {
                setupBrowserMocks({ search: '?other=val&lang=de' });
                const locale = detectLocaleFromSource(AVAILABLE_LOCALES, DetectionSource.QUERY);
                expect(locale).to.equal('de');
            });
            it('should get locale from a custom query param', function () {
                setupBrowserMocks({ search: '?language=cn' });
                const locale = detectLocaleFromSource(AVAILABLE_LOCALES, DetectionSource.QUERY, {
                    queryStringKey: 'language',
                });
                expect(locale).to.equal('cn');
            });
            it('should return undefined if locale from query is not supported', function () {
                setupBrowserMocks({ search: '?lang=jp' });
                const locale = detectLocaleFromSource(AVAILABLE_LOCALES, DetectionSource.QUERY);
                expect(locale).to.be.undefined;
            });
        });
        describe('when detecting from LOCAL_STORAGE', function () {
            it('should get locale from "language" key by default', function () {
                setupBrowserMocks({ localStorageValues: { language: 'it' } });
                const locale = detectLocaleFromSource(AVAILABLE_LOCALES, DetectionSource.LOCAL_STORAGE);
                expect(locale).to.equal('it');
            });
            it('should get locale from a custom key', function () {
                setupBrowserMocks({ localStorageValues: { my_app_lang: 'cn' } });
                const locale = detectLocaleFromSource(AVAILABLE_LOCALES, DetectionSource.LOCAL_STORAGE, {
                    localStorageKey: 'my_app_lang',
                });
                expect(locale).to.equal('cn');
            });
        });
        describe('when detecting from HTML_TAG', function () {
            it('should get locale from <html> tag and find a supported match', function () {
                setupBrowserMocks({ langAttr: 'es-ES' });
                const locale = detectLocaleFromSource(AVAILABLE_LOCALES, DetectionSource.HTML_TAG);
                expect(locale).to.equal('es');
            });
        });
        describe('when detecting from NAVIGATOR', function () {
            it('should get the first exact supported locale from navigator.languages', function () {
                setupBrowserMocks({ languages: ['pt-BR', 'pt', 'en'] });
                const locale = detectLocaleFromSource(AVAILABLE_LOCALES, DetectionSource.NAVIGATOR);
                expect(locale).to.equal('pt-BR');
            });
            it('should get the first supported non-exact locale from navigator.languages', function () {
                setupBrowserMocks({ languages: ['fr-CA', 'fr', 'en-US'] });
                const locale = detectLocaleFromSource(AVAILABLE_LOCALES, DetectionSource.NAVIGATOR);
                expect(locale).to.equal('fr');
            });
        });
    });
    describe('in a Node.js environment', function () {
        const originalProcess = global.process;
        const originalWindow = global.window;
        beforeEach(function () {
            global.window = undefined;
            global.document = undefined;
            global.navigator = undefined;
            global.process = { ...originalProcess, env: {} };
        });
        after(function () {
            global.process = originalProcess;
            global.window = originalWindow;
        });
        it('should return undefined for all browser-specific sources', function () {
            const browserSources = [
                DetectionSource.URL_PATH,
                DetectionSource.QUERY,
                DetectionSource.LOCAL_STORAGE,
                DetectionSource.HTML_TAG,
                DetectionSource.NAVIGATOR,
            ];
            for (const source of browserSources) {
                const locale = detectLocaleFromSource(AVAILABLE_LOCALES, source);
                expect(locale, `Source ${source} should be undefined in Node.js`).to.be
                    .undefined;
            }
        });
        describe('when detecting from ENV', function () {
            it('should get locale from process.env.LANG and find a supported match', function () {
                process.env.LANG = 'ru_RU.UTF-8';
                const locale = detectLocaleFromSource(AVAILABLE_LOCALES, DetectionSource.ENV);
                expect(locale).to.equal('ru');
            });
            it('should get locale from process.env.LANGUAGE as a fallback and find a supported match', function () {
                process.env.LANGUAGE = 'fr_FR:fr';
                const locale = detectLocaleFromSource(AVAILABLE_LOCALES, DetectionSource.ENV);
                expect(locale).to.equal('fr');
            });
            it('should return undefined if no relevant environment variables are set', function () {
                const locale = detectLocaleFromSource(AVAILABLE_LOCALES, DetectionSource.ENV);
                expect(locale).to.be.undefined;
            });
        });
    });
});
