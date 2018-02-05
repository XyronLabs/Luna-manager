export default class Logger {
    private static outputChannel = console;
    private static dateTime: Date = new Date();

    static println(text: string): void {
        this.dateTime.setTime(Date.now());
        this.outputChannel.log("[" + this.dateTime.toLocaleString() + "] " + text);
    }
}