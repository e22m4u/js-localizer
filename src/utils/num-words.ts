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
export function numWords(
  value: number,
  one: string,
  few: string,
  many: string,
) {
  value = Math.abs(value) % 100;
  const num = value % 10;
  if (value > 10 && value < 20) return many;
  if (num > 1 && num < 5) return few;
  if (num == 1) return one;
  return many;
}
