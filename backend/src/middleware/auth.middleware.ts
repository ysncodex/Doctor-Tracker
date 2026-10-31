import type { RequestHandler } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';

export const authenticate: RequestHandler = (req, _res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      throw new ApiError(401, 'Authentication required');
    }

    req.user = verifyToken(token);

    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired authentication'));
  }
};
