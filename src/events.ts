
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
    constructor() {
        this._evnetHanlders = {};
    }
     /**
     * @param {string} eventType 
     * @param {Function} hanlder 
     */
    on(eventType: string, hanlder: Function) {
        if (this._evnetHanlders[eventType] === undefined) {
            this._evnetHanlders[eventType] = [];
        }
        this._evnetHanlders[eventType].push(hanlder);
    }

    /**
     * @param {string} eventType 
     * @param {Function} hanlder 
     */
    off(eventType: string, hanlder: Function) {
        let hanlders = this._evnetHanlders[eventType];
        if (!Array.isArray(hanlders)) {
            return;
        }
        let index = hanlders.indexOf(hanlder);
        if (index === -1) {
            return;
        }
        hanlders.splice(index, 1);
    }
    
    /**
     * 分发事件
     * @param {string} eventType 
     */
    dispatchEvent(eventType: string, ...args: any[]) {
        const hanlders = this._evnetHanlders[eventType];
        if (Array.isArray(hanlders)) {
            hanlders.forEach(fn => {
                fn(...args);
            });
        }      
    }
}