const redis = require('./src/utils/redis');

async function test() {
  try {
    const logs = await redis.lrange('audit_logs', 0, -1);
    const parsed = logs.map(JSON.parse);
    const ardianLogs = parsed.filter(l => l.email === 'volvoxgroups@gmail.com');
    console.log("Ardian logs count:", ardianLogs.length);
    console.log("Ardian logs:", ardianLogs);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

test();
