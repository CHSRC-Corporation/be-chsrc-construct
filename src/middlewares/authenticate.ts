import type { Request, RequestHandler } from 'express';
import { verifyToken, type JwtPayload } from '../config/auth';

export type AuthenticatedRequest = Request & {
  user?: JwtPayload;
};

export const authenticate: RequestHandler = (req, res, next) => {
  const authHeader = req.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'authentication required' });
  }

  const token = authHeader.slice('Bearer '.length).trim();

  if (!token) {
    return res.status(401).json({ message: 'authentication required' });
  }

  try {
    (req as AuthenticatedRequest).user = verifyToken(token);
    return next();
  } catch {
    return res.status(401).json({ message: 'invalid or expired token' });
  }
};
