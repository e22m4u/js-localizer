/**
 * Num words.
 *
 * numWords(1, 'item', 'items')  // 1 item
 * numWords(2, 'item', 'items')  // 2 items
 * numWords(5, 'item', 'items')  // 5 items
 * numWords(0, 'item', 'items')  // 0 items
 * numWords(-1, 'item', 'items') // -1 item
 * numWords(1.5, 'item', 'items') // 1.5 items
 *
 * numWords(1, 'товар', 'товара', 'товаров')  // 1 товар
 * numWords(2, 'товар', 'товара', 'товаров')  // 2 товара
 * numWords(5, 'товар', 'товара', 'товаров')  // 5 товаров
 * numWords(21, 'товар', 'товара', 'товаров') // 21 товар
 * numWords(-1, 'товар', 'товара', 'товаров') // -1 товар
 * numWords(1.5, 'товар', 'товара', 'товаров') // 1.5 товара
 *
 * @param value
 * @param one
 * @param few
 * @param many
 */
export function numWords(
  value: number,
  one: string,
  few?: string,
  many?: string,
) {
  if (few == null && many == null) return one;
  // английская логика (2 формы)
  if (few == null || many == null) {
    const pluralForm = few || many;
    return Math.abs(value) === 1 ? one : pluralForm;
  }
  // русская логика (3 формы)
  if (!Number.isInteger(value)) return few;
  const absValue = Math.abs(value);
  const val100 = absValue % 100;
  const val10 = val100 % 10;
  if (val100 > 10 && val100 < 20) return many;
  if (val10 > 1 && val10 < 5) return few;
  if (val10 === 1) return one;
  return many;
}
