const Room = require('../models/Room');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc Create room
exports.createRoom = async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;
    const existing = await Room.findOne({ name });
    if (existing) return res.status(400).json({ error: 'Room name already taken' });

    const room = await Room.create({
      name,
      description,
      isPrivate: isPrivate || false,
      creator: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }],
    });

    await User.findByIdAndUpdate(req.user._id, { $addToSet: { rooms: room._id } });
    const populated = await Room.findById(room._id).populate('members.user', 'username avatar status').populate('creator', 'username avatar');

    res.status(201).json({ success: true, room: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Get all public rooms
exports.getRooms = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = { isActive: true, isPrivate: false };
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];

    const rooms = await Room.find(query)
      .populate('creator', 'username avatar')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Room.countDocuments(query);
    res.json({ success: true, rooms, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Get room by ID
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('members.user', 'username avatar status lastSeen')
      .populate('creator', 'username avatar')
      .populate('lastMessage');
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Join room
exports.joinRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const isMember = room.members.find(m => m.user.toString() === req.user._id.toString());
    if (isMember) return res.status(400).json({ error: 'Already a member' });

    room.members.push({ user: req.user._id, role: 'member' });
    await room.save();
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { rooms: room._id } });

    // System message
    await Message.create({
      sender: req.user._id,
      room: room._id,
      content: `${req.user.username} joined the room`,
      messageType: 'system',
    });

    const populated = await Room.findById(room._id).populate('members.user', 'username avatar status');
    res.json({ success: true, room: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Leave room
exports.leaveRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    room.members = room.members.filter(m => m.user.toString() !== req.user._id.toString());
    await room.save();
    await User.findByIdAndUpdate(req.user._id, { $pull: { rooms: room._id } });

    await Message.create({
      sender: req.user._id,
      room: room._id,
      content: `${req.user.username} left the room`,
      messageType: 'system',
    });

    res.json({ success: true, message: 'Left room successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Get user's rooms
exports.getMyRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ 'members.user': req.user._id, isActive: true })
      .populate('creator', 'username avatar')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });
    res.json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Delete room
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.creator.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    room.isActive = false;
    await room.save();
    res.json({ success: true, message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};