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
  DEFAULT_DETECTION_ORDER: () => DEFAULT_DETECTION_ORDER,
  DEFAULT_FALLBACK_LOCALE: () => DEFAULT_FALLBACK_LOCALE,
  DEFAULT_LOCALIZER_OPTIONS: () => DEFAULT_LOCALIZER_OPTIONS,
  DetectionSource: () => DetectionSource,
  Localizer: () => Localizer,
  LocalizerState: () => LocalizerState,
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
  defaultLocale: void 0,
  fallbackLocale: DEFAULT_FALLBACK_LOCALE,
  urlPathIndex: 0,
  queryStringKey: "lang",
  localStorageKey: "language",
  requestHeaderKey: "accept-language",
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
    const filteredOptions = removeEmptyKeys(options);
    this.options = Object.assign(this.options, filteredOptions);
    if (this.options.defaultLocale && !currentLocale)
      this.currentLocale = this.options.defaultLocale;
  }
  /**
   * Clone.
   */
  clone() {
    return new _LocalizerState(JSON.parse(JSON.stringify(this.options)), JSON.parse(JSON.stringify(this.dictionaries)), this.currentLocale);
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

// dist/esm/find-supported-locale.js
function findSupportedLocale(candidate, availableLocales) {
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
__name(findSupportedLocale, "findSupportedLocale");

// dist/esm/detectors/detect-locale-from-source.js
var BROWSER_LOCALE_SOURCES = [
  DetectionSource.URL_PATH,
  DetectionSource.QUERY,
  DetectionSource.LOCAL_STORAGE,
  DetectionSource.NAVIGATOR,
  DetectionSource.HTML_TAG
];
function detectLocaleFromSource(availableLocales, source, options) {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  if (typeof window === "undefined") {
    if (BROWSER_LOCALE_SOURCES.includes(source)) {
      return;
    }
  }
  let candidate;
  switch (source) {
    case DetectionSource.URL_PATH: {
      const index = (_a = options == null ? void 0 : options.urlPathIndex) != null ? _a : 0;
      const segments = window.location.pathname.replace(/^\/|\/$/g, "").split("/");
      if (segments.length > index && segments[index])
        candidate = segments[index];
      break;
    }
    case DetectionSource.QUERY: {
      const key = (_b = options == null ? void 0 : options.queryStringKey) != null ? _b : "lang";
      const params = new URLSearchParams(window.location.search);
      candidate = (_c = params.get(key)) != null ? _c : void 0;
      break;
    }
    case DetectionSource.LOCAL_STORAGE: {
      const key = (_d = options == null ? void 0 : options.localStorageKey) != null ? _d : "language";
      candidate = (_e = window.localStorage.getItem(key)) != null ? _e : void 0;
      break;
    }
    case DetectionSource.HTML_TAG: {
      candidate = (_f = document.documentElement.getAttribute("lang")) != null ? _f : void 0;
      break;
    }
    case DetectionSource.NAVIGATOR: {
      candidate = (_h = (_g = navigator.languages) == null ? void 0 : _g[0]) != null ? _h : void 0;
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
    return findSupportedLocale(candidate, availableLocales);
}
__name(detectLocaleFromSource, "detectLocaleFromSource");

// dist/esm/detectors/detect-locale-from-request-header.js
function detectLocaleFromRequestHeader(availableLocales, headers, headerName) {
  headerName = headerName.toLocaleLowerCase();
  let candidates = headers[headerName];
  if (!candidates)
    return;
  if (typeof candidates === "string")
    candidates = [candidates];
  if (!Array.isArray(candidates))
    return;
  let locale;
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "string")
      continue;
    locale = findSupportedLocale(candidate, availableLocales);
    if (locale)
      break;
  }
  return locale;
}
__name(detectLocaleFromRequestHeader, "detectLocaleFromRequestHeader");

// dist/esm/localizer.js
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
   * Get locale.
   */
  getLocale() {
    var _a, _b;
    if (!this.state.currentLocale)
      this.state.currentLocale = this._detectSupportedLocale();
    return (_b = (_a = this.state.currentLocale) != null ? _a : this.options.defaultLocale) != null ? _b : this.options.fallbackLocale;
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
   * Клонирование экземпляра.
   */
  clone() {
    return new _Localizer(this.state.clone());
  }
  /**
   * Клонирование экземпляра с новой локалью.
   *
   * @param locale
   */
  cloneWithLocale(locale) {
    return new _Localizer(this.state.cloneWithLocale(locale));
  }
  /**
   * Клонирование экземпляра с локалью из заголовка запроса.
   *
   * @param req
   */
  cloneWithLocaleFromRequest(req) {
    const locale = detectLocaleFromRequestHeader(this.state.getAvailableLocales(), req.headers, this.options.requestHeaderKey);
    if (!locale)
      return this.clone();
    return this.cloneWithLocale(locale);
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
   * Определяет наиболее подходящую локаль.
   */
  _detectSupportedLocale() {
    const availableLocales = this.state.getAvailableLocales();
    let detected;
    for (const source of this.options.detectionOrder) {
      detected = detectLocaleFromSource(availableLocales, source, this.options);
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
    return finalLocale;
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
  DEFAULT_DETECTION_ORDER,
  DEFAULT_FALLBACK_LOCALE,
  DEFAULT_LOCALIZER_OPTIONS,
  DetectionSource,
  Localizer,
  LocalizerState,
  numWords,
  removeEmptyKeys
});
