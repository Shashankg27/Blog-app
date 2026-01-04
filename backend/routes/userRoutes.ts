import express, { Request, Response } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Blog from '../models/Blog.js';

const router = express.Router();

router.get('/search', async (req: Request<{}, {}, {}, { q?: string }>, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      const users = await User.find({}).select('-password');
      res.json(users);
      return;
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
      ],
    })
      .select('-password');

    res.json(users);
  } catch (err: any) {
    console.error('Error searching users:', err);
    res.status(500).json({ message: 'Error searching users', error: err.message });
  }
});

router.get('/:id/followers', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id)
    .populate('followers', 'username firstName lastName email')
    .select('followers');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.json(user.followers);
  } catch (err: any) {
    console.error('Error fetching followers:', err);
    res.status(500).json({ message: 'Error fetching followers', error: err.message });
  }
});

router.get('/:id/following', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id)
    .populate('following', 'username firstName lastName email')
    .select('following');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.json(user.following);
  } catch (err: any) {
    console.error('Error fetching following:', err);
    res.status(500).json({ message: 'Error fetching following', error: err.message });
  }
});

router.post('/:id/follow', authMiddleware, async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (req.params.id === req.user.id) {
      res.status(400).json({ message: 'Cannot follow yourself' });
      return;
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);
    
    if (!userToFollow || !currentUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    const isFollowing = currentUser.following.includes(req.params.id as any);
    
    if (isFollowing) {
      currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.id);
      userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== req.user!.id);
      await currentUser.save();
      await userToFollow.save();
      res.json({ message: 'Unfollowed successfully', isFollowing: false });
    } else {
      currentUser.following.push(req.params.id as any);
      userToFollow.followers.push(req.user.id as any);
      await currentUser.save();
      await userToFollow.save();
      res.json({ message: 'Followed successfully', isFollowing: true });
    }
  } catch (err: any) {
    console.error('Error following user:', err);
    res.status(500).json({ message: 'Error following user', error: err.message });
  }
});

router.get('/:id', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'username firstName lastName')
      .populate('following', 'username firstName lastName');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const blogs = await Blog.find({ user: req.params.id, status: 'published' })
      .sort({ created_at: -1 })
      .limit(10);

    res.json({ ...user.toObject(), blogs });
  } catch (err: any) {
    console.error('Error fetching user:', err);
    if (err.kind === 'ObjectId') {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
});

export default router;

