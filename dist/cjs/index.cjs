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
  Localizer: () => Localizer,
  LocalizerState: () => LocalizerState,
  numWords: () => numWords
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

// dist/esm/localizer-state.js
var DetectionSource = {
  URL_PATH: "urlPath",
  QUERY: "query",
  LOCAL_STORAGE: "localStorage",
  HTML_TAG: "htmlTag",
  NAVIGATOR: "navigator",
  ENV: "env"
};
var DEFAULT_DETECTION_ORDER = [
  DetectionSource.URL_PATH,
  DetectionSource.QUERY,
  DetectionSource.LOCAL_STORAGE,
  DetectionSource.HTML_TAG,
  DetectionSource.NAVIGATOR,
  DetectionSource.ENV
];
var DEFAULT_FALLBACK_LOCALE = "en";
var DEFAULT_LOCALIZER_OPTIONS = {
  locales: [],
  fallbackLocale: DEFAULT_FALLBACK_LOCALE,
  lookupUrlPathIndex: 0,
  lookupQueryStringKey: "lang",
  lookupLocalStorageKey: "language",
  detectionOrder: DEFAULT_DETECTION_ORDER,
  dictionaries: {}
};
var _LocalizerState = class _LocalizerState {
  dictionaries;
  currentLocale;
  /**
   * Localizer options.
   */
  options = JSON.parse(JSON.stringify(DEFAULT_LOCALIZER_OPTIONS));
  /**
   * Constructor.
   *
   * @param options
   * @param dictionaries
   * @param currentLocale
   */
  constructor(options = {}, dictionaries = {}, currentLocale) {
    this.dictionaries = dictionaries;
    this.currentLocale = currentLocale;
    if (options == null ? void 0 : options.dictionaries)
      this.dictionaries = {
        ...this.dictionaries,
        ...options.dictionaries
      };
    const filteredOptions = Object.fromEntries(Object.entries(options).filter(([, value]) => value != null));
    this.options = Object.assign(this.options, filteredOptions);
  }
  /**
   * Clone with locale.
   *
   * @param locale
   */
  cloneWithLocale(locale) {
    return new _LocalizerState(JSON.parse(JSON.stringify(this.options)), JSON.parse(JSON.stringify(this.dictionaries)), locale);
  }
  /**
   * Get available locales.
   */
  getAvailableLocales() {
    var _a;
    return Array.from(/* @__PURE__ */ new Set([
      ...(_a = this.options.locales) != null ? _a : [],
      ...Object.keys(this.dictionaries)
    ]));
  }
};
__name(_LocalizerState, "LocalizerState");
var LocalizerState = _LocalizerState;

// dist/esm/localizer.js
var BROWSER_LOCALE_SOURCES = [
  DetectionSource.URL_PATH,
  DetectionSource.QUERY,
  DetectionSource.LOCAL_STORAGE,
  DetectionSource.NAVIGATOR,
  DetectionSource.HTML_TAG
];
var _Localizer = class _Localizer {
  /**
   * State.
   */
  state;
  /**
   * Options.
   */
  get options() {
    return this.state.options;
  }
  /**
   * Конструктор класса.
   */
  constructor(optionsOrState) {
    if (optionsOrState instanceof LocalizerState) {
      this.state = optionsOrState;
    } else {
      this.state = new LocalizerState(optionsOrState);
    }
  }
  /**
   * Возвращает текущую локаль.
   */
  getLocale() {
    var _a;
    if (!this.state.currentLocale)
      this._detectLocale();
    return (_a = this.state.currentLocale) != null ? _a : this.options.fallbackLocale;
  }
  /**
   * Устанавливает текущую локаль.
   *
   * @param locale
   */
  setLocale(locale) {
    this.state.currentLocale = locale;
    return this;
  }
  /**
   * Создаёт клон экземпляра с новой локалью.
   *
   * @param locale
   */
  cloneWithLocale(locale) {
    return new _Localizer(this.state.cloneWithLocale(locale));
  }
  /**
   * Добавляет или заменяет справочник для указанной локали.
   *
   * @param locale
   * @param dictionary
   */
  addDictionary(locale, dictionary) {
    this.state.dictionaries[locale] = dictionary;
    return this;
  }
  /**
   * Определяет и устанавливает наиболее подходящую локаль.
   */
  _detectLocale() {
    const availableLocales = this.state.getAvailableLocales();
    const detected = this._lookupLocale(availableLocales);
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
    this.state.currentLocale = finalLocale;
    return finalLocale;
  }
  /**
   * Обход источников для поиска локали.
   *
   * @param availableLocales
   */
  _lookupLocale(availableLocales) {
    const order = this.options.detectionOrder;
    for (const source of order) {
      const candidate = this._detectFromSource(source);
      if (candidate) {
        const supported = this._findSupported(candidate, availableLocales);
        if (supported)
          return supported;
      }
    }
    return;
  }
  /**
   * Извлекает локаль из указанного источника.
   *
   * @param source
   */
  _detectFromSource(source) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (typeof window === "undefined") {
      if (BROWSER_LOCALE_SOURCES.includes(source)) {
        return;
      }
    }
    switch (source) {
      case DetectionSource.URL_PATH: {
        const index = (_a = this.options.lookupUrlPathIndex) != null ? _a : 0;
        const segments = window.location.pathname.replace(/^\/|\/$/g, "").split("/");
        if (segments.length > index && segments[index])
          return segments[index];
        return;
      }
      case DetectionSource.QUERY: {
        const key = (_b = this.options.lookupQueryStringKey) != null ? _b : "lang";
        const params = new URLSearchParams(window.location.search);
        return (_c = params.get(key)) != null ? _c : void 0;
      }
      case DetectionSource.LOCAL_STORAGE: {
        const key = (_d = this.options.lookupLocalStorageKey) != null ? _d : "language";
        return (_e = window.localStorage.getItem(key)) != null ? _e : void 0;
      }
      case DetectionSource.HTML_TAG: {
        return (_f = document.documentElement.getAttribute("lang")) != null ? _f : void 0;
      }
      case DetectionSource.NAVIGATOR: {
        return (_h = (_g = navigator.languages) == null ? void 0 : _g[0]) != null ? _h : void 0;
      }
      case DetectionSource.ENV: {
        if (typeof process === "undefined" || !process.env || typeof process.env !== "object") {
          return;
        }
        const envLang = process.env.LANG || process.env.LANGUAGE || process.env.LC_MESSAGES || process.env.LC_ALL;
        return envLang ? envLang.split(".")[0] : void 0;
      }
      default:
        return;
    }
  }
  /**
   * Ищет подходящую локаль среди доступных, включая базовый язык.
   *
   * @param candidate
   * @param availableLocales
   */
  _findSupported(candidate, availableLocales) {
    if (!candidate)
      return;
    const normalizedCandidate = candidate.toLowerCase();
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
   * Находит и форматирует перевод по ключу из справочника.
   *
   * @param key
   * @param args
   */
  t(key, ...args) {
    let locale = this.getLocale();
    let dict = this.state.dictionaries[locale];
    if (!dict) {
      locale = this.options.fallbackLocale;
      dict = this.state.dictionaries[locale];
    }
    if (!dict)
      return (0, import_js_format.format)(key, ...args);
    const entry = dict[key];
    if (!entry)
      return (0, import_js_format.format)(key, ...args);
    if (typeof entry === "string")
      return (0, import_js_format.format)(entry, ...args);
    if (typeof entry !== "object")
      return (0, import_js_format.format)(key, ...args);
    const res = this._formatNumerableEntry(entry, args);
    if (!res)
      return (0, import_js_format.format)(key, ...args);
    return res;
  }
  /**
   * Форматирует запись для множественных чисел.
   *
   * @param entry
   * @param args
   */
  _formatNumerableEntry(entry, args) {
    const one = entry.one || "";
    const few = entry.few || void 0;
    const many = entry.many || "";
    const numArg = args.find((v) => typeof v === "number");
    if (typeof numArg === "number") {
      const pattern2 = numWords(numArg, one, few, many);
      if (!pattern2)
        return "";
      return (0, import_js_format.format)(pattern2, ...args);
    }
    const pattern = one || few || many;
    if (!pattern)
      return "";
    return (0, import_js_format.format)(pattern, ...args);
  }
  /**
   * Извлекает и форматирует перевод из объекта для текущей локали.
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
      return (_a = this._formatNumerableEntry(entry, args)) != null ? _a : "";
    }
    if (typeof entry === "string") {
      return (0, import_js_format.format)(entry, ...args);
    }
    return "";
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
  Localizer,
  LocalizerState,
  numWords
});
