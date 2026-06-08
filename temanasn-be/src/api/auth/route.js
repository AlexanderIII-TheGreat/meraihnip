const express = require('express');

const router = express.Router();

const { authenticateUser } = require('#middlewares');
const {
  register,
  login,
  forgotPassword,
  confirmEmail,
  resetPassword,
  googleLogin,
  logout,
} = require('./controller');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/logout', authenticateUser, logout);
router.post('/forgot-password', forgotPassword);
router.get('/confirm-email/:token', confirmEmail);
router.post('/reset-password/', resetPassword);
module.exports = router;
