const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
  getConversationMessages, getRoomMessages, sendMessage,
  editMessage, deleteMessage, addReaction, markAsRead
} = require('../controllers/messageController');

router.get('/conversation/:conversationId', auth, getConversationMessages);
router.get('/room/:roomId', auth, getRoomMessages);
router.post('/', auth, upload.single('media'), sendMessage);
router.put('/:id', auth, editMessage);
router.delete('/:id', auth, deleteMessage);
router.post('/:id/reactions', auth, addReaction);
router.post('/read', auth, markAsRead);

module.exports = router;