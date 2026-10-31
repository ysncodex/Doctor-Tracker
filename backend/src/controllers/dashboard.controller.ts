import type { RequestHandler } from 'express';
import { getDashboardStats } from '../services/dashboard.service.js';

export const getStats: RequestHandler = async (_req, res) => {
  const stats = await getDashboardStats();

  res.status(200).json({
    success: true,
    data: stats,
  });
};
