
const redis = require('../../utils/redis');
async function getOnlineUsers(page = 1, perPage = 10) {
  const keys = await redis.keys('online_user:*');
  const raw = await Promise.all(keys.map(k => redis.get(k)));

  const users = raw
    .map(JSON.parse)
    .sort((a, b) => b.last_activity - a.last_activity);

  const total = users.length;
  const start = (page - 1) * perPage;

  return {
    list: users.slice(start, start + perPage),
    pagination: {
      total,
      per_page: perPage,
      current_page: page,
      last_page: Math.ceil(total / perPage),
    },
  };
}

async function getStats() {
  const keys = await redis.keys('online_user:*');
  const raw = await Promise.all(keys.map(k => redis.get(k)));
  const users = raw.map(JSON.parse);

  return {
    data: {
      total_online: users.length,
      guests: users.filter(u => u.is_guest).length,
      logged_in: users.filter(u => !u.is_guest).length,
    },
  };
}

async function getAuditLogs(page = 1, perPage = 10, query = {}) {
  const { search, descending = 'true', userId } = query;
  const logs = await redis.lrange('audit_logs', 0, -1);
  const parsed = logs.map(JSON.parse);

  // Filter to include explicit Audit events (Login/Logout/etc)
  const allowedActions = [
    'LOGIN', 'LOGOUT', 
    'CREATE_LATIHAN', 'EDIT_LATIHAN', 'DELETE_LATIHAN',
    'CREATE_PAKET_PEMBELIAN', 'EDIT_PAKET_PEMBELIAN', 'DELETE_PAKET_PEMBELIAN',
    'CREATE_SOAL_CATEGORY', 'EDIT_SOAL_CATEGORY', 'DELETE_SOAL_CATEGORY',
    'CREATE_USER', 'EDIT_USER', 'DELETE_USER',
    'UPDATE_PEMBELIAN_STATUS', 'CHANGE_PASSWORD', 'BUY_PAKET',
    'START_TRYOUT', 'FINISH_TRYOUT'
  ];
  let filtered = parsed.filter(log => allowedActions.includes(log.action));

  if (userId) {
    filtered = filtered.filter(u => u.id === parseInt(userId, 10));
    const clearedAt = await redis.get(`logs_cleared_at:${userId}`);
    if (clearedAt) {
      filtered = filtered.filter(log => log.last_activity > parseInt(clearedAt, 10));
    }
  }

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(u => 
      (u.name && u.name.toLowerCase().includes(s)) ||
      (u.email && u.email.toLowerCase().includes(s)) ||
      (u.url && u.url.toLowerCase().includes(s)) ||
      (u.action && u.action.toLowerCase().includes(s))
    );
  }

  if (descending === 'false') {
    filtered.sort((a, b) => (a.last_activity || 0) - (b.last_activity || 0));
  } else {
    filtered.sort((a, b) => (b.last_activity || 0) - (a.last_activity || 0));
  }

  const total = filtered.length;
  const start = (page - 1) * perPage;

  return {
    list: filtered.slice(start, start + perPage),
    pagination: {
      total,
      per_page: perPage,
      current_page: page,
      last_page: Math.ceil(total / perPage),
    },
  };
}

async function clearAuditLogs(userId) {
  if (userId) {
    // Sembunyikan dari Profil user (Jangan hapus data log sistem Global)
    await redis.set(`logs_cleared_at:${userId}`, Date.now());
    return { msg: 'Profile logs hidden' };
  } else {
    await redis.del('audit_logs');
    return { msg: 'Audit logs cleared' };
  }
}

module.exports = {
  getOnlineUsers,
  getStats,
  getAuditLogs,
  clearAuditLogs,
};