import {Constructor} from '@e22m4u/js-service';
import type {IncomingMessage as NodeIncomingMessage} from 'http';

type IncomingMessageClass = Constructor<NodeIncomingMessage>;
let IncomingMessage: IncomingMessageClass;
type IncomingMessage = NodeIncomingMessage;

const isNode =
  typeof process !== 'undefined' &&
  process.versions != null &&
  process.versions.node != null;

const isESM = (() => {
  try {
    return new Function('return typeof import.meta === "object"')();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (syntaxError) {
    return false;
  }
})();

if (isNode) {
  if (isESM) {
    const createRequire = new Function(
      'url',
      'return require("node:module").createRequire(url);',
    );
    const getImportMetaUrl = new Function('return import.meta.url');
    const importMetaUrl = getImportMetaUrl();
    const require = createRequire(importMetaUrl);
    IncomingMessage = require('http').IncomingMessage;
  } else {
    const moduleName = 'http';
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    IncomingMessage = require(moduleName).IncomingMessage;
  }
} else {
  IncomingMessage = class IncomingMessage {} as IncomingMessageClass;
}

export {IncomingMessage};
