const express = require('express');
const router = express.Router();
const { isTokenValid } = require('#utils');
const database = require('#database');
const { start, answer, finish, history, getMyTryout, ranking, statistic, checkActive, addDuration } = require('./controller');

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) return next();
    const token = authHeader.replace('Bearer ', '');
    const payload = isTokenValid({ token });
    const user = await database.User.findUnique({ where: { id: payload.id } });
    if (user) req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
  } catch (e) {}
  next();
};

router.post('/start', start);
router.post('/answer', answer);
router.post('/finish', finish);
router.get('/history', history);
router.get('/my-tryout', optionalAuth, getMyTryout);
router.get('/ranking', ranking);
router.get('/statistic', statistic);
router.get('/check-active', checkActive);
router.post('/add-duration', addDuration);
module.exports = router;
