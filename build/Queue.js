var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./events"], factory);
    }
})(function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var events_1 = require("./events");
    var arrayIndexOf = function (array, target) {
        var index = -1;
        for (var i = 0; i < array.length; i++) {
            var item = array[i];
            if (item === target) {
                index = i;
                break;
            }
        }
        return index;
    };
    /**
    * 队列
    * @interface Option {
    *   limit: Number, // 最大处理的个数
    *   autoStart: boolean, // 是否自动开始
    *   autoDoNext: boolean, // 完成一个后是否自动添加后面的任务
    * }
    * @constructor constructor(Option)
    * @example
    * // 一
    * const queue = new Queue({ limit: 5 });
    * const queueItem = (done) => {
    *     'todo Something';
    *     // 过了很久后处理完了一个
    *     done();
    * };
    * // 会自动开始处理队列
    * queue.push(queueItem);
    *
    *
    * // 二。单个任务按顺序处理时 limit =  1
    * const queue = new Queue({ limit: 1, autoStart: false });
    * const queueItem = () => {'todo Something';};
    * queue.push(queueItem);
    * // 一段时间后，
    * queue.next();
    * // 又一段时间后
    * queue.next();
    */
    var Queue = /** @class */ (function (_super) {
        __extends(Queue, _super);
        function Queue(option) {
            var _this = _super.call(this) || this;
            _this.limit = 1;
            _this.autoStart = true;
            _this.autoDoNext = true;
            // 队列
            _this.line = [];
            // 将要处理的队列(还未处理过的)
            _this.willProcessedQueue = [];
            // 处理中的队列
            _this.processingQueue = [];
            // 已处理的队列
            _this.processedQueue = [];
            _this.nextIndex = -1;
            _this.init(option);
            return _this;
        }
        Queue.prototype.init = function (_a) {
            var _b = _a === void 0 ? {} : _a, _c = _b.limit, limit = _c === void 0 ? 1 : _c, _d = _b.autoStart, autoStart = _d === void 0 ? true : _d, _e = _b.autoDoNext, autoDoNext = _e === void 0 ? true : _e;
            this.limit = limit;
            this.autoStart = autoStart;
            this.autoDoNext = autoDoNext;
            this.line = [];
            this.willProcessedQueue = [];
            this.processingQueue = [];
            this.processedQueue = [];
            this.nextIndex = -1;
        };
        /**
         * 获取下一个
         */
        Queue.prototype.getNext = function () {
            return this.willProcessedQueue[0];
        };
        /**
         * 清空处理队列
         */
        Queue.prototype.clear = function (type) {
            if (type in this && type !== 'all') {
                var queue = this[type];
                queue.splice(0, queue.length - 1);
                return queue;
            }
            this.line = [];
            this.processingQueue = [];
            this.processedQueue = [];
            this.willProcessedQueue = [];
            this.nextIndex = -1;
        };
        /**
         * 完成某一个正在处理中的任务
         */
        Queue.prototype.done = function (target, autoDoNext) {
            return this.removeFromprocessingQueue(target, autoDoNext);
        };
        /**
         * 处理完成，执行下一个
         * this.limit = 1才能用
         */
        Queue.prototype.next = function () {
            if (this.limit !== 1) {
                throw Error('use next() only limit = 1');
            }
            // 添加一个同时要删除一个；
            if (this.processingQueue.length > 0) {
                this.removeFromprocessingQueue(this.processingQueue[0]);
            }
            if (this.getNext()) {
                this.pushToprocessingQueue(this.getNext());
            }
        };
        /**
         * 添加排队成员，自动添加到处理中的队列
         */
        Queue.prototype.push = function (item) {
            if (typeof item !== 'function') {
                throw TypeError('Queue.push(Function)');
            }
            var length = this.line.push(item);
            this.willProcessedQueue.push(item);
            if (this.autoStart) {
                this.pushToprocessingQueue(item);
            }
            return length;
        };
        /**
         * 添加到处理中队列
         */
        Queue.prototype.pushToprocessingQueue = function (item) {
            var _this = this;
            var len = this.processingQueue.length;
            if ((typeof item !== 'function')
                || this.limit === 0
                || len >= this.limit
                || this.willProcessedQueue.length === 0) {
                // 处理中队列已满或者待处理队列为空
                return false;
            }
            // 更新游标
            this.nextIndex++;
            // 1.从待处理队伍中删除item，
            this.removeFromwillProcessedQueue(item);
            // 2.添加item到正在处理队伍中，并执行
            this.processingQueue.push(item);
            // 3.执行任务，接下来可能会立马push.
            var done = function () {
                _this.done(item);
            };
            item(done);
            return this.processingQueue.length;
        };
        /**
         * target
         * 从队列中清除
         * @param { QueueItem | uuid }
         * @param { ?boolean } autoDoNext 是否继续push下一个任务, 当再循环中remove，且会关联一些异步请求或操作，最好设为false,
         */
        Queue.prototype.remove = function (target, autoDoNext) {
            var index = arrayIndexOf(this.line, target);
            this.removeFromprocessingQueue(target, autoDoNext);
            this.removeFromwillProcessedQueue(target);
            this.line.splice(index, 1);
        };
        /**
         * 根据引用地址删除处理中队列的某个成员
         * @param {QueueItem | uuid} 要删除的对象
         * @param { ?boolean } 是否继续push下一个任务，
         * @return {QueueItem | null} 被删除的对象
         */
        Queue.prototype.removeFromprocessingQueue = function (target, autoDoNext) {
            if (autoDoNext === void 0) { autoDoNext = true; }
            var delTarget = null;
            var index = arrayIndexOf(this.processingQueue, target);
            if (index !== -1) {
                delTarget = this.processingQueue[index];
                // 删除并扔进已处理完的队伍中
                var delLen = this.processingQueue.splice(index, 1);
                if (delLen.length > 0) {
                    this.processedQueue.push(delTarget);
                }
                var next = this.getNext();
                // 删除了一个自动添加
                if (next && this.autoDoNext && autoDoNext) {
                    this.pushToprocessingQueue(next);
                }
                // 没有队列了
                if (next === undefined) {
                    this.dispatchEvent('end');
                }
            }
            return delTarget;
        };
        /**
         * 根据引用地址删除待处理队伍的成员
         * @param {QueueItem | uuid} 要删除的对象
         * @return {QueueItem} 被删除的对象
         */
        Queue.prototype.removeFromwillProcessedQueue = function (target) {
            var delTarget = null;
            var index = arrayIndexOf(this.willProcessedQueue, target);
            if (index !== -1) {
                delTarget = this.willProcessedQueue[index];
                // 删除
                this.willProcessedQueue.splice(index, 1);
            }
            return delTarget;
        };
        /**
         * 手动开始处理队列
         */
        Queue.prototype.start = function () {
            if (this.autoStart === false) {
                while (this.pushToprocessingQueue(this.getNext())) {
                    // nothing
                }
            }
        };
        return Queue;
    }(events_1["default"]));
    exports["default"] = Queue;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVldWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvUXVldWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQUEsbUNBQThCO0lBTzlCLElBQU0sWUFBWSxHQUFHLFVBQVUsS0FBa0IsRUFBRSxNQUFpQjtRQUNoRSxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNmLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ25DLElBQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QixJQUFJLElBQUksS0FBSyxNQUFNLEVBQUU7Z0JBQ2pCLEtBQUssR0FBRyxDQUFDLENBQUM7Z0JBQ1YsTUFBTTthQUNUO1NBQ0o7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDLENBQUM7SUFFRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQTRCRTtJQUVGO1FBQW9CLHlCQUFNO1FBYXRCLGVBQVksTUFBYztZQUExQixZQUNJLGlCQUFPLFNBRVY7WUFmRCxXQUFLLEdBQW9CLENBQUMsQ0FBQztZQUMzQixlQUFTLEdBQXdCLElBQUksQ0FBQztZQUN0QyxnQkFBVSxHQUF5QixJQUFJLENBQUM7WUFDeEMsS0FBSztZQUNMLFVBQUksR0FBZ0IsRUFBRSxDQUFDO1lBQ3ZCLGtCQUFrQjtZQUNsQix3QkFBa0IsR0FBZ0IsRUFBRSxDQUFDO1lBQ3JDLFNBQVM7WUFDVCxxQkFBZSxHQUFnQixFQUFFLENBQUM7WUFDbEMsU0FBUztZQUNULG9CQUFjLEdBQWdCLEVBQUUsQ0FBQztZQUNqQyxlQUFTLEdBQVcsQ0FBQyxDQUFDLENBQUM7WUFHbkIsS0FBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzs7UUFDdEIsQ0FBQztRQUNELG9CQUFJLEdBQUosVUFBSyxFQUlDO2dCQUpE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