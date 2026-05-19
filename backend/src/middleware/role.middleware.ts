import type { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    sendError(res, 'Admin access required', 403);
    return;
  }
  next();
};
