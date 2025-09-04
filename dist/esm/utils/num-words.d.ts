/**
 * Num words.
 *
 * numWords(value, 'товар', 'товара', 'товаров');
 * numWords(value, 'штука', 'штуки', 'штук');
 * numWords(value, 'пара', 'пары', 'пар');
 * numWords(value, 'рубль', 'рубля', 'рублей');
 *
 * @param value
 * @param one
 * @param few
 * @param many
 */
export declare function numWords(value: number, one: string, few: string, many: string): string;
