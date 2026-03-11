const Conversation = require('../models/Conversation');
const User = require('../models/User');

// @desc Get or create conversation
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot start conversation with yourself' });
    }

    const otherUser = await User.findById(userId);
    if (!otherUser) return res.status(404).json({ error: 'User not found' });

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, userId], $size: 2 },
    }).populate('participants', 'username avatar status lastSeen')
      .populate('lastMessage');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, userId],
        unreadCount: [
          { user: req.user._id, count: 0 },
          { user: userId, count: 0 },
        ],
      });
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'username avatar status lastSeen')
        .populate('lastMessage');
    }

    res.json({ success: true, conversation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Get all conversations for a user
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
      isActive: true,
    })
      .populate('participants', 'username avatar status lastSeen')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    res.json({ success: true, conversations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Delete conversation
exports.deleteConversation = async (req, res) => {
  try {
    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });
    if (!conv.participants.includes(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    conv.isActive = false;
    await conv.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};