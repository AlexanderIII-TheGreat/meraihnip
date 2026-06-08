const redis = require('./src/utils/redis');

async function test() {
  try {
    const logs = await redis.lrange('audit_logs', 0, -1);
    const parsed = logs.map(JSON.parse);
    const last20 = parsed.slice(-20);
    console.log("Last 20 Logs:", last20);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

test();
