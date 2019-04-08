
# Queue.js 📬

<!-- # Installation -->

## Example

```ts
import Queue from './Queue';
// 多个队列并行
const queue = new Queue({ limit: 5 });
const queueItem = (done: () => void) => {
    'todo Something';
    // 过了很久后处理完了一个
    done();
};
// 会自动开始处理队列
queue.push(queueItem);

queue.on('end', () => {
    console.log('end');
})

```

or

```ts
// 单个队列
const queue2 = new Queue({ limit: 1, autoStart: false });
const queueItem2 = () => {'todo Something';};
queue.push(queueItem2);
// 一段时间后，
queue.next();
// 又一段时间后
queue.next();
```
