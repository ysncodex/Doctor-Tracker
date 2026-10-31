import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors'; // 1. Import cors here

import apiRoutes from './routes/index.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { apiRateLimiter } from './middleware/rate-limit.middleware.js';

const app = express();

app.use(
  cors({
    origin: ['https://doctortracker-x.netlify.app', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.disable('x-powered-by');

const proxyHops = Number.parseInt(process.env.TRUST_PROXY_HOPS ?? '1', 10);
app.set('trust proxy', Number.isNaN(proxyHops) ? 1 : proxyHops);

app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', apiRateLimiter, apiRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

app.use(errorMiddleware);

export default app;
