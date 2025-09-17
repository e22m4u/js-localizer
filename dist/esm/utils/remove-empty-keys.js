/**
 * Удаляет ключи объекта с пустыми значениями.
 *
 * @param plainObject
 * @param removeWhen
 */
export function removeEmptyKeys(plainObject, removeWhen = v => v == null) {
    return Object.fromEntries(Object.entries(plainObject).filter(([, value]) => !removeWhen(value)));
}
