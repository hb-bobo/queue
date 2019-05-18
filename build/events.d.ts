interface EventHanlders {
    [event: string]: Function[];
}
export default class Events {
    _evnetHanlders: EventHanlders;
    /**
     *
     * @param {Shape} shape
     * @param {Attr} attr
     */
    constructor();
    /**
    * @param {string} eventType
    * @param {Function} hanlder
    */
    on(eventType: string, hanlder: Function): void;
    /**
     * @param {string} eventType
     * @param {Function} hanlder
     */
    off(eventType: string, hanlder: Function): void;
    /**
     * 分发事件
     * @param {string} eventType
     */
    dispatchEvent(eventType: string, ...args: any[]): void;
}
export {};
