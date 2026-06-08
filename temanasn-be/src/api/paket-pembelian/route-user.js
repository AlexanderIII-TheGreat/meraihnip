const express = require('express');
const router = express.Router();
const { isTokenValid } = require('#utils');
const database = require('#database');
const { get, find } = require('./controller');

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) return next();
    const token = authHeader.replace('Bearer ', '');
    const payload = isTokenValid({ token });
    const user = await database.User.findUnique({ where: { id: payload.id } });
    if (user) req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
  } catch (e) {
    // token invalid, lanjut tanpa user
  }
  next();
};

router.get('/get', optionalAuth, get);
router.get('/find/:id', optionalAuth, find);

module.exports = router;
