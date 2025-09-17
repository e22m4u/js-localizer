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
export declare function removeEmptyKeys(plainObject: object, removeWhen?: EmptyValuePredication): {
    [k: string]: any;
};
export {};
