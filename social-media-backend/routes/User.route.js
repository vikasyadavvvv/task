const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model.js');

const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Send Friend Request
router.post('/friend-request', async (req, res) => {
  const { userId, friendId } = req.body;
  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!friend) return res.status(404).json({ error: 'User not found' });

    friend.friendRequests.push({ user: user._id });
    await friend.save();
    res.status(200).json({ message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send friend request' });
  }
});

// Accept/Reject Friend Request
router.post('/friend-request/respond', async (req, res) => {
  const { userId, friendId, status } = req.body;
  try {
    const user = await User.findById(userId);
    const friendRequest = user.friendRequests.find(fr => fr.user.toString() === friendId);

    if (!friendRequest) return res.status(404).json({ error: 'Friend request not found' });

    friendRequest.status = status;
    if (status === 'accepted') {
      user.friends.push(friendId);
      const friend = await User.findById(friendId);
      friend.friends.push(userId);
      await friend.save();
    }
    await user.save();
    res.status(200).json({ message: `Friend request ${status}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to respond to friend request' });
  }
});

module.exports = router;
