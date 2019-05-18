import Events from './events';
import { Config, LineType, QueueItem } from './types';
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
declare class Queue extends Events {
    limit: Config['limit'];
    autoStart: Config['autoStart'];
    autoDoNext: Config['autoDoNext'];
    line: QueueItem[];
    willProcessedQueue: QueueItem[];
    processingQueue: QueueItem[];
    processedQueue: QueueItem[];
    nextIndex: number;
    constructor(option: Config);
    init({ limit, autoStart, autoDoNext, }?: {
        limit?: number | undefined;
        autoStart?: boolean | undefined;
        autoDoNext?: boolean | undefined;
    }): void;
    /**
     * 获取下一个
     */
    getNext(): QueueItem;
    /**
     * 清空处理队列
     */
    clear(type: LineType | 'all'): QueueItem[] | undefined;
    /**
     * 完成某一个正在处理中的任务
     */
    done(target: QueueItem, autoDoNext?: boolean): QueueItem | null;
    /**
     * 处理完成，执行下一个
     * this.limit = 1才能用
     */
    next(): void;
    /**
     * 添加排队成员，自动添加到处理中的队列
     */
    push(item: QueueItem): number;
    /**
     * 添加到处理中队列
     */
    pushToprocessingQueue(item: QueueItem): number | false;
    /**
     * target
     * 从队列中清除
     * @param { QueueItem | uuid }
     * @param { ?boolean } autoDoNext 是否继续push下一个任务, 当再循环中remove，且会关联一些异步请求或操作，最好设为false,
     */
    remove(target: QueueItem, autoDoNext: boolean): void;
    /**
     * 根据引用地址删除处理中队列的某个成员
     * @param {QueueItem | uuid} 要删除的对象
     * @param { ?boolean } 是否继续push下一个任务，
     * @return {QueueItem | null} 被删除的对象
     */
    removeFromprocessingQueue(target: QueueItem, autoDoNext?: boolean): QueueItem | null;
    /**
     * 根据引用地址删除待处理队伍的成员
     * @param {QueueItem | uuid} 要删除的对象
     * @return {QueueItem} 被删除的对象
     */
    removeFromwillProcessedQueue(target: QueueItem): QueueItem | null;
    /**
     * 手动开始处理队列
     */
    start(): void;
}
export default Queue;
