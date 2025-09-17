# @e22m4u/js-localizer

Легковесный сервис локализации для JavaScript без глобальных состояний
и блокирующих операций.

## Особенности

- **Минимум зависимостей**  
  Маленький размер и высокая производительность.
- **Иммутабельность**  
  Методы клонирования (`clone`, `cloneWithLocale`) позволяют безопасно
  использовать один базовый экземпляр для создания множества изолированных.
- **Гибкая настройка**  
  Контроль над процессом определения локали, словарями и резервными языками.
- **Автоматическое определение локали**  
  Поддерживает определение из URL, query-параметров, `localStorage`,
  `navigator`, HTML-тега и переменных окружения.
- **Поддержка плюрализации**  
  Простая обработка множественных чисел (one, few, many).
- **Универсальность**  
  Работает в браузере и на сервере (Node.js).

## Содержание

- [Установка](#установка)
- [Быстрый старт](#быстрый-старт)
- [Продвинутое использование](#продвинутое-использование)
  - [Плюрализация (обработка множественных чисел)](#плюрализация-обработка-множественных-чисел)
  - [Перевод из объекта (метод `o`)](#перевод-из-объекта-метод-o)
  - [Иммутабельность и клонирование](#иммутабельность-и-клонирование)
  - [Использование на сервере (Node.js)](#использование-на-сервере-nodejs)
- [Автоматическое определение локали](#автоматическое-определение-локали)
- [Настройки (API)](#настройки-api)
- [Методы экземпляра](#методы-экземпляра)
- [Тесты](#тесты)
- [Лицензия](#лицензия)

## Установка

```bash
npm install @e22m4u/js-localizer
```

Модуль поддерживает ESM и CommonJS стандарты.

**ESM**
```js
import {Localizer} from '@e22m4u/js-localizer';
```

**CommonJS**
```js
const {Localizer} = require('@e22m4u/js-localizer');
```

## Быстрый старт

Создание экземпляра, добавление словарей и выполнение перевода.

```javascript
import {Localizer} from '@e22m4u/js-localizer';

// 1. Создание экземпляра и добавление словарей.
const localizer = new Localizer();

localizer.addDictionary('ru', {
  hello: 'Привет!',
  helloName: 'Привет, %s!',
});

localizer.addDictionary('en', {
  hello: 'Hello!',
  helloName: 'Hello, %s!',
});

// 2. Установка текущей локали.
localizer.setLocale('ru');

// 3. Выполнение перевода.
console.log(localizer.t('hello'));             // > Привет!
console.log(localizer.t('helloName', 'Олег')); // > Привет, Олег!

// Изменение локали.
localizer.setLocale('en');
console.log(localizer.t('helloName', 'Oleg')); // > Hello, Oleg!
```

*Примечание: Форматирование строк (`%s`, `%d`) выполняется с помощью библиотеки
[@e22m4u/js-format](https://www.npmjs.com/package/@e22m4u/js-format).*

## Продвинутое использование

- [Плюрализация (обработка множественных чисел)](#плюрализация-обработка-множественных-чисел)
- [Перевод из объекта (метод `o`)](#перевод-из-объекта-метод-o)
- [Иммутабельность и клонирование](#иммутабельность-и-клонирование)
- [Использование на сервере (Node.js)](#использование-на-сервере-nodejs)

### Плюрализация (обработка множественных чисел)

Для обработки форм множественного числа используется объект с ключами
`one`, `few`, `many`.

```javascript
localizer.addDictionary('ru', {
  iHaveApples: {
    one: 'У меня %d яблоко.',
    few: 'У меня %d яблока.', // для чисел 2, 3, 4
    many: 'У меня %d яблок.', // для 0, 5, 6...
  },
});

localizer.setLocale('ru');

localizer.t('iHaveApples', 1); // > У меня 1 яблоко.
localizer.t('iHaveApples', 2); // > У меня 2 яблока.
localizer.t('iHaveApples', 5); // > У меня 5 яблок.
```

Англоязычный вариант с ключами `one` и `many` (без `few`).

```js
localizer.addDictionary('en', {
  iHaveApples: {
    one: 'I have %d apple.',
    many: 'I have %d apples.', // для 0, 2, 3...
  },
});

localizer.setLocale('en');

localizer.t('iHaveApples', 1); // > I have 1 apple.
localizer.t('iHaveApples', 2); // > I have 2 apples.
localizer.t('iHaveApples', 5); // > I have 5 apples.
```

### Перевод из объекта (метод `o()`)

Метод `o()` удобен, когда переводы хранятся не в словарях, а в самом коде
(например, в компоненте UI).

```javascript
const localizer = new Localizer({defaultLocale: 'ru'});

const title = {
  en: 'Hello!',
  ru: 'Привет!',
};

localizer.o(title); // > Привет!
```

Если перевод для текущей или `fallback` локали отсутствует, будет возвращён
перевод для первого найденного языка в объекте.

### Иммутабельность и клонирование

`Localizer` спроектирован так, чтобы быть иммутабельным. Вместо изменения
текущего экземпляра вы можете создавать его клоны. Это особенно полезно
в серверной среде, где для каждого запроса нужен свой изолированный экземпляр.

```javascript
import en from './locales/en.json';
import ru from './locales/ru.json';

// Базовый экземпляр со всеми словарями
const baseLocalizer = new Localizer({dictionaries: {en, ru}});

// Клон для русскоговорящего пользователя
const ruLocalizer = baseLocalizer.cloneWithLocale('ru');
ruLocalizer.t('greetings'); // > Привет!

// Клон для англоговорящего пользователя
const enLocalizer = baseLocalizer.cloneWithLocale('en');
enLocalizer.t('greetings'); // > Hello!
```

### Использование на сервере (Node.js)

Метод `cloneWithLocaleFromRequest()` предназначен для автоматического
определения языка из заголовков HTTP-запроса (например, `Accept-Language`).

```javascript
// пример для Express.js
// const baseLocalizer = new Localizer({...});

function middleware(req, res, next) {
  // Создание изолированной копии для текущего запроса
  req.localizer = baseLocalizer.cloneWithLocaleFromRequest(req);
  next();
}

app.get('/', (req, res) => {
  // req.localizer уже настроен на нужный язык
  const greeting = req.localizer.t('greetings');
  res.send(greeting);
});
```

## Автоматическое определение локали

Если локаль не установлена явно через `setLocale()` или `cloneWithLocale()`,
то `Localizer` попытается определить её автоматически при первом вызове
`getLocale()` или `t()`.

Порядок определения задаётся опцией `detectionOrder` и по умолчанию выглядит
так:

```json
[
  "urlPath",
  "query",
  "localStorage",
  "htmlTag",
  "navigator",
  "env"
]
```

Ниже подробно описан каждый источник.

### Из URL-адреса

Библиотека может извлечь локаль из сегмента пути URL. По умолчанию используется
нулевой сегмент (`/ru/products`).

```javascript
// для URL https://example.com/ru/products
window.location.pathname = '/ru/products';

const localizer = new Localizer({ dictionaries: { en, ru } });
localizer.t('greetings'); // > Привет!
```

*Настроить индекс сегмента можно через опцию `urlPathIndex`.*

### Из query-параметра

Локаль может быть передана в параметрах запроса URL. По умолчанию используется
ключ `lang`.

```javascript
// для URL https://example.com/products?lang=ru
window.location.search = '?lang=ru';

const localizer = new Localizer({ dictionaries: { en, ru } });
localizer.t('greetings'); // > Привет!
```

*Ключ параметра можно изменить опцией `queryStringKey`.*

### Из локального хранилища

Отличный способ сохранить выбор языка пользователя между сессиями. По умолчанию
используется ключ `language`.

```javascript
// Пользователь ранее выбрал язык на сайте
window.localStorage.setItem('language', 'ru');

const localizer = new Localizer({dictionaries: {en, ru}});
localizer.t('greetings'); // > Привет!
```

*Ключ можно изменить опцией `localStorageKey`.*

### Из HTML-тега

Локаль считывается из атрибута `lang` корневого элемента `<html>`.
Данный атрибут часто используется для SEO.

```html
<!DOCTYPE html>
<html lang="ru-RU">
  <!-- ... -->
</html>
```

```javascript
// На странице с <html lang="ru-RU">
const localizer = new Localizer({dictionaries: {en, ru}});
localizer.t('greetings'); // > Привет!
```

### Из настроек браузера

Модуль использует `navigator.languages[0]`, чтобы определить предпочитаемый
язык пользователя, установленный в его браузере или ОС.

```javascript
// Имитация настроек браузера
// (в реальности это свойство только для чтения)
Object.defineProperty(window, 'navigator', {
  value: {languages: ["ru-RU", "en-US"]},
  writable: true,
});

const localizer = new Localizer({dictionaries: {en, ru}});
localizer.t('greetings'); // > Привет!
```

### Из переменных окружения

Этот метод работает **только на стороне сервера (Node.js)**. Он полезен для
скриптов, утилит командной строки или серверного рендеринга (SSR), где нужно
учитывать системную локаль.

Модуль проверяет следующие переменные окружения в указанном порядке:

1. `LANG`
2. `LANGUAGE`
3. `LC_MESSAGES`
4. `LC_ALL`

Модуль автоматически извлекает код языка из строк формата `ru_RU.UTF-8`,
оставляя `ru_RU`, и затем подбирая подходящую локаль (`ru`).

**Пример использования в терминале:**

```bash
# Установка переменной окружения и запуск скрипта
export LANG=ru_RU.UTF-8
node my-script.js
```

```javascript
// Содержимое my-script.js
import en from './locales/en.json';
import ru from './locales/ru.json';
import {Localizer} from '@e22m4u/js-localizer';

const localizer = new Localizer({ dictionaries: { en, ru } });

// Localizer автоматически читает `process.env.LANG`
// и определяет локаль 'ru'
console.log(localizer.t('greetings')); // > Привет!
```

---

## Настройки (API)

Настройки передаются в конструктор `new Localizer(options)`.

- `locales: string[]`  
  Список поддерживаемых локалей. Если не указан, список будет сформирован
  из ключей `dictionaries`.  
  *По умолчанию:* `[]`

- `defaultLocale: string | undefined`  
  Локаль, которая будет установлена по умолчанию при создании экземпляра.  
  *По умолчанию:* `undefined`

- `fallbackLocale: string`  
  Резервная локаль. Используется, если перевод для текущей локали не найден
  или если не удалось определить локаль автоматически.  
  *По умолчанию:* `'en'`

- `dictionaries: LocalizerDictionaries`  
  Объект со словарями, где ключ — это локаль.  
  *По умолчанию:* `{}`

- `detectionOrder: DetectionSource[]`  
  Массив, определяющий порядок источников для автоматического определения локали.  
  *По умолчанию:* `['urlPath', 'query', 'localStorage', 'htmlTag', 'navigator', 'env']`

- `urlPathIndex: number`  
  Индекс сегмента URL, в котором находится локаль (например, для `/en/users`
  индекс `0`).  
  *По умолчанию:* `0`

- `queryStringKey: string`  
  Имя query-параметра для локали (например, `?lang=en`).  
  *По умолчанию:* `'lang'`

- `localStorageKey: string`  
  Ключ в `localStorage` для хранения локали.  
  *По умолчанию:* `'language'`

- `requestHeaderKey: string`  
  Имя HTTP-заголовка для определения локали на сервере.  
  *По умолчанию:* `'accept-language'`

## Методы экземпляра

- `setLocale(locale: string): this`  
  Явно устанавливает текущую локаль.

- `getLocale(): string`  
  Возвращает текущую локаль. Если она не была установлена, запускает механизм
  автоматического определения.

- `addDictionary(locale: string, dictionary: object): this`  
  Добавляет или заменяет словарь для указанной локали.

- `t(key: string, ...args: unknown[]): string`  
  Возвращает переведённую и отформатированную строку по ключу.

- `o(obj: object, ...args: unknown[]): string`  
  Извлекает и форматирует перевод из объекта для текущей локали.

- `clone(): Localizer`  
  Создаёт полную, независимую копию экземпляра с текущим состоянием.

- `cloneWithLocale(locale: string): Localizer`  
  Создаёт клон с установленной новой локалью.

- `cloneWithLocaleFromRequest(req: IncomingMessage): Localizer`  
  (Node.js) Создаёт клон с локалью, определённой из заголовков HTTP-запроса.

## Тесты

```bash
npm run test
```

## Лицензия

MIT