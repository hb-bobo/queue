(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var Events = /** @class */ (function () {
        /**
         *
         * @param {Shape} shape
         * @param {Attr} attr
         */
        function Events() {
            this._evnetHanlders = {};
        }
        /**
        * @param {string} eventType
        * @param {Function} hanlder
        */
        Events.prototype.on = function (eventType, hanlder) {
            if (this._evnetHanlders[eventType] === undefined) {
                this._evnetHanlders[eventType] = [];
            }
            this._evnetHanlders[eventType].push(hanlder);
        };
        /**
         * @param {string} eventType
         * @param {Function} hanlder
         */
        Events.prototype.off = function (eventType, hanlder) {
            var hanlders = this._evnetHanlders[eventType];
            if (!Array.isArray(hanlders)) {
                return;
            }
            var index = hanlders.indexOf(hanlder);
            if (index === -1) {
                return;
            }
            hanlders.splice(index, 1);
        };
        /**
         * 分发事件
         * @param {string} eventType
         */
        Events.prototype.dispatchEvent = function (eventType) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var hanlders = this._evnetHanlders[eventType];
            if (Array.isArray(hanlders)) {
                hanlders.forEach(function (fn) {
                    fn.apply(void 0, args);
                });
            }
        };
        return Events;
    }());
    exports["default"] = Events;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2V2ZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQUtBO1FBRUk7Ozs7V0FJRztRQUNIO1lBQ0ksSUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7UUFDN0IsQ0FBQztRQUNBOzs7VUFHRTtRQUNILG1CQUFFLEdBQUYsVUFBRyxTQUFpQixFQUFFLE9BQWlCO1lBQ25DLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsS0FBSyxTQUFTLEVBQUU7Z0JBQzlDLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO2FBQ3ZDO1lBQ0QsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDakQsQ0FBQztRQUVEOzs7V0FHRztRQUNILG9CQUFHLEdBQUgsVUFBSSxTQUFpQixFQUFFLE9BQWlCO1lBQ3BDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQzFCLE9BQU87YUFDVjtZQUNELElBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdEMsSUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQ2QsT0FBTzthQUNWO1lBQ0QsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDOUIsQ0FBQztRQUVEOzs7V0FHRztRQUNILDhCQUFhLEdBQWIsVUFBYyxTQUFpQjtZQUFFLGNBQWM7aUJBQWQsVUFBYyxFQUFkLHFCQUFjLEVBQWQsSUFBYztnQkFBZCw2QkFBYzs7WUFDM0MsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNoRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ3pCLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQSxFQUFFO29CQUNmLEVBQUUsZUFBSSxJQUFJLEVBQUU7Z0JBQ2hCLENBQUMsQ0FBQyxDQUFDO2FBQ047UUFDTCxDQUFDO1FBQ0wsYUFBQztJQUFELENBQUMsQUFqREQsSUFpREMifQ==