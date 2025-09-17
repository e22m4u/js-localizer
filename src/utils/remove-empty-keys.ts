/**
 * Empty value prediction.
 */
type EmptyValuePredication = (value: unknown) => boolean;

/**
 * Удаляет ключи объекта с пустыми значениями.
 *
 * @param plainObject
 * @param removeWhen
 */
export function removeEmptyKeys(
  plainObject: object,
  removeWhen: EmptyValuePredication = v => v == null,
) {
  return Object.fromEntries(
    Object.entries(plainObject).filter(([, value]) => !removeWhen(value)),
  );
}
