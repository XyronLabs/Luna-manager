"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Logger {
    static println(text) {
        this.dateTime.setTime(Date.now());
        this.outputChannel.log("[" + this.dateTime.toLocaleString() + "] " + text);
    }
}
Logger.outputChannel = console;
Logger.dateTime = new Date();
exports.default = Logger;
