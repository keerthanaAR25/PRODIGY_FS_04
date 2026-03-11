const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const { getAnalytics, getAllUsers, deactivateUser, deleteUser, makeAdmin, getAllRooms, deleteRoom } = require('../controllers/adminController');

router.get('/analytics', adminAuth, getAnalytics);
router.get('/users', adminAuth, getAllUsers);
router.put('/users/:id/toggle', adminAuth, deactivateUser);
router.delete('/users/:id', adminAuth, deleteUser);
router.put('/users/:id/admin', adminAuth, makeAdmin);
router.get('/rooms', adminAuth, getAllRooms);
router.delete('/rooms/:id', adminAuth, deleteRoom);

module.exports = router;