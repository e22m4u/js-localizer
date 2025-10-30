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
  DetectionSource: () => DetectionSource,
  LOCALIZER_INITIAL_STATE: () => LOCALIZER_INITIAL_STATE,
  Localizer: () => Localizer,
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

// dist/esm/utils/assign-deep.js
var isMergableObject = /* @__PURE__ */ __name((item) => {
  return item !== null && typeof item === "object" && !Array.isArray(item);
}, "isMergableObject");
function assignDeep(target, ...sources) {
  if (sources.length === 0) {
    return target;
  }
  for (const source of sources) {
    if (!isMergableObject(source)) {
      continue;
    }
    for (const key of Reflect.ownKeys(source)) {
      const targetValue = target[key];
      const sourceValue = source[key];
      if (isMergableObject(targetValue) && isMergableObject(sourceValue)) {
        assignDeep(targetValue, sourceValue);
      } else {
        target[key] = sourceValue;
      }
    }
  }
  return target;
}
__name(assignDeep, "assignDeep");

// dist/esm/localizer.js
var import_js_service = require("@e22m4u/js-service");
var import_js_service2 = require("@e22m4u/js-service");
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
var LOCALIZER_INITIAL_STATE = {
  supportedLocales: [],
  fallbackLocale: "en",
  detectedLocale: void 0,
  forcedLocale: void 0,
  urlPathIndex: 0,
  queryStringKey: "lang",
  localStorageKey: "language",
  requestHeaderName: "accept-language",
  detectionOrder: DEFAULT_DETECTION_ORDER,
  dictionaries: {},
  httpRequest: void 0
};
var _Localizer = class _Localizer extends import_js_service2.Service {
  /**
   * Localizer state.
   */
  state = structuredClone(LOCALIZER_INITIAL_STATE);
  /**
   * Constructor.
   *
   * @param containerOrOptions
   * @param options
   */
  constructor(containerOrOptions, options) {
    if ((0, import_js_service.isServiceContainer)(containerOrOptions)) {
      super(containerOrOptions);
    } else {
      super();
      options = containerOrOptions;
    }
    if (options) {
      const optionsClone = structuredClone({
        ...options,
        httpRequest: void 0
      });
      optionsClone.httpRequest = options.httpRequest;
      Object.assign(this.state, optionsClone);
    }
  }
  /**
   * Get state.
   */
  getState() {
    const state = structuredClone({
      ...this.state,
      httpRequest: void 0
    });
    state.httpRequest = this.state.httpRequest;
    return state;
  }
  /**
   * Get http request.
   */
  getHttpRequest() {
    if (this.state.httpRequest) {
      return this.state.httpRequest;
    }
    const servicesMap = this.container["_services"];
    const servicesCtors = Array.from(servicesMap.keys());
    const requestCtor = servicesCtors.find((ctor) => typeof ctor === "function" && ctor.name === "IncomingMessage");
    if (requestCtor && this.hasService(requestCtor)) {
      return this.getService(requestCtor);
    }
  }
  /**
   * Получить локаль.
   */
  getLocale() {
    var _a;
    if (this.state.forcedLocale)
      return this.state.forcedLocale;
    if (this.state.detectedLocale)
      return this.state.detectedLocale;
    this.detectLocale(true);
    return (_a = this.state.detectedLocale) != null ? _a : this.state.fallbackLocale;
  }
  /**
   * Установить локаль принудительно.
   *
   * @param locale
   */
  setLocale(locale) {
    this.state.forcedLocale = locale;
    return this;
  }
  /**
   * Сбросить принудительную локаль.
   */
  resetLocale() {
    this.state.forcedLocale = void 0;
    return this;
  }
  /**
   * Клонирование экземпляра.
   *
   * @param options
   */
  clone(options) {
    const newState = this.getState();
    Object.assign(newState, options);
    return new _Localizer(this.container, newState);
  }
  /**
   * Клонирование экземпляра с новой локалью.
   *
   * @param locale
   */
  withLocale(locale) {
    const inst = this.clone();
    inst.setLocale(locale);
    return inst;
  }
  /**
   * Клонирование экземпляра с локалью из заголовка запроса.
   *
   * @param req
   */
  withHttpRequest(req) {
    const inst = this.clone({ httpRequest: req, detectedLocale: void 0 });
    return inst;
  }
  /**
   * Получить доступные локали.
   */
  getAvailableLocales() {
    const locales = /* @__PURE__ */ new Set([
      ...Object.keys(this.state.dictionaries),
      ...this.state.supportedLocales
    ]);
    if (this.state.forcedLocale)
      locales.add(this.state.forcedLocale);
    return Array.from(locales);
  }
  /**
   * Получить справочники.
   */
  getDictionaries() {
    return structuredClone(this.state.dictionaries);
  }
  /**
   * Получить справочник.
   *
   * @param locale
   */
  getDictionary(locale) {
    const dicts = this.state.dictionaries;
    return dicts[locale] ? structuredClone(dicts[locale]) : {};
  }
  /**
   * Установить справочники.
   *
   * @param dictionaries
   */
  setDictionaries(dictionaries) {
    this.state.dictionaries = dictionaries;
    this.state.detectedLocale = void 0;
    return this;
  }
  /**
   * Установить справочник.
   *
   * @param locale
   * @param dictionary
   */
  setDictionary(locale, dictionary) {
    this.state.dictionaries[locale] = dictionary;
    this.state.detectedLocale = void 0;
    return this;
  }
  /**
   * Добавить справочники.
   *
   * @param dictionaries
   */
  addDictionaries(dictionaries) {
    assignDeep(this.state.dictionaries, dictionaries);
    this.state.detectedLocale = void 0;
    return this;
  }
  /**
   * Добавить справочник.
   *
   * @param locale
   * @param dictionary
   */
  addDictionary(locale, dictionary) {
    var _a;
    this.state.dictionaries[locale] = (_a = this.state.dictionaries[locale]) != null ? _a : {};
    assignDeep(this.state.dictionaries[locale], dictionary);
    this.state.detectedLocale = void 0;
    return this;
  }
  /**
   * Определить подходящую локаль.
   *
   * @param noResetLocale
   */
  detectLocale(noResetLocale) {
    const availableLocales = this.getAvailableLocales();
    let detected;
    for (const source of this.state.detectionOrder) {
      detected = this.detectLocaleFromSource(availableLocales, source);
      if (detected)
        break;
    }
    let finalLocale = detected;
    const fallback = this.state.fallbackLocale;
    if (!finalLocale) {
      if (fallback && availableLocales.includes(fallback)) {
        finalLocale = fallback;
      } else if (availableLocales.length) {
        finalLocale = availableLocales[0];
      } else {
        finalLocale = fallback;
      }
    }
    this.state.detectedLocale = finalLocale;
    if (!noResetLocale)
      this.resetLocale();
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
    var _a, _b, _c, _d, _e;
    if (typeof window === "undefined") {
      if (BROWSER_LOCALE_SOURCES.includes(source)) {
        return;
      }
    }
    let candidate;
    switch (source) {
      case DetectionSource.REQUEST_HEADER: {
        const httpRequest = this.getHttpRequest();
        if (!httpRequest)
          break;
        const headerName = this.state.requestHeaderName.toLocaleLowerCase();
        const headerValue = httpRequest.headers[headerName];
        if (headerValue && typeof headerValue === "string") {
          candidate = headerValue;
        }
        break;
      }
      case DetectionSource.URL_PATH: {
        const index = this.state.urlPathIndex;
        const segments = window.location.pathname.replace(/^\/|\/$/g, "").split("/");
        if (segments.length > index && segments[index])
          candidate = segments[index];
        break;
      }
      case DetectionSource.QUERY: {
        const key = this.state.queryStringKey;
        const params = new URLSearchParams(window.location.search);
        candidate = (_a = params.get(key)) != null ? _a : void 0;
        break;
      }
      case DetectionSource.LOCAL_STORAGE: {
        const key = this.state.localStorageKey;
        candidate = (_b = window.localStorage.getItem(key)) != null ? _b : void 0;
        break;
      }
      case DetectionSource.HTML_TAG: {
        candidate = (_c = document.documentElement.getAttribute("lang")) != null ? _c : void 0;
        break;
      }
      case DetectionSource.NAVIGATOR: {
        candidate = (_e = (_d = navigator.languages) == null ? void 0 : _d[0]) != null ? _e : void 0;
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
    var _a, _b;
    const locale = this.getLocale();
    const fallbackLocale = this.state.fallbackLocale;
    let dict = (_a = this.state.dictionaries[locale]) != null ? _a : {};
    let entry = dict[key];
    if (!entry) {
      dict = (_b = this.state.dictionaries[fallbackLocale]) != null ? _b : {};
      entry = dict[key];
      if (!entry) {
        return this.format(key, ...args);
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
      locale = this.state.fallbackLocale;
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
  DetectionSource,
  LOCALIZER_INITIAL_STATE,
  Localizer,
  numWords
});
