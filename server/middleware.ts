
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const accessToken = req.headers.authorization?.split(' ')[1];
  
  if (!accessToken) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const user = await storage.getUserByToken(accessToken);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
}
