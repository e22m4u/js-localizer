## @e22m4u/js-localizer

![npm version](https://badge.fury.io/js/@e22m4u%2Fjs-localizer.svg)
![license](https://img.shields.io/badge/license-mit-blue.svg)

English | [Русский](./README.ru.md)

Lightweight localization service for JavaScript.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  * [Nested Dictionaries](#nested-dictionaries)
  * [Pluralization](#pluralization)
  * [Translation from a Language Object](#translation-from-a-language-object)
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
// (note, the `o` method is used instead of `t`)
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

The localization service supports the use of nested objects in dictionaries.
Access to nested values is performed using *dot* notation.

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

An object with special keys is used for plural forms handling. The list of keys
depends on the selected locale.

**Example for the English language (2 forms)**

For languages with two plural forms (e.g., English), it is sufficient to specify
`$one` and `$other`. The library automatically uses the second form for all
numbers except `1` and `-1`.

```js
localizer.setDictionary('en', {
  iHaveApples: {
    $one: 'I have an apple',
    $other: 'I have %d apples',
  },
});

localizer.setLocale('en');

console.log(localizer.t('iHaveApples', 1));   // > I have an apple
console.log(localizer.t('iHaveApples', 0));   // > I have 0 apples
console.log(localizer.t('iHaveApples', 10));  // > I have 10 apples
```

**Example for the Russian language (3 forms)**

For languages with three plural forms (e.g., Russian), three keys (`$one`,
`$few`, and `$many`) must be specified. The library automatically selects the
required form depending on the number.

```js
localizer.setDictionary('ru', {
  iHaveApples: {
    $one: 'У меня одно яблоко',
    $few: 'У меня %d яблока',  // for numbers 2, 3, 4
    $many: 'У меня %d яблок',  // for 0, 5, 6...
    $other: 'У меня %d яблока' // for fractional numbers (optional)
  },
});

localizer.setLocale('ru');

console.log(localizer.t('iHaveApples', 1)); // > У меня одно яблоко
console.log(localizer.t('iHaveApples', 3)); // > У меня 3 яблока
console.log(localizer.t('iHaveApples', 5)); // > У меня 5 яблок
```

**Example for the Arabic language (6 forms)**

For languages with six plural forms (e.g., Arabic), a full set of keys is
used (`$zero`, `$one`, `$two`, `$few`, `$many`, and `$other`). The suitable
form is selected automatically depending on the passed number.

```js
localizer.setDictionary('ar', {
  iHaveApples: {
    $zero: '٠ تفاحة',    // for 0
    $one: 'تفاحة واحدة', // for 1
    $two: 'تفاحتان',     // for 2
    $few: '%d تفاحات',   // for 3-10
    $many: '%d تفاحة',   // for 11-99
    $other: '%d تفاحة'   // for 100 and more, as well as for fractions
  },
});

localizer.setLocale('ar');

console.log(localizer.t('iHaveApples', 0));   // > ٠ تفاحة
console.log(localizer.t('iHaveApples', 1));   // > تفاحة واحدة
console.log(localizer.t('iHaveApples', 2));   // > تفاحتان
console.log(localizer.t('iHaveApples', 5));   // > 5 تفاحات
console.log(localizer.t('iHaveApples', 15));  // > 15 تفاحة
console.log(localizer.t('iHaveApples', 100)); // > 100 تفاحة
```

#### Trick with multiple arguments

If a translation uses multiple parameters (e.g., a string user ID and
an amount), the library automatically searches for the first argument
of type `number` to determine the correct plural form. String arguments
(even if they consist entirely of digits) are safely ignored during
the pluralization evaluation.

```js
// the string "1" is formatted as %s and ignored for pluralization,
// the number 5 is formatted as %d and determines the plural form ($other)
console.log(localizer.o({
  en: {
    $one: 'User %s has %d apple',
    $other: 'User %s has %d apples'
  }
}, '1', 5)); 
// > User 1 has 5 apples
```

This way, the number `1` is hidden from the pluralization logic because
it is passed as a string. The localizer only responds to the first argument
with a numeric data type, which in this case is the number `5`.

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
  en: {$one: '%d item', $other: '%d items'},
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