const express = require('express');
const Post = require('../models/Post.model.js');
const User = require('../models/User.model.js');

const router = express.Router();

// Create Post
router.post('/', async (req, res) => {
  const { userId, content } = req.body;
  try {
    const newPost = new Post({ user: userId, content });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Add Comment to a Post
router.post('/:postId/comment', async (req, res) => {
  const { userId, content } = req.body;
  try {
    const post = await Post.findById(req.params.postId);
    post.comments.push({ user: userId, content });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

module.exports = router;
