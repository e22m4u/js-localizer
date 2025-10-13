/**
 * Проверяет, является ли переданное значение объектом, в который можно
 * производить глубокое слияние. Исключает null и массивы.
 *
 * @param item
 */
const isMergableObject = (
  item: unknown,
): item is Record<string | symbol, unknown> => {
  return item !== null && typeof item === 'object' && !Array.isArray(item);
};

/**
 * Рекурсивно объединяет свойства одного или нескольких объектов-источников
 * в целевой объект. В отличие от Object.assign, эта функция рекурсивно
 * объединяет вложенные объекты.
 *
 * @template T    Тип целевого объекта.
 * @param target  Целевой объект, который будет изменен.
 * @param sources Один или несколько объектов-источников.
 * @returns       Измененный целевой объект.
 */
export function assignDeep<T extends object>(
  target: T,
  ...sources: object[]
): T {
  // Если источников нет, просто возвращаем цель
  if (sources.length === 0) {
    return target;
  }
  // Перебираем все объекты-источники
  for (const source of sources) {
    // Пропускаем null или undefined источники
    if (!isMergableObject(source)) {
      continue;
    }
    // Используем Reflect.ownKeys для получения всех ключей (включая символьные)
    for (const key of Reflect.ownKeys(source)) {
      // Получаем значения из цели и источника
      // Используем приведение типа, т.к. TS не может знать,
      // что `key` из `source` есть в `target`
      const targetValue = (target as Record<string | symbol, unknown>)[key];
      const sourceValue = (source as Record<string | symbol, unknown>)[key];
      // Если оба значения являются сливаемыми объектами, вызываем рекурсию
      if (isMergableObject(targetValue) && isMergableObject(sourceValue)) {
        // Рекурсивно сливаем вложенные объекты.
        // assignDeep изменяет первый аргумент, поэтому нам не нужно присваивать результат.
        assignDeep(targetValue, sourceValue);
      } else {
        // В противном случае (если одно из значений не объект, или это массив/null),
        // просто присваиваем значение из источника в цель.
        (target as Record<string | symbol, unknown>)[key] = sourceValue;
      }
    }
  }
  return target;
}
