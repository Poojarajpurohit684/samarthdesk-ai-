import { Request, Response, NextFunction } from 'express';
import { PaginationParams } from '../types';

export const paginate = (req: Request, _res: Response, next: NextFunction) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
  const skip = (page - 1) * limit;

  req.pagination = {
    page,
    limit,
    skip,
  } as PaginationParams;

  next();
};

declare global {
  namespace Express {
    interface Request {
      pagination?: PaginationParams;
    }
  }
}
