/* eslint-disable @typescript-eslint/no-var-requires */

const Queue = require('bull');

const queue = new Queue('search-index-ticket', {
  redis: {
    host: '127.0.0.1',
    port: 6379,
  },
});

queue.add(
  'rebuild',
  { startId: 1 },
  {
    removeOnComplete: true,
    removeOnFail: true,
  },
);
