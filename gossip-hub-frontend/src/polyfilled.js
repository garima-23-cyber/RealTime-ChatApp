import { Buffer } from 'buffer';
import process from 'process';
import Stream from 'stream-browserify';

window.global = window;
window.Buffer = Buffer;
window.process = process;

// Standardize process environment
window.process.env = window.process.env || {};
window.process.env.NODE_ENV = 'production';
window.process.nextTick = (fn, ...args) => setTimeout(() => fn(...args), 0);

// Fix Stream for WebRTC/Video
if (Stream.Readable && !Stream.Readable.prototype._readableState) {
    Stream.Readable.prototype._readableState = {};
}