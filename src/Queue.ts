import Events from './events';
import {
    Config,
    LineType,
    QueueItem,
} from './types';

const arrayIndexOf = function (array: QueueItem[], target: QueueItem) {
    let index = -1;
    for (let i = 0; i < array.length; i++) {
        const item = array[i];
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

class Queue extends Events{
    limit: Config['limit'] = 1;
    autoStart: Config['autoStart'] = true;
    autoDoNext: Config['autoDoNext'] = true;
    // 队列
    line: QueueItem[] = [];
    // 将要处理的队列(还未处理过的)
    willProcessedQueue: QueueItem[] = [];
    // 处理中的队列
    processingQueue: QueueItem[] = [];
    // 已处理的队列
    processedQueue: QueueItem[] = [];
    nextIndex: number = -1;
    constructor(option: Config) {
        super();
        this.init(option);
    }
    init({
        limit = 1,
        autoStart = true,
        autoDoNext = true,
    } = {}) {
        this.limit = limit;
        this.autoStart = autoStart;
        this.autoDoNext = autoDoNext;
        this.line = [];
        this.willProcessedQueue = [];
        this.processingQueue = [];
        this.processedQueue = [];
        this.nextIndex = -1;
    }
    /**
     * 获取下一个
     */
    getNext() {
        return this.willProcessedQueue[0];
    }
    /**
     * 清空处理队列
     */
    clear(type: LineType | 'all') {
        if (type in this && type !== 'all') {
            const queue: QueueItem[] = this[type];
            queue.splice(0, queue.length - 1);
            return queue;
        }
        this.line = [];
        this.processingQueue = [];
        this.processedQueue = [];
        this.willProcessedQueue = [];
        this.nextIndex = -1;
    }

    /**
     * 完成某一个正在处理中的任务
     */
    done(target: QueueItem, autoDoNext?: boolean) {
        return this.removeFromprocessingQueue(target, autoDoNext);
    }

    /**
     * 处理完成，执行下一个
     * this.limit = 1才能用
     */
    next() {
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
    }
    /**
     * 添加排队成员，自动添加到处理中的队列
     */
    push(item: QueueItem) {
        if (typeof item !== 'function') {
            throw TypeError('Queue.push(Function)');
        }
        const length = this.line.push(item);

        this.willProcessedQueue.push(item);
        if (this.autoStart) {
            this.pushToprocessingQueue(item);
        }
        return length;
    }

    /**
     * 添加到处理中队列
     */
    pushToprocessingQueue(item: QueueItem) {
        const len = this.processingQueue.length;

        if (
            (typeof item !== 'function')
            || this.limit === 0
            || len >= this.limit
            || this.willProcessedQueue.length === 0
        ) {
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
        const done = () => {
            this.done(item);
        };
        item(done);
        return this.processingQueue.length;
    }
    /**
     * target
     * 从队列中清除
     * @param { QueueItem | uuid }
     * @param { ?boolean } autoDoNext 是否继续push下一个任务, 当再循环中remove，且会关联一些异步请求或操作，最好设为false,
     */
    remove(target: QueueItem, autoDoNext: boolean) {
        const index = arrayIndexOf(this.line, target);
        this.removeFromprocessingQueue(target, autoDoNext);
        this.removeFromwillProcessedQueue(target);
        this.line.splice(index, 1);
    }
    /**
     * 根据引用地址删除处理中队列的某个成员
     * @param {QueueItem | uuid} 要删除的对象
     * @param { ?boolean } 是否继续push下一个任务，
     * @return {QueueItem | null} 被删除的对象
     */
    removeFromprocessingQueue(target: QueueItem, autoDoNext = true) {
        let delTarget = null;
        const index = arrayIndexOf(this.processingQueue, target);
        if (index !== -1) {
            delTarget = this.processingQueue[index];
            // 删除并扔进已处理完的队伍中
            const delLen = this.processingQueue.splice(index, 1);
            if (delLen.length > 0) {
                this.processedQueue.push(delTarget);
            }
            const next = this.getNext();
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
    }

    /**
     * 根据引用地址删除待处理队伍的成员
     * @param {QueueItem | uuid} 要删除的对象
     * @return {QueueItem} 被删除的对象
     */
    removeFromwillProcessedQueue(target: QueueItem) {
        let delTarget = null;
        const index = arrayIndexOf(this.willProcessedQueue, target);
        if (index !== -1) {
            delTarget = this.willProcessedQueue[index];
            // 删除
            this.willProcessedQueue.splice(index, 1);
        }
        return delTarget;
    }
    /**
     * 手动开始处理队列
     */
    start() {
        if (this.autoStart === false) {
            while (this.pushToprocessingQueue(this.getNext())) {
                // nothing
            }
        }
    }
}

export default Queue;
