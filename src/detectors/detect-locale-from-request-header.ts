import {findSupportedLocale} from '../find-supported-locale.js';

/**
 * Detect locale from request header.
 *
 * @param availableLocales
 * @param headers
 * @param headerName
 */
export function detectLocaleFromRequestHeader(
  availableLocales: string[],
  headers: Record<string, unknown>,
  headerName: string,
): string | undefined {
  headerName = headerName.toLocaleLowerCase();
  let candidates = headers[headerName];
  if (!candidates) return;
  if (typeof candidates === 'string') candidates = [candidates];
  if (!Array.isArray(candidates)) return;
  let locale: string | undefined;
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'string') continue;
    locale = findSupportedLocale(candidate, availableLocales);
    if (locale) break;
  }
  return locale;
}
