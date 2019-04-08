import Queue from '../src/Queue';
jest.useFakeTimers();
test('events', () => {
    const queue = new Queue({ limit: 5 });
    const onEnd = function () {};
    queue.on('end', onEnd)
    expect(queue._evnetHanlders.end[0]).toBe(onEnd);
});

test('events end', () => {
    const queue = new Queue({ limit: 5 });
    let isEnd = false;
    const onEnd = function () {
        isEnd = true;
    };
    queue.on('end', onEnd)
    queue.dispatchEvent('end');
    expect(isEnd).toBe(true);
});

test('queue push', () => {
    const queue = new Queue({ limit: 5 });
    const queueItem = function (done: () => void) {
        setTimeout(() => {
            done();
        }, 1);
    };
    queue.push(queueItem);
    expect(queue.processingQueue.length).toBe(1);
});

test('queue next', () => {
    const queue = new Queue({limit: 1, autoStart: false});
    const queueItem = function () {
        // todo
    };
    queue.push(queueItem);
    queue.push(queueItem);
    setTimeout(() => {
        queue.next();
        expect(queue.processedQueue.length).toBe(1);
    }, 1);
    expect(queue.processedQueue.length).toBe(0);
});
