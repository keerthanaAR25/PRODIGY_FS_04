const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { createRoom, getRooms, getRoomById, joinRoom, leaveRoom, getMyRooms, deleteRoom } = require('../controllers/roomController');

router.get('/', auth, getRooms);
router.get('/my', auth, getMyRooms);
router.get('/:id', auth, getRoomById);
router.post('/', auth, createRoom);
router.post('/:id/join', auth, joinRoom);
router.post('/:id/leave', auth, leaveRoom);
router.delete('/:id', auth, deleteRoom);

module.exports = router;