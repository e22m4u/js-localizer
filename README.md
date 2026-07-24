## @e22m4u/js-localizer

![npm version](https://badge.fury.io/js/@e22m4u%2Fjs-localizer.svg)
![license](https://img.shields.io/badge/license-mit-blue.svg)

English | [Русский](./README.ru.md)

Lightweight localization service for JavaScript.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Additional Utilities](#additional-utilities)
- [Constructor Options](#constructor-options)
- [Instance Methods](#instance-methods)
- [Tests](#tests)
- [License](#license)

## Installation

```bash
npm install @e22m4u/js-localizer
```

The module supports ESM and CommonJS standards.

*ESM*

```js
import {Localizer} from '@e22m4u/js-localizer';
```

*CommonJS*

```js
const {Localizer} = require('@e22m4u/js-localizer');
```

## Usage

Creating an instance with specified dictionaries and performing
translation.

```js
import {Localizer} from '@e22m4u/js-localizer';

// creating an instance with specified dictionaries
const localizer = new Localizer({
  locale: 'fr',         // current locale (optional)
  fallbackLocale: 'en', // fallback locale (optional, defaults to "en")
  dictionaries: {       // translation dictionaries (optional)
    en: {
      hello: 'Hello!',
      helloName: 'Hello, %s!',
    },
    fr: {
      hello: 'Bonjour!',
      helloName: 'Bonjour, %s!',
    },
  },
});

// translation from dictionary using a key
console.log(localizer.t('hello'));             // > Bonjour!
console.log(localizer.t('helloName', 'John')); // > Bonjour, John!

// translation from a language object (without dictionaries)
console.log(localizer.o({en: 'Hello', fr: 'Bonjour'})); // > Bonjour!

// changing the current locale
localizer.setLocale('en');

console.log(localizer.t('hello'));             // > Hello!
console.log(localizer.t('helloName', 'John')); // > Hello, John!

console.log(localizer.o({en: 'Hello', fr: 'Bonjour'})); // > Hello!
```

*i. String formatting (`%s`, `%d`, etc.) is performed by the
[@e22m4u/js-format](https://www.npmjs.com/package/@e22m4u/js-format)
module.*

### Nested Dictionaries

The localization service supports the use of nested objects in
dictionaries. Access to nested values is performed using *dot*
notation.

Example dictionary structure:

```js
// this example uses the `setDictionary` method,
// which sets a new dictionary (or overrides an existing one)
localizer.setDictionary('en', {
  group: {
    title: 'The Title',
    validation: {
      required: 'Required field'
    }
  }
});

localizer.setLocale('en');

console.log(localizer.t('group.title')); // The Title
console.log(localizer.t('group.validation.required')); // Required field
```

During translation lookup, flat keys take priority. If a dictionary
contains a key with a dot in its name, traversal of nested objects
for that path is not performed.

Example of key priority:

```js
localizer.setDictionary('en', {
  'group.title': 'A flat key',
  group: {
    title: 'A nested key',
  },
});

console.log(localizer.t('group.title')); // A flat key
```

### Pluralization

An object with the keys `$one`, `$few`, `$many` is used for
handling plural forms.

**Example for the English language (2 forms)**

For languages with two plural forms (English, for example), it is
sufficient to specify `$one` and `$many` (or `$few`). The library
automatically uses the second form for all numbers except `1` and
`-1`.

```js
localizer.setDictionary('en', {
  iHaveApples: {
    $one: 'I have an apple',
    $many: 'I have %d apples',
  },
});

localizer.setLocale('en');

console.log(localizer.t('iHaveApples', 1));   // > I have an apple
console.log(localizer.t('iHaveApples', 0));   // > I have 0 apples
console.log(localizer.t('iHaveApples', 10));  // > I have 10 apples
```

**Example for the Russian language (3 forms)**

For languages with three plural forms (Russian, for example), all
three keys (`$one`, `$few` and `$many`) need to be specified. The
library automatically selects the correct form based on the number.

```js
localizer.setDictionary('ru', {
  iHaveApples: {
    $one: 'У меня одно яблоко',
    $few: 'У меня %d яблока', // for numbers 2, 3, 4, and fractional
    $many: 'У меня %d яблок', // for 0, 5, 6...
  },
});

localizer.setLocale('ru');

console.log(localizer.t('iHaveApples', 1)); // > У меня одно яблоко
console.log(localizer.t('iHaveApples', 3)); // > У меня 3 яблока
console.log(localizer.t('iHaveApples', 5)); // > У меня 5 яблок
```

### Translation from a Language Object

The `o()` method is convenient when translations are stored not in
global dictionaries, but directly in the code (in a UI component,
for example).

```js
const localizer = new Localizer({locale: 'en'});

const title = {
  en: 'Hello!',
  ru: 'Привет!',
};

console.log(localizer.o(title)); // > Hello!

// the method also supports pluralization
const counter = {
  en: {$one: '%d item', $many: '%d items'},
  ru: {$one: '%d товар', $few: '%d товара', $many: '%d товаров'},
};

console.log(localizer.o(counter, 5)); // > 5 items

// the same example for a different locale
localizer.setLocale('ru');

console.log(localizer.o(title));      // > Привет!
console.log(localizer.o(counter, 5)); // > 5 товаров
```

If a translation for the current locale is missing, the fallback
locale is used; if it is also unavailable, the translation for the
first language found in the object is returned. If no suitable
translation is found at all (the object is empty, for example), the
method returns an empty string.

## Additional Utilities

The library also exports several useful functions.

### numWords

A function for selecting the correct word form depending on a
number. It is used internally by `Localizer`, but can also be
useful on its own.

```js
import {numWords} from '@e22m4u/js-localizer';

// for the English language (2 forms: one, few/many)
numWords(1, 'item', 'items'); // > 'item'
numWords(5, 'item', 'items'); // > 'items'
numWords(0, 'item', 'items'); // > 'items'

// for the Russian language (3 forms: one, few, many)
numWords(1, 'товар', 'товара', 'товаров');  // > 'товар'
numWords(2, 'товар', 'товара', 'товаров');  // > 'товара'
numWords(5, 'товар', 'товара', 'товаров');  // > 'товаров'
```

## Constructor Options

Parameters are passed to the `new Localizer(options)` constructor.

- `locale?: string`  
  Current locale. Used as the primary locale for looking up the
  corresponding dictionary or translation in a language object.  
  *Default:* `undefined`

- `fallbackLocale?: string`  
  Fallback locale. Used if a translation for the current locale is
  not found, or the current locale is not defined.  
  *Default:* `'en'`

- `dictionaries?: LocalizerDictionaries`  
  An object with dictionaries, where the key is the locale.  
  *Default:* `{}`

- `noEmptyString?: boolean`  
  Disallows the use of empty strings as translations. If enabled,
  and a translation is an empty string, the localizer ignores it
  and attempts to find a translation in the fallback locale.  
  *Default:* `false`

## Instance Methods

- `getLocale(): string`  
  Returns the current locale. If the current locale is not set,
  the fallback locale is returned.

- `setLocale(locale: string): this`  
  Sets the current locale. This value takes priority over the
  fallback locale.

- `getFallbackLocale(): string`  
  Returns the fallback (alternative) locale. Defaults to `"en"`.

- `setFallbackLocale(locale: string): this`  
  Sets the fallback locale. This locale is used for translation
  lookup if the current locale is not set, or if the required key
  is missing from the current locale's dictionary.

- `getAvailableLocales(): string[]`  
  Returns the locales of the available dictionaries.

- `setDictionary(locale: string, dictionary: object): this`  
  Sets or replaces the dictionary for the specified locale.

- `t(key: string, ...args: unknown[]): string`  
  Returns the translated and formatted string for the specified
  dictionary key.

- `o(obj: object, ...args: unknown[]): string`  
  Extracts and formats a translation from the given object for the
  current locale.

## Tests

```bash
npm test
```

## License

MIT