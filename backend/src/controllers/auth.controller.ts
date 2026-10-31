import type { RequestHandler } from 'express';
import { loginUser, getCurrentUser } from '../services/auth.service.js';
import { ApiError } from '../utils/ApiError.js';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 24 * 60 * 60 * 1000,
};

export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  const result = await loginUser(email, password);

  res.cookie('accessToken', result.token, cookieOptions);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { user: result.user },
  });
};

export const logout: RequestHandler = (_req, res) => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

export const me: RequestHandler = async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  const user = await getCurrentUser(req.user.userId);

  res.status(200).json({
    success: true,
    data: { user },
  });
};
