/**
 * Ищет подходящую локаль среди доступных, включая базовый язык.
 *
 * @param candidate
 * @param availableLocales
 */
export function findSupportedLocale(candidate, availableLocales) {
    if (!candidate)
        return;
    const normalizedCandidate = candidate.toLowerCase();
    const exactMatch = availableLocales.find(l => l.toLowerCase() === normalizedCandidate);
    if (exactMatch)
        return exactMatch;
    const baseLang = normalizedCandidate.split('-')[0].split('_')[0];
    const baseMatch = availableLocales.find(l => l.toLowerCase() === baseLang);
    if (baseMatch)
        return baseMatch;
    return;
}
