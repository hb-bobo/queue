// import Queue from '../dist/queue';

import Queue from 'hb-queue'
var queue1 = new Queue({ limit: 2 });
for(var i = 0; i < 20; i++) {
    queue1.push(function (done) {
        setTimeout(function() {
            done();
            console.log('item done')
        }, 100 * i);
    });
}
var onEnd = function () {
    console.log(['Handle done']);
};
queue1.on('end', onEnd)   


