"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// dist/esm/index.js
var index_exports = {};
__export(index_exports, {
  BROWSER_LOCALE_SOURCES: () => BROWSER_LOCALE_SOURCES,
  DEFAULT_DETECTION_ORDER: () => DEFAULT_DETECTION_ORDER,
  DEFAULT_FALLBACK_LOCALE: () => DEFAULT_FALLBACK_LOCALE,
  DEFAULT_LOCALIZER_OPTIONS: () => DEFAULT_LOCALIZER_OPTIONS,
  DetectionSource: () => DetectionSource,
  LOCALIZER_ROOT_NAMESPACE: () => LOCALIZER_ROOT_NAMESPACE,
  Localizer: () => Localizer,
  numWords: () => numWords,
  removeEmptyKeys: () => removeEmptyKeys
});
module.exports = __toCommonJS(index_exports);

// dist/esm/localizer.js
var import_js_format = require("@e22m4u/js-format");

// dist/esm/utils/num-words.js
function numWords(value, one, few, many) {
  if (few == null && many == null)
    return one;
  if (few == null || many == null) {
    const pluralForm = few || many;
    return Math.abs(value) === 1 ? one : pluralForm;
  }
  if (!Number.isInteger(value))
    return few;
  const absValue = Math.abs(value);
  const val100 = absValue % 100;
  const val10 = val100 % 10;
  if (val100 > 10 && val100 < 20)
    return many;
  if (val10 > 1 && val10 < 5)
    return few;
  if (val10 === 1)
    return one;
  return many;
}
__name(numWords, "numWords");

// dist/esm/utils/remove-empty-keys.js
function removeEmptyKeys(plainObject, removeWhen = (v) => v == null) {
  return Object.fromEntries(Object.entries(plainObject).filter(([, value]) => !removeWhen(value)));
}
__name(removeEmptyKeys, "removeEmptyKeys");

// dist/esm/localizer.js
var LOCALIZER_ROOT_NAMESPACE = "$root";
var DetectionSource = {
  REQUEST_HEADER: "requestHeader",
  URL_PATH: "urlPath",
  QUERY: "query",
  LOCAL_STORAGE: "localStorage",
  HTML_TAG: "htmlTag",
  NAVIGATOR: "navigator",
  ENV: "env"
};
var DEFAULT_DETECTION_ORDER = [
  DetectionSource.REQUEST_HEADER,
  DetectionSource.URL_PATH,
  DetectionSource.QUERY,
  DetectionSource.LOCAL_STORAGE,
  DetectionSource.HTML_TAG,
  DetectionSource.NAVIGATOR,
  DetectionSource.ENV
];
var BROWSER_LOCALE_SOURCES = [
  DetectionSource.URL_PATH,
  DetectionSource.QUERY,
  DetectionSource.LOCAL_STORAGE,
  DetectionSource.NAVIGATOR,
  DetectionSource.HTML_TAG
];
var DEFAULT_FALLBACK_LOCALE = "en";
var DEFAULT_LOCALIZER_OPTIONS = {
  namespace: void 0,
  locales: [],
  fallbackLocale: DEFAULT_FALLBACK_LOCALE,
  urlPathIndex: 0,
  queryStringKey: "lang",
  localStorageKey: "language",
  requestHeaderName: "accept-language",
  detectionOrder: DEFAULT_DETECTION_ORDER
};
var _Localizer = class _Localizer {
  /**
   * Dictionaries by namespace.
   */
  nsDictionaries = /* @__PURE__ */ new Map();
  /**
   * Localizer options.
   */
  options = structuredClone(DEFAULT_LOCALIZER_OPTIONS);
  /**
   * Detected locale.
   */
  detectedLocale;
  /**
   * Forced locale.
   */
  forcedLocale;
  /**
   * Request.
   */
  request;
  /**
   * Constructor.
   */
  constructor(options) {
    if (options) {
      const filteredOptions = removeEmptyKeys(options);
      Object.assign(this.options, filteredOptions);
    }
  }
  /**
   * Получить пространство имен.
   */
  getNamespace() {
    return this.options.namespace;
  }
  /**
   * Set request.
   */
  setRequest(req) {
    this.request = req;
    this.detectLocale();
    return this;
  }
  /**
   * Получить локаль.
   */
  getLocale() {
    var _a;
    if (this.forcedLocale)
      return this.forcedLocale;
    if (this.detectedLocale)
      return this.detectedLocale;
    this.detectLocale();
    return (_a = this.detectedLocale) != null ? _a : this.options.fallbackLocale;
  }
  /**
   * Сбросить принудительную локаль.
   */
  resetForcedLocale() {
    this.forcedLocale = void 0;
    return this;
  }
  /**
   * Установить локаль принудительно.
   *
   * @param locale
   */
  forceLocale(locale) {
    this.forcedLocale = locale;
    return this;
  }
  /**
   * Клонирование экземпляра.
   *
   * @param options
   */
  clone(options) {
    const newOptions = structuredClone(this.options);
    if (options) {
      const filteredOptions = removeEmptyKeys(options);
      Object.assign(newOptions, filteredOptions);
    }
    const inst = new _Localizer(newOptions);
    inst.nsDictionaries = structuredClone(this.nsDictionaries);
    inst.detectedLocale = this.detectedLocale;
    inst.forcedLocale = this.forcedLocale;
    inst.request = this.request;
    return inst;
  }
  /**
   * Клонирование экземпляра с новой локалью.
   *
   * @param locale
   */
  cloneWithLocale(locale) {
    const inst = this.clone();
    inst.forceLocale(locale);
    return inst;
  }
  /**
   * Клонирование экземпляра с локалью из заголовка запроса.
   *
   * @param req
   */
  cloneWithRequest(req) {
    const inst = this.clone();
    inst.request = req;
    inst.detectLocale(true);
    return inst;
  }
  /**
   * Clone with namespace.
   *
   * @param namespace
   */
  cloneWithNamespace(namespace) {
    return this.clone({ namespace });
  }
  /**
   * Получить доступные локали.
   */
  getAvailableLocales() {
    const ns = this.getNamespace() || LOCALIZER_ROOT_NAMESPACE;
    const nsDicts = this.nsDictionaries.get(ns);
    const rootDicts = this.nsDictionaries.get(LOCALIZER_ROOT_NAMESPACE);
    const locales = /* @__PURE__ */ new Set([
      ...Object.keys(rootDicts || {}),
      ...Object.keys(nsDicts || {})
    ]);
    return Array.from(locales);
  }
  /**
   * Получить справочники.
   *
   * @param namespace
   */
  getDictionaries(namespace) {
    if (namespace) {
      return this.nsDictionaries.get(namespace || "") || {};
    }
    return this.nsDictionaries.get(LOCALIZER_ROOT_NAMESPACE) || {};
  }
  /**
   * Получить справочник.
   *
   * @param namespace
   * @param locale
   */
  getDictionary(namespaceOrLocale, locale) {
    let namespace;
    if (arguments.length === 2) {
      namespace = namespaceOrLocale;
      locale = locale;
    } else {
      locale = namespaceOrLocale;
    }
    const dicts = this.getDictionaries(namespace);
    return dicts[locale] || {};
  }
  /**
   * Установить справочники.
   *
   * @param namespaceOrDictionaries
   * @param dictionaries
   */
  setDictionaries(namespaceOrDictionaries, dictionaries) {
    let namespace;
    if (arguments.length === 2) {
      namespace = namespaceOrDictionaries;
      dictionaries = dictionaries;
    } else {
      dictionaries = namespaceOrDictionaries;
    }
    const ns = namespace != null ? namespace : LOCALIZER_ROOT_NAMESPACE;
    this.nsDictionaries.set(ns, dictionaries);
    this.detectLocale();
    return this;
  }
  /**
   * Установить справочник.
   *
   * @param locale
   * @param dictionary
   * @param namespace
   */
  setDictionary(namespaceOrLocale, localeOrDictionary, dictionary) {
    let namespace, locale;
    if (arguments.length === 3) {
      namespace = namespaceOrLocale;
      locale = localeOrDictionary;
      dictionary = dictionary;
    } else {
      locale = namespaceOrLocale;
      dictionary = localeOrDictionary;
    }
    const ns = namespace != null ? namespace : LOCALIZER_ROOT_NAMESPACE;
    const dicts = this.nsDictionaries.get(ns) || {};
    dicts[locale] = dictionary;
    this.nsDictionaries.set(ns, dicts);
    this.detectLocale();
    return this;
  }
  /**
   * Добавить справочники.
   *
   * @param dictionaries
   * @param namespace
   */
  addDictionaries(namespaceOrDictionaries, dictionaries) {
    let namespace;
    if (arguments.length === 2) {
      namespace = namespaceOrDictionaries;
      dictionaries = dictionaries;
    } else {
      dictionaries = namespaceOrDictionaries;
    }
    Object.keys(dictionaries).forEach((locale) => {
      this.addDictionary(namespace, locale, dictionaries[locale]);
    });
    this.detectLocale();
    return this;
  }
  /**
   * Добавить справочник.
   *
   * @param locale
   * @param dictionary
   * @param namespace
   */
  addDictionary(namespaceOrLocale, localeOrDictionary, dictionary) {
    let namespace, locale;
    if (arguments.length === 3) {
      namespace = namespaceOrLocale;
      locale = localeOrDictionary;
      dictionary = dictionary;
    } else {
      locale = namespaceOrLocale;
      dictionary = localeOrDictionary;
    }
    const ns = namespace != null ? namespace : LOCALIZER_ROOT_NAMESPACE;
    const dicts = this.nsDictionaries.get(ns) || {};
    dicts[locale] = dicts[locale] || {};
    Object.assign(dicts[locale], dictionary);
    this.nsDictionaries.set(ns, dicts);
    this.detectLocale();
    return this;
  }
  /**
   * Определить подходящую локаль.
   *
   * @param resetForcedLocale
   */
  detectLocale(resetForcedLocale) {
    const availableLocales = this.getAvailableLocales();
    let detected;
    for (const source of this.options.detectionOrder) {
      detected = this.detectLocaleFromSource(availableLocales, source);
      if (detected)
        break;
    }
    let finalLocale = detected;
    const fallback = this.options.fallbackLocale;
    if (!finalLocale) {
      if (fallback && availableLocales.includes(fallback)) {
        finalLocale = fallback;
      } else if (availableLocales.length) {
        finalLocale = availableLocales[0];
      } else {
        finalLocale = fallback;
      }
    }
    this.detectedLocale = finalLocale;
    if (resetForcedLocale)
      this.resetForcedLocale();
    return finalLocale;
  }
  /**
   * Найти подходящую локаль среди доступных, включая базовый язык.
   *
   * @param candidate
   * @param availableLocales
   */
  findSupportedLocale(candidate, availableLocales) {
    if (!candidate)
      return;
    const exactLang = candidate.split(",")[0];
    const normalizedCandidate = exactLang.toLowerCase();
    const exactMatch = availableLocales.find((l) => l.toLowerCase() === normalizedCandidate);
    if (exactMatch)
      return exactMatch;
    const baseLang = normalizedCandidate.split("-")[0].split("_")[0];
    const baseMatch = availableLocales.find((l) => l.toLowerCase() === baseLang);
    if (baseMatch)
      return baseMatch;
    return;
  }
  /**
   * Определить локаль по источнику.
   *
   * @param availableLocales
   * @param source
   * @param options
   */
  detectLocaleFromSource(availableLocales, source) {
    var _a, _b, _c, _d, _e, _f, _g;
    if (typeof window === "undefined") {
      if (BROWSER_LOCALE_SOURCES.includes(source)) {
        return;
      }
    }
    let candidate;
    switch (source) {
      case DetectionSource.REQUEST_HEADER: {
        if (!this.request)
          break;
        const headerName = this.options.requestHeaderName.toLocaleLowerCase();
        const headerValue = this.request.headers[headerName];
        if (headerValue && typeof headerValue === "string") {
          candidate = headerValue;
        }
        break;
      }
      case DetectionSource.URL_PATH: {
        const index = this.options.urlPathIndex;
        const segments = window.location.pathname.replace(/^\/|\/$/g, "").split("/");
        if (segments.length > index && segments[index])
          candidate = segments[index];
        break;
      }
      case DetectionSource.QUERY: {
        const key = (_a = this.options.queryStringKey) != null ? _a : "lang";
        const params = new URLSearchParams(window.location.search);
        candidate = (_b = params.get(key)) != null ? _b : void 0;
        break;
      }
      case DetectionSource.LOCAL_STORAGE: {
        const key = (_c = this.options.localStorageKey) != null ? _c : "language";
        candidate = (_d = window.localStorage.getItem(key)) != null ? _d : void 0;
        break;
      }
      case DetectionSource.HTML_TAG: {
        candidate = (_e = document.documentElement.getAttribute("lang")) != null ? _e : void 0;
        break;
      }
      case DetectionSource.NAVIGATOR: {
        candidate = (_g = (_f = navigator.languages) == null ? void 0 : _f[0]) != null ? _g : void 0;
        break;
      }
      case DetectionSource.ENV: {
        if (typeof process === "undefined" || !process.env || typeof process.env !== "object") {
          break;
        }
        const envLang = process.env.LANG || process.env.LANGUAGE || process.env.LC_MESSAGES || process.env.LC_ALL;
        candidate = envLang ? envLang.split(".")[0] : void 0;
        break;
      }
    }
    if (candidate)
      return this.findSupportedLocale(candidate, availableLocales);
  }
  /**
   * Найти и сформировать перевод по ключу из справочника.
   *
   * @param key
   * @param args
   */
  t(key, ...args) {
    const ns = this.getNamespace();
    const locale = this.getLocale();
    const fallbackLocale = this.options.fallbackLocale;
    let dict = this.getDictionary(ns, locale);
    let entry = dict[key];
    if (!entry) {
      dict = this.getDictionary(ns, fallbackLocale);
      entry = dict[key];
      if (!entry) {
        if (LOCALIZER_ROOT_NAMESPACE !== ns) {
          dict = this.getDictionary(locale);
          entry = dict[key];
          if (!entry) {
            dict = this.getDictionary(fallbackLocale);
            entry = dict[key];
            if (!entry) {
              return this.format(key, ...args);
            }
          }
        } else {
          return this.format(key, ...args);
        }
      }
    }
    if (typeof entry === "string")
      return this.format(entry, ...args);
    if (typeof entry !== "object")
      return this.format(key, ...args);
    const res = this.formatNumerableEntry(entry, args);
    if (!res)
      return this.format(key, ...args);
    return res;
  }
  /**
   * Сформировать запись для множественных чисел.
   *
   * @param entry
   * @param args
   */
  formatNumerableEntry(entry, args) {
    const one = entry.one || void 0;
    const few = entry.few || void 0;
    const many = entry.many || void 0;
    const fallback = one || few || many || "";
    const numArg = args.find((v) => typeof v === "number");
    if (typeof numArg === "number") {
      let pattern = numWords(numArg, one || "", few, many);
      if (!pattern)
        pattern = numWords(numArg, fallback);
      if (!pattern)
        return fallback;
      return this.format(pattern, ...args);
    }
    if (!fallback)
      return "";
    return this.format(fallback, ...args);
  }
  /**
   * Извлечь и форматировать перевод из объекта для текущей локали.
   *
   * @param obj
   * @param args
   */
  o(obj, ...args) {
    var _a;
    let locale = this.getLocale();
    let entry = obj[locale];
    if (!entry) {
      locale = this.options.fallbackLocale;
      entry = obj[locale];
    }
    if (entry == null) {
      const firstAvailableKey = Object.keys(obj).find((key) => obj[key] !== void 0);
      if (firstAvailableKey) {
        entry = obj[firstAvailableKey];
      }
    }
    if (entry == null)
      return "";
    if (typeof entry === "object" && entry != null) {
      return (_a = this.formatNumerableEntry(entry, args)) != null ? _a : "";
    }
    if (typeof entry === "string") {
      return this.format(entry, ...args);
    }
    return "";
  }
  /**
   * Format.
   *
   * @param pattern
   * @param args
   */
  format(pattern, ...args) {
    if (/%[sdjvl]/.test(pattern)) {
      return (0, import_js_format.format)(pattern, ...args);
    } else {
      return pattern;
    }
  }
};
__name(_Localizer, "Localizer");
var Localizer = _Localizer;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BROWSER_LOCALE_SOURCES,
  DEFAULT_DETECTION_ORDER,
  DEFAULT_FALLBACK_LOCALE,
  DEFAULT_LOCALIZER_OPTIONS,
  DetectionSource,
  LOCALIZER_ROOT_NAMESPACE,
  Localizer,
  numWords,
  removeEmptyKeys
});
