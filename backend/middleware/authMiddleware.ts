import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  user: {
    id: string;
  };
}

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Get token from cookie first, then fall back to header
  const token = req.cookies?.token || req.header('x-auth-token');

  // Check if not token
  if (!token) {
    res.status(401).json({ message: 'No token, authorization denied' });
    return;
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default authMiddleware;

