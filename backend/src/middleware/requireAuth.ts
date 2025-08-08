import { Request, Response, NextFunction } from 'express';

export default function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.teamId) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}
