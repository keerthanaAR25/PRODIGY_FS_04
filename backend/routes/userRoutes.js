const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
  getUsers, getUserById, updateProfile, uploadAvatar, updateStatus, getOnlineUsers
} = require('../controllers/userController');

router.get('/', auth, getUsers);
router.get('/online', auth, getOnlineUsers);
router.get('/:id', auth, getUserById);
router.put('/profile', auth, updateProfile);
router.put('/status', auth, updateStatus);
router.post('/avatar', auth, upload.single('avatar'), uploadAvatar);

module.exports = router;