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
    /**
     * 数组成员查找
     * @param {Array} array
     * @param {QueueItem | uuid} target
     * @return {number} index
     */
    var arrayIndexOf = function (array, target) {
        var index = -1;
        for (var i = 0; i < array.length; i++) {
            var item = array[i];
            if (item === target ||
                (item.uuid && item.uuid === target)) {
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
    *   autoPush: boolean, // 完成一个后是否自动添加后面的任务
    * }
    * @interface QueueItem {
    *   uuid: number | string,
    *   value: function,
    * }
    * @constructor constructor(Option)
    * @example
    * // 一(1)
    * const queue = new Queue({ limit: 5 });
    * const queueItem = (done) => {
    *     'todo Something';
    *     // 过了很久后处理完了一个
    *     done();
    * };
    * // 会自动开始处理队列
    * queue.push(queueItem);
    *
    * // 一(2)。
    * const queue = new Queue({ limit: 5 });
    * const queueItem = {
    *   uuid: 12132132,
    *   value: () => {'todo Something';}
    * };
    * // 会自动开始处理队列
    * queue.push(queueItem);
    * // 过了很久后处理完了一个
    * queue.done(12132132)
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
    var Queue = /** @class */ (function () {
        function Queue(option) {
            this.init(option);
        }
        Queue.prototype.init = function (_a) {
            var _b = _a === void 0 ? {} : _a, _c = _b.limit, limit = _c === void 0 ? 1 : _c, _d = _b.autoStart, autoStart = _d === void 0 ? true : _d, _e = _b.autoPush, autoPush = _e === void 0 ? true : _e;
            this.limit = limit;
            this.autoStart = autoStart;
            this.autoPush = autoPush;
            // 队伍
            this.line = [];
            // 将要处理的队伍(还未处理过的)
            this.willProcessedLine = [];
            // 处理中的队伍
            this.processingLine = [];
            // 已处理的队伍
            this.processedLine = [];
            // 下一个(暂时无用)
            this.nextIndex = -1;
            // event
            this.onend = function () { };
        };
        /**
         * 获取下一个
         */
        Queue.prototype.getNext = function () {
            return this.willProcessedLine[0];
        };
        /**
         * 清空处理队列
         * @param {'processingLine' | 'processedLine'} default clear all
         */
        Queue.prototype.clear = function (type) {
            if (typeof type === 'string' && Array.isArray(this[type])) {
                this[type].splice(0, this[type].length - 1);
                return this[type];
            }
            this.line = [];
            this.processingLine = [];
            this.processedLine = [];
            this.nextIndex = -1;
            this.willProcessedLine = [];
        };
        /**
         * 完成某一个正在处理中的任务
         * @param {QueueItem | uuid} target
         * @param { ?boolean }
         * @return {QueueItem | null} 被删除的对象
         */
        Queue.prototype.done = function (target, autoPush) {
            return this.removeFromProcessingLine(target, autoPush);
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
            if (this.processingLine.length > 0) {
                this.removeFromProcessingLine(this.processingLine[0]);
            }
            if (this.getNext()) {
                this.pushToProcessingLine(this.getNext());
            }
        };
        /**
         * 添加排队成员，自动添加到处理中的队列
         * @param {QueueItem | function}
         * @return {Number} this.line.length
         */
        Queue.prototype.push = function (item) {
            if (typeof item !== 'function' &&
                (item.uuid && typeof item.value !== 'function')) {
                throw TypeError('Queue.push(Function) || Queue.push({uuid: <id>, value: <Function>})');
            }
            var length = this.line.push(item);
            this.willProcessedLine.push(item);
            if (this.autoStart) {
                this.pushToProcessingLine(item);
            }
            return length;
        };
        /**
         * 添加到处理中队列
         * @param {QueueItem | function}
         * @return {Number | boolean} length | boolean
         */
        Queue.prototype.pushToProcessingLine = function (item) {
            var _this = this;
            var len = this.processingLine.length;
            if ((typeof item !== 'function' && (item.uuid && typeof item.value !== 'function'))
                || this.limit === 0
                || len >= this.limit
                || this.willProcessedLine.length === 0) {
                // 处理中队列已满或者待处理队列为空
                return false;
            }
            // 更新游标
            this.nextIndex++;
            // 1.从待处理队伍中删除item，
            this.removeFromWillProcessedLine(item);
            // 2.添加item到正在处理队伍中，并执行
            this.processingLine.push(item);
            // 3.执行任务，接下来可能会立马push.
            var done = function () {
                _this.done(item);
            };
            if (item.uuid) {
                item.value(done);
            }
            else {
                item(done);
            }
            return this.processingLine.length;
        };
        /**
         * target
         * 从队列中清除
         * @param { QueueItem | uuid }
         * @param { ?boolean } 是否继续push下一个任务, 当再循环中remove，且会关联一些异步请求或操作，最好设为false,
         */
        Queue.prototype.remove = function (target, autoPush) {
            var index = arrayIndexOf(this.line, target);
            this.removeFromProcessingLine(target, autoPush);
            this.removeFromWillProcessedLine(target);
            this.line.splice(index, 1);
        };
        /**
         * 根据引用地址删除处理中队列的某个成员
         * @param {QueueItem | uuid} 要删除的对象
         * @param { ?boolean } 是否继续push下一个任务，
         * @return {QueueItem | null} 被删除的对象
         */
        Queue.prototype.removeFromProcessingLine = function (target, autoPush) {
            if (autoPush === void 0) { autoPush = true; }
            var delTarget = null;
            var index = arrayIndexOf(this.processingLine, target);
            if (index !== -1) {
                delTarget = this.processingLine[index];
                // 删除并扔进已处理完的队伍中
                var delLen = this.processingLine.splice(index, 1);
                if (delLen > 0) {
                    this.processedLine.push(delTarget);
                }
                var next = this.getNext();
                // 删除了一个自动添加
                if (next && this.autoPush && autoPush) {
                    this.pushToProcessingLine(next);
                }
                // 没有队列了
                if (next === undefined) {
                    this.onend();
                }
            }
            return delTarget;
        };
        /**
         * 根据引用地址删除待处理队伍的成员
         * @param {QueueItem | uuid} 要删除的对象
         * @return {QueueItem} 被删除的对象
         */
        Queue.prototype.removeFromWillProcessedLine = function (target) {
            var delTarget = null;
            var index = arrayIndexOf(this.willProcessedLine, target);
            if (index !== -1) {
                delTarget = this.willProcessedLine[index];
                // 删除
                this.willProcessedLine.splice(index, 1);
            }
            return delTarget;
        };
        /**
         * 手动开始处理队列
         */
        Queue.prototype.start = function () {
            if (this.autoStart === false) {
                while (this.pushToProcessingLine(this.getNext())) {
                    // nothing
                }
            }
        };
        return Queue;
    }());
    exports["default"] = Queue;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVldWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvUXVldWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFDQTs7Ozs7T0FLRztJQUNILElBQU0sWUFBWSxHQUFHLFVBQVUsS0FBSyxFQUFFLE1BQU07UUFDeEMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDZixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNuQyxJQUFNLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEIsSUFDSSxJQUFJLEtBQUssTUFBTTtnQkFDZixDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxNQUFNLENBQUMsRUFDckM7Z0JBQ0UsS0FBSyxHQUFHLENBQUMsQ0FBQztnQkFDVixNQUFNO2FBQ1Q7U0FDSjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUMsQ0FBQztJQUVGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUEwQ0U7SUFFRjtRQUNJLGVBQVksTUFBTTtZQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEIsQ0FBQztRQUNELG9CQUFJLEdBQUosVUFBSyxFQUlDO2dCQUpELDRCQUlDLEVBSEYsYUFBUyxFQUFULDhCQUFTLEVBQ1QsaUJBQWdCLEVBQWhCLHFDQUFnQixFQUNoQixnQkFBZSxFQUFmLG9DQUFlO1lBRWYsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDbkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7WUFDM0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7WUFDekIsS0FBSztZQUNMLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ2Ysa0JBQWtCO1lB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