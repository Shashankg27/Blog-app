import express, { Request, Response } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import Blog from '../models/Blog.js';
import upload from '../middleware/upload.js';

const router = express.Router();

interface BlogQuery {
  status?: string;
  user?: string;
}

interface CreateBlogBody {
  title: string;
  content: string;
  tags?: string[];
  status?: 'draft' | 'published';
  imageUrl?: string;
}

interface UpdateBlogBody {
  title?: string;
  content?: string;
  tags?: string[];
  status?: 'draft' | 'published';
  imageUrl?: string;
}

router.get('/', async (req: Request<{}, {}, {}, BlogQuery>, res: Response): Promise<void> => {
  try {
    const { status, user } = req.query;
    const query: any = {};

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
  } catch (err: any) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({ message: 'Error fetching blogs', error: err.message });
  }
});

router.post('/upload-image', authMiddleware, upload.single('image'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No image file provided' });
      return;
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (err: any) {
    console.error('Error uploading image:', err);
    res.status(500).json({ message: 'Error uploading image', error: err.message });
  }
});

router.get('/:id', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const blog = await Blog.findById(req.params.id).populate('user', 'username');
    if (!blog) {
      res.status(404).json({ message: 'Blog not found' });
      return;
    }
    res.json(blog);
  } catch (err: any) {
    console.error('Error fetching blog:', err);
    if (err.kind === 'ObjectId') {
      res.status(404).json({ message: 'Blog not found' });
      return;
    }
    res.status(500).json({ message: 'Error fetching blog', error: err.message });
  }
});

router.post('/', authMiddleware, async (req: Request<{}, {}, CreateBlogBody>, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { title, content, tags, status, imageUrl } = req.body;
    
    if (!title || !content) {
      res.status(400).json({ message: 'Title and content are required' });
      return;
    }

    const blog = new Blog({
      title,
      content,
      tags: tags || [],
      status: status || 'draft',
      imageUrl: imageUrl || undefined,
      user: req.user.id
    });

    await blog.save();
    res.status(201).json(blog);
  } catch (err: any) {
    console.error('Error creating blog:', err);
    res.status(500).json({ message: 'Error creating blog', error: err.message });
  }
});

router.patch('/:id', authMiddleware, async (req: Request<{ id: string }, {}, UpdateBlogBody>, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      res.status(404).json({ message: 'Blog not found' });
      return;
    }

    if (blog.user.toString() !== req.user.id) {
      res.status(403).json({ message: 'Not authorized to update this blog' });
      return;
    }

    const { title, content, tags, status, imageUrl } = req.body;
    const updates: any = {};

    if (title) updates.title = title;
    if (content) updates.content = content;
    if (tags) updates.tags = tags;
    if (status) updates.status = status;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl || null;

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json(updatedBlog);
  } catch (err: any) {
    console.error('Error updating blog:', err);
    if (err.kind === 'ObjectId') {
      res.status(404).json({ message: 'Blog not found' });
      return;
    }
    res.status(500).json({ message: 'Error updating blog', error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      res.status(404).json({ message: 'Blog not found' });
      return;
    }

    if (blog.user.toString() !== req.user.id) {
      res.status(403).json({ message: 'Not authorized to delete this blog' });
      return;
    }

    await blog.deleteOne();
    res.json({ message: 'Blog deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting blog:', err);
    if (err.kind === 'ObjectId') {
      res.status(404).json({ message: 'Blog not found' });
      return;
    }
    res.status(500).json({ message: 'Error deleting blog', error: err.message });
  }
});

export default router;

