import {expect} from 'chai';
import {detectLocaleFromRequestHeader} from './detect-locale-from-request-header.js';

const createMockHeaders = (
  headers: Record<string, unknown>,
): Record<string, unknown> => headers;

describe('detectLocaleFromRequestHeader', function () {
  const availableLocales = ['en-US', 'fr', 'ru', 'de'];

  describe('when a supported locale is found', function () {
    it('should find an exact match from a single string header', function () {
      const headers = createMockHeaders({'accept-language': 'fr'});
      const locale = detectLocaleFromRequestHeader(
        availableLocales,
        headers,
        'accept-language',
      );
      expect(locale).to.equal('fr');
    });

    it('should find a base language match from a single string header', function () {
      const headers = createMockHeaders({'accept-language': 'ru-RU,en;q=0.9'});
      const locale = detectLocaleFromRequestHeader(
        availableLocales,
        headers,
        'accept-language',
      );
      expect(locale).to.equal('ru');
    });

    it('should find the first supported locale from an array of candidates', function () {
      const headers = createMockHeaders({
        'accept-language': ['es-ES', 'fr', 'en-US'],
      });
      const locale = detectLocaleFromRequestHeader(
        availableLocales,
        headers,
        'accept-language',
      );
      expect(locale).to.equal('fr');
    });

    it('should find a base language match later in the array if earlier candidates fail', function () {
      const headers = createMockHeaders({
        'accept-language': ['es', 'it', 'de-DE'],
      });
      const locale = detectLocaleFromRequestHeader(
        availableLocales,
        headers,
        'accept-language',
      );
      expect(locale).to.equal('de');
    });

    it('should handle case-insensitivity for the header name', function () {
      const headers = createMockHeaders({'accept-language': 'ru'});
      const locale = detectLocaleFromRequestHeader(
        availableLocales,
        headers,
        'Accept-Language',
      );
      expect(locale).to.equal('ru');
    });
  });

  describe('when handling invalid or mixed data', function () {
    it('should skip null, undefined, and empty string candidates in an array', function () {
      const headers = createMockHeaders({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'accept-language': [null, '', 'it', undefined, 'en-US'] as any,
      });
      const locale = detectLocaleFromRequestHeader(
        availableLocales,
        headers,
        'accept-language',
      );
      expect(locale).to.equal('en-US');
    });

    it('should return undefined if the header value is not a string or array', function () {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const headers = createMockHeaders({'accept-language': 12345 as any});
      const locale = detectLocaleFromRequestHeader(
        availableLocales,
        headers,
        'accept-language',
      );
      expect(locale).to.be.undefined;
    });
  });

  describe('when no supported locale is found', function () {
    it('should return undefined if the header is missing', function () {
      const headers = createMockHeaders({'x-other-header': 'value'});
      const locale = detectLocaleFromRequestHeader(
        availableLocales,
        headers,
        'accept-language',
      );
      expect(locale).to.be.undefined;
    });

    it('should return undefined if none of the candidates are supported', function () {
      const headers = createMockHeaders({
        'accept-language': ['es-ES', 'it-IT', 'ja-JP'],
      });
      const locale = detectLocaleFromRequestHeader(
        availableLocales,
        headers,
        'accept-language',
      );
      expect(locale).to.be.undefined;
    });

    it('should return undefined if the header value is an empty array', function () {
      const headers = createMockHeaders({'accept-language': []});
      const locale = detectLocaleFromRequestHeader(
        availableLocales,
        headers,
        'accept-language',
      );
      expect(locale).to.be.undefined;
    });

    it('should return undefined if the list of available locales is empty', function () {
      const headers = createMockHeaders({'accept-language': 'en-US'});
      const locale = detectLocaleFromRequestHeader(
        [],
        headers,
        'accept-language',
      );
      expect(locale).to.be.undefined;
    });
  });
});
