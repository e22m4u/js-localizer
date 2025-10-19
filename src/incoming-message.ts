import {Constructor} from '@e22m4u/js-service';
import type {IncomingMessage as NodeIncomingMessage} from 'http';

type IncomingMessageClass = Constructor<NodeIncomingMessage>;
let IncomingMessage: IncomingMessageClass;
type IncomingMessage = NodeIncomingMessage;

const isNode =
  typeof process !== 'undefined' &&
  process.versions != null &&
  process.versions.node != null;

if (isNode) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    IncomingMessage = require('http').IncomingMessage;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    IncomingMessage = class IncomingMessage {} as IncomingMessageClass;
  }
} else {
  IncomingMessage = class IncomingMessage {} as IncomingMessageClass;
}

export {IncomingMessage};
