import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

interface RegisterBody {
  username: string;
  password: string;
}

interface LoginBody {
  username: string;
  password: string;
}

interface JwtPayload {
  user: {
    id: string;
  };
}

// Register new user
router.post('/register', async (req: Request<{}, {}, RegisterBody>, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ username });
    if (user) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Create new user
    user = new User({
      username,
      password,
    });

    await user.save();

    // Generate JWT
    const payload: JwtPayload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' },
      (err: Error | null, token?: string) => {
        if (err) {
          throw err;
        }
        if (token) {
          res.status(201).json({ token });
        }
      }
    );
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Login user
router.post('/login', async (req: Request<{}, {}, LoginBody>, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ username });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Validate password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate JWT
    const payload: JwtPayload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' },
      (err: Error | null, token?: string) => {
        if (err) {
          throw err;
        }
        if (token) {
          // Set token as HTTP-only cookie
          res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
            sameSite: 'lax', // CSRF protection
            maxAge: 3600000 // 1 hour in milliseconds
          });
          res.json({ token, message: 'Login successful' });
        }
      }
    );
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get user information
router.get('/me', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    // console.log(req.user);
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;

