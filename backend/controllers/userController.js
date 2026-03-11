const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

// @desc Get all users (for chat list)
exports.getUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = { _id: { $ne: req.user._id }, isActive: true };
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const users = await User.find(query)
      .select('username email avatar status lastSeen bio')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ status: -1, username: 1 });

    const total = await User.countDocuments(query);
    res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user: user.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { username, bio } = req.body;
    const updates = {};
    if (username) {
      const existing = await User.findOne({ username, _id: { $ne: req.user._id } });
      if (existing) return res.status(400).json({ error: 'Username already taken' });
      updates.username = username;
    }
    if (bio !== undefined) updates.bio = bio;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user: user.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Upload avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // Delete old avatar if exists
    const currentUser = await User.findById(req.user._id);
    if (currentUser.avatarPublicId) {
      await cloudinary.uploader.destroy(currentUser.avatarPublicId);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: req.file.path, avatarPublicId: req.file.filename },
      { new: true }
    );
    res.json({ success: true, avatar: user.avatar, user: user.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Update user status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['online', 'offline', 'away', 'busy'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { status, lastSeen: new Date() },
      { new: true }
    );
    res.json({ success: true, status: user.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Get online users
exports.getOnlineUsers = async (req, res) => {
  try {
    const users = await User.find({ status: 'online', _id: { $ne: req.user._id }, isActive: true })
      .select('username avatar status lastSeen');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};