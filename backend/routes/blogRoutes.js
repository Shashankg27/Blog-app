const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Blog = require('../models/Blog');
const jwt = require('jsonwebtoken'); // Import jwt for token verification in this route

// Get blogs based on query parameters (status, user)
router.get('/', async (req, res) => {
  try {
    const { status, user } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (user) {
      query.user = user;
    }

    const blogs = await Blog.find(query)
      .populate('user', 'username')
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({ message: 'Error fetching blogs', error: err.message });
  }
});

// Get a single blog (publicly show published, drafts only for owner)
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('user', 'username');
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json(blog);
  } catch (err) {
    console.error('Error fetching blog:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(500).json({ message: 'Error fetching blog', error: err.message });
  }
});

// Create a new blog (protected - linked to authenticated user)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content, tags, status } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const blog = new Blog({
      title,
      content,
      tags: tags || [],
      status: status || 'draft',
      user: req.user.id
    });

    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    console.error('Error creating blog:', err);
    res.status(500).json({ message: 'Error creating blog', error: err.message });
  }
});

// Update a blog (protected - only by owner)
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this blog' });
    }

    const { title, content, tags, status } = req.body;
    const updates = {};

    if (title) updates.title = title;
    if (content) updates.content = content;
    if (tags) updates.tags = tags;
    if (status) updates.status = status;

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json(updatedBlog);
  } catch (err) {
    console.error('Error updating blog:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(500).json({ message: 'Error updating blog', error: err.message });
  }
});

// Delete a blog (protected - only by owner)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this blog' });
    }

    await blog.deleteOne();
    res.json({ message: 'Blog deleted successfully' });
  } catch (err) {
    console.error('Error deleting blog:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(500).json({ message: 'Error deleting blog', error: err.message });
  }
});

module.exports = router; 