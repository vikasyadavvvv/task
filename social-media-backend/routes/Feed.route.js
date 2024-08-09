const express = require('express');
const User = require('../models/User.model.js');
const Post = require('../models/Post.model.js');

const router = express.Router();

// Get the feed for a user
router.get('/', async (req, res) => {
  const { userId } = req.query;

  try {
    // Fetch user's friends
    const user = await User.findById(userId).populate('friends');

    if (!user) return res.status(404).json({ error: 'User not found' });

    const friendsIds = user.friends.map(friend => friend._id);

    // Fetch posts by friends
    const friendPosts = await Post.find({ user: { $in: friendsIds } })
                                  .populate('user', 'username')
                                  .populate({
                                    path: 'comments.user',
                                    select: 'username'
                                  });

    // Fetch posts commented on by friends
    const commentedPosts = await Post.find({ 'comments.user': { $in: friendsIds } })
                                     .populate('user', 'username')
                                     .populate({
                                       path: 'comments.user',
                                       select: 'username'
                                     });

    // Combine and deduplicate posts
    const allPosts = [...friendPosts, ...commentedPosts];
    const uniquePosts = Array.from(new Set(allPosts.map(post => post._id.toString())))
                              .map(id => allPosts.find(post => post._id.toString() === id));

    // Sort posts by creation date
    uniquePosts.sort((a, b) => b.createdAt - a.createdAt);


    res.status(200).json(uniquePosts);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

module.exports = router;
