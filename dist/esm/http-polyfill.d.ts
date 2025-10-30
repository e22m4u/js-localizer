import { Constructor } from '@e22m4u/js-service';
import type { IncomingMessage as NodeIncomingMessage } from 'http';
type IncomingMessageClass = Constructor<NodeIncomingMessage>;
declare let IncomingMessage: IncomingMessageClass;
type IncomingMessage = NodeIncomingMessage;
export { IncomingMessage };
