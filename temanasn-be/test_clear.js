const Redis = require('ioredis');
require('dotenv').config();

const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
});

async function run() {
  // 1. Prep Dummy Logs
  await redis.del('audit_logs');
  await redis.rpush('audit_logs', JSON.stringify({ id: 1, name: 'Admin', action: 'LOGIN' }));
  await redis.rpush('audit_logs', JSON.stringify({ id: 2, name: 'User2', action: 'LOGIN' }));
  await redis.rpush('audit_logs', JSON.stringify({ id: 1, name: 'Admin', action: 'LOGOUT' }));

  console.log('--- BEFORE CLEAR ---');
  const before = await redis.lrange('audit_logs', 0, -1);
  console.log(before);

  // 2. Call clearer (simulate Admin ID 1)
  const userId = 1;
  const logs = await redis.lrange('audit_logs', 0, -1);
  const parsed = logs.map(JSON.parse);
  const remaining = parsed.filter(u => u.id !== parseInt(userId, 10));

  await redis.del('audit_logs');
  if (remaining.length > 0) {
    const strings = remaining.map(JSON.stringify);
    await redis.rpush('audit_logs', ...strings);
  }

  console.log('--- AFTER CLEAR FOR ID 1 ---');
  const after = await redis.lrange('audit_logs', 0, -1);
  console.log(after);

  redis.disconnect();
}

run();
