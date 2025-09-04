## @e22m4u/js-localizer

Легковесный сервис локализации для JavaScript без глобальных состояний
и блокирующих операций.

## Установка

```bash
npm install @e22m4u/js-localizer
```

Модуль поддерживает ESM и CommonJS стандарты.

*ESM*

```js
import {Localizer} from '@e22m4u/js-localizer';
```

*CommonJS*

```js
const {Localizer} = require('@e22m4u/js-localizer');
```

## Использование

Создание нового экземпляра и определение справочника.

```js
import {Localizer} from '@e22m4u/js-localizer';

const localizer = new Localizer();

localizer.addDictionary('ru', {
  hello: 'Привет!',
  helloName: 'Привет, %s!',
  iHaveApples: {
    one: 'У меня одно яблоко.',
    few: 'У меня %d яблока.',
    many: 'У меня %d яблок.',
  },
});
```

Установка текущей локали и перевод по ключу.

```js
localizer.setLocale('ru');

localizer.t('hello');             // Привет!
localizer.t('helloName', 'Олег'); // Привет, Олег!
localizer.t('iHaveApples', 1);    // У меня одно яблоко. 
localizer.t('iHaveApples', 2);    // У меня 2 яблока.
localizer.t('iHaveApples', 5);    // У меня 5 яблок.
```

Извлечение перевода из языкового объекта.

```js
import {Localizer} from '@e22m4u/js-localizer';

const localizer = new Localizer({locales: ['en', 'ru']});
localizer.setLocale('ru');

localizer.o({en: 'Hello!', ru: 'Привет!'}); // Привет!
```

Копирование экземпляра с установкой текущей локали.

```js
import en from '../../locales/en.json';
import ru from '../../locales/ru.json';
import {Localizer} from '@e22m4u/js-localizer';

const localizer = new Localizer({dictionaries: {en, ru}});

const ruLocalizer = localizer.cloneWithLocale('ru');
ruLocalizer.t('greetings'); // Привет!

const enLocalizer = localizer.cloneWithLocale('en');
enLocalizer.t('greetings'); // Hello!
```

Автоматическое определение локали из сегмента URL адреса.

```js
import en from '../../locales/en.json';
import ru from '../../locales/ru.json';
import {Localizer} from '@e22m4u/js-localizer';

window.location.pathname = '/ru/products';

const localizer = new Localizer({dictionaries: {en, ru}});
localizer.t('greetings'); // Привет!
```

Автоматическое определение локали из параметров запроса.

```js
import en from '../../locales/en.json';
import ru from '../../locales/ru.json';
import {Localizer} from '@e22m4u/js-localizer';

window.location.search = '?lang=ru';

const localizer = new Localizer({dictionaries: {en, ru}});
localizer.t('greetings'); // Привет!
```

Автоматическое определение локали из локального хранилища.

```js
import en from '../../locales/en.json';
import ru from '../../locales/ru.json';
import {Localizer} from '@e22m4u/js-localizer';

window.localStorage.setItem('language', 'ru');

const localizer = new Localizer({dictionaries: {en, ru}});
localizer.t('greetings'); // Привет!
```

Автоматическое определение локали из Navigator API.

```js
import en from '../../locales/en.json';
import ru from '../../locales/ru.json';
import {Localizer} from '@e22m4u/js-localizer';

window.navigator.languages = ["ru-RU", "en-US"];

const localizer = new Localizer({dictionaries: {en, ru}});
localizer.t('greetings'); // Привет!
```

Автоматическое определение локали из HTML тега.

```js
import en from '../../locales/en.json';
import ru from '../../locales/ru.json';
import {Localizer} from '@e22m4u/js-localizer';

document.documentElement.lang = 'ru-RU';

const localizer = new Localizer({dictionaries: {en, ru}});
localizer.t('greetings'); // Привет!
```

Автоматическое определение локали из переменных окружения.

```js
import en from '../../locales/en.json';
import ru from '../../locales/ru.json';
import {Localizer} from '@e22m4u/js-localizer';

process.env.LANG = 'ru_RU.UTF-8';
// process.env.LANGUAGE = 'ru_RU:ru';
// process.env.LC_MESSAGES = 'ru_RU.UTF-8';
// process.env.LC_ALL = 'ru_RU.UTF-8';

const localizer = new Localizer({dictionaries: {en, ru}});
localizer.t('greetings'); // Привет!
```

## Настройки

Объект с настройками передается первым аргументом конструктора.

```js
const localizer = new Localizer({
  locales: ['en', 'ru'],
  fallbackLocale: 'ru',
  dictionaries: {
    en: {
      'greetings': 'Hello',
      'farewell': 'Bye'
    },
    ru: {
      'greetings': 'Привет',
      'farewell': 'Пока'
    },
  },
});
```

**Параметры**

- `locales: string[]` определение списка доступных локалей;
- `fallbackLocale = 'en'` локаль при отсутствии перевода;
- `lookupUrlPathIndex = 0` индекс URL сегмента локали;
- `lookupQueryStringKey = 'lang'` название параметра запроса;
- `lookupLocalStorageKey = 'language'` ключ локального хранилища;
- `detectionOrder?: DetectionSource[]` порядок определения локали;
- `dictionaries?: LocalizerDictionaries` языковые справочники;

Стандартный порядок автоматического определения локали.

```js
export const DEFAULT_DETECTION_ORDER: DetectionSource[] = [
  'urlPath',
  'query',
  'localStorage',
  'htmlTag',
  'navigator',
  'env',
];
```

## Тесты

```bash
npm run test
```

## Лицензия

MIT
