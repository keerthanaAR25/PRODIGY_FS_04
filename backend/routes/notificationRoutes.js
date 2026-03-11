const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getNotifications, markAsRead, deleteNotification, clearAll } = require('../controllers/notificationController');

router.get('/', auth, getNotifications);
router.put('/:notificationId/read', auth, markAsRead);
router.delete('/clear', auth, clearAll);
router.delete('/:id', auth, deleteNotification);

module.exports = router;