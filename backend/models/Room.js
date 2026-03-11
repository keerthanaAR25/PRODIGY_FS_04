const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true,
    unique: true,
    minlength: [3, 'Room name must be at least 3 characters'],
    maxlength: [50, 'Room name cannot exceed 50 characters'],
  },
  description: {
    type: String,
    default: '',
    maxlength: [300, 'Description cannot exceed 300 characters'],
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin', 'moderator', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
  }],
  avatar: { type: String, default: '' },
  isPrivate: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  lastMessageAt: { type: Date, default: Date.now },
  messageCount: { type: Number, default: 0 },
  tags: [{ type: String }],
}, { timestamps: true });

roomSchema.index({ name: 'text', description: 'text' });
roomSchema.index({ 'members.user': 1 });

module.exports = mongoose.model('Room', roomSchema);