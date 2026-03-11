const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, logout, getMe, adminLogin } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/register', [
  body('username').trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
], register);

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], login);

router.post('/logout', auth, logout);
router.get('/me', auth, getMe);
router.post('/admin/login', adminLogin);

module.exports = router;