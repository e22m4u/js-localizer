/**
 * Detect locale from request header.
 *
 * @param availableLocales
 * @param headers
 * @param headerName
 */
export declare function detectLocaleFromRequestHeader(availableLocales: string[], headers: Record<string, unknown>, headerName: string): string | undefined;
