const Redis = require('ioredis');
require('dotenv').config();

const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
});

async function run() {
  const logs = await redis.lrange('audit_logs', 0, 5);
  console.log('Sample Logs:');
  logs.forEach((l, i) => {
     console.log(`[${i}]`, l);
  });
  redis.disconnect();
}

run();
