import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

interface DecodedToken extends JwtPayload {
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
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    req.user = decoded.user;
    // console.log("user:", req.user);
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default authMiddleware;

