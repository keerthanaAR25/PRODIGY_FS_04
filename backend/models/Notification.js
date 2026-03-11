const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  type: {
    type: String,
    enum: ['message', 'room_invite', 'mention', 'reaction', 'system'],
    required: true,
  },
  title: { type: String, required: true },
  body: { type: String, required: true },
  data: {
    conversationId: { type: mongoose.Schema.Types.ObjectId },
    roomId: { type: mongoose.Schema.Types.ObjectId },
    messageId: { type: mongoose.Schema.Types.ObjectId },
  },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);