const redis = require('./src/utils/redis');

async function test() {
  try {
    const keys = await redis.keys('*');
    console.log("Redis keys:", keys);
    const logs = await redis.lrange('audit_logs', 0, -1);
    console.log("Audit Logs size:", logs.length);
    console.log("Audit Logs data:", logs);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

test();
