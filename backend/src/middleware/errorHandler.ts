import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { config } from '../config';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Error:', {
    message: err.message,
    stack: config.env !== 'production' ? err.stack : undefined,
    url: req.url,
    method: req.method,
  });

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Prisma known request errors (e.g. unique constraint violation)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({
        success: false,
        message: 'A record with this value already exists',
      });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Record not found',
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: 'Database error occurred',
    });
    return;
  }

  // Zod validation errors (should be caught by validate middleware, but just in case)
  if (err instanceof ZodError) {
    const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    res.status(400).json({
      success: false,
      message: messages.join(', '),
    });
    return;
  }

  // Default error
  const statusCode = 500;
  const message = config.env === 'production' ? 'Internal server error' : err.message;

  res.status(statusCode).json({
    success: false,
    message,
  });
};
