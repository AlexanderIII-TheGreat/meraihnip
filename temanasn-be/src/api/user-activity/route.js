const express = require('express');
const router = express.Router();

const controller = require('./controller');
const { authenticateUser } = require('#middlewares');

// GET /api/user-activity/stats
router.get('/stats', async (req, res) => {
  try {
    const data = await controller.getStats();
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: 'Failed to load stats' });
  }
});

// GET /api/user-activity/online?page=1
router.get('/online', async (req, res) => {
  try {
    let page = parseInt(req.query.page || '1', 10);
    let perPage = parseInt(req.query.per_page || '10', 10);

    if (req.query.skip !== undefined && req.query.take !== undefined) {
      const skip = parseInt(req.query.skip, 10);
      const take = parseInt(req.query.take, 10);
      page = Math.floor(skip / take) + 1;
      perPage = take;
    }

    const result = await controller.getOnlineUsers(page, perPage);

    res.json({
      data: result,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load online users' });
  }
});


// GET /api/user-activity/audit?page=1
router.get('/audit', async (req, res) => {
  try {
    let page = parseInt(req.query.page || '1', 10);
    let perPage = parseInt(req.query.per_page || '10', 10);

    if (req.query.skip !== undefined && req.query.take !== undefined) {
      const skip = parseInt(req.query.skip, 10);
      const take = parseInt(req.query.take, 10);
      page = Math.floor(skip / take) + 1;
      perPage = take;
    }

    const result = await controller.getAuditLogs(page, perPage, req.query);

    res.json({
      data: result,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load audit logs' });
  }
});

// DELETE /api/user-activity/clear
router.delete('/clear', authenticateUser, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'ADMIN';
    let targetUserId = req.user.id; // Default: user clears self

    if (isAdmin) {
      if (req.query.userId === 'all') {
        targetUserId = null; // Admin clears all
      } else if (req.query.userId) {
        targetUserId = parseInt(req.query.userId, 10);
      }
    }

    const result = await controller.clearAuditLogs(targetUserId);
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to clear audit logs' });
  }
});

module.exports = router;