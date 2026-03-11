const User = require('../models/User');
const Message = require('../models/Message');
const Room = require('../models/Room');
const Conversation = require('../models/Conversation');

// @desc Get analytics
exports.getAnalytics = async (req, res) => {
  try {
    const [totalUsers, activeUsers, totalMessages, totalRooms, onlineUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Message.countDocuments({ isDeleted: false }),
      Room.countDocuments({ isActive: true }),
      User.countDocuments({ status: 'online' }),
    ]);

    // Messages in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentMessages = await Message.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // New users in last 7 days
    const newUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // Messages per day (last 7 days)
    const messageTrends = await Message.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, isDeleted: false } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      analytics: {
        totalUsers,
        activeUsers,
        totalMessages,
        totalRooms,
        onlineUsers,
        recentMessages,
        newUsers,
        messageTrends,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Get all users (admin)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);
    res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Deactivate user
exports.deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isAdmin) return res.status(403).json({ error: 'Cannot deactivate admin' });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user: user.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isAdmin) return res.status(403).json({ error: 'Cannot delete admin' });

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Make user admin
exports.makeAdmin = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isAdmin: true }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user: user.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Get all rooms (admin)
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate('creator', 'username email')
      .sort({ createdAt: -1 });
    res.json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Delete room (admin)
exports.deleteRoom = async (req, res) => {
  try {
    await Room.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};