import { Buffer } from 'buffer';

window.global = window;
window.Buffer = Buffer;
// Use the browser-specific versions of process and stream
window.process = require('process/browser');
window.process.env.NODE_ENV = 'development';

// Ensure nextTick exists for the stream internal logic
window.process.nextTick = (fn, ...args) => setTimeout(() => fn(...args), 0);

// Provide a more robust stream polyfill
const Stream = require('stream-browserify');
if (Stream.Readable && !Stream.Readable.prototype._readableState) {
    Stream.Readable.prototype._readableState = {};
}