import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    volunteerId?: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkeyforvolunteerhub';

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token is invalid or expired' });
    }
    req.user = decoded as { id: string; email: string; role: string; volunteerId?: string };
    next();
  });
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

export const requireVolunteer = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'volunteer') {
    return res.status(403).json({ message: 'Volunteer access required' });
  }
  next();
};
