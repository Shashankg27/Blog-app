const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Blog = require('../models/Blog');
const jwt = require('jsonwebtoken'); // Import jwt for token verification in this route

// Get blogs based on query parameters (status, user)
router.get('/', async (req, res) => {
  try {
    let query = {};
    const { status, user: userFilter } = req.query; // Get status and user query parameters

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Filter by user if 'me' is specified
    if (userFilter === 'me') {
      const token = req.header('x-auth-token');
      if (!token) {
        return res.status(401).json({ message: 'Authentication required to view your blogs' });
      }
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        query.user = decoded.user.id; // Filter by authenticated user's ID
      } catch (err) {
        console.error('Invalid token for filtering by user:', err.message);
        return res.status(401).json({ message: 'Invalid token' });
      }
    }

    // Default to published if no status or user filter is provided
    if (!status && !userFilter) {
        query.status = 'published';
    }

    const blogs = await Blog.find(query).populate('user', 'username'); // Optionally populate user info
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single blog (publicly show published, drafts only for owner)
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('user', 'username');

    if (blog == null) {
      return res.status(404).json({ message: 'Cannot find blog' });
    }

    // If it's a draft, ensure the requesting user is the owner
    if (blog.status === 'draft') {
       const token = req.header('x-auth-token');
       if (!token) {
           return res.status(401).json({ message: 'Not authorized to view this draft' });
       }
       try {
           const decoded = jwt.verify(token, process.env.JWT_SECRET);
           if (blog.user.toString() !== decoded.user.id) {
                return res.status(401).json({ message: 'Not authorized to view this draft' });
           }
       } catch (err) {
           console.error('Invalid token for viewing draft:', err.message);
           return res.status(401).json({ message: 'Not authorized to view this draft' });
       }
    }

    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new blog (protected - linked to authenticated user)
router.post('/', authMiddleware, async (req, res) => {
  const blog = new Blog({
    title: req.body.title,
    content: req.body.content,
    tags: req.body.tags,
    status: req.body.status,
    user: req.user.id, // Link blog to authenticated user
  });

  try {
    const newBlog = await blog.save();
    res.status(201).json(newBlog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a blog (protected - only by owner)
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (blog == null) {
      return res.status(404).json({ message: 'Cannot find blog' });
    }

    // Ensure the logged-in user is the owner of the blog
    if (blog.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    if (req.body.title != null) {
      blog.title = req.body.title;
    }
    if (req.body.content != null) {
      blog.content = req.body.content;
    }
    if (req.body.tags != null) {
      blog.tags = req.body.tags;
    }
     if (req.body.status != null) {
      blog.status = req.body.status;
    }

    const updatedBlog = await blog.save();
    res.json(updatedBlog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a blog (protected - only by owner)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (blog == null) {
      return res.status(404).json({ message: 'Cannot find blog' });
    }

     // Ensure the logged-in user is the owner of the blog
    if (blog.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await Blog.deleteOne({ _id: req.params.id });
    res.json({ message: 'Deleted blog' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 