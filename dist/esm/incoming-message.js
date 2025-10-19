let IncomingMessage;
const isNode = typeof process !== 'undefined' &&
    process.versions != null &&
    process.versions.node != null;
if (isNode) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        IncomingMessage = require('http').IncomingMessage;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }
    catch (error) {
        IncomingMessage = class IncomingMessage {
        };
    }
}
else {
    IncomingMessage = class IncomingMessage {
    };
}
export { IncomingMessage };
