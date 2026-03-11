const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getOrCreateConversation, getConversations, deleteConversation } = require('../controllers/conversationController');

router.get('/', auth, getConversations);
router.get('/:userId', auth, getOrCreateConversation);
router.delete('/:id', auth, deleteConversation);

module.exports = router;