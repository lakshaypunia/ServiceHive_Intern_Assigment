import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { sendError } from '../utils/response';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    sendError(res, 'Authentication required', 401);
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = {
      _id: payload._id,
      email: payload.email,
      role: payload.role as 'admin' | 'sales_user',
    };
    next();
  } catch {
    sendError(res, 'Invalid or expired token', 401);
  }
};
