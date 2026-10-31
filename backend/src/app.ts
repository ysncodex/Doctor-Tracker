import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import apiRoutes from './routes/index.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { apiRateLimiter } from './middleware/rate-limit.middleware.js';

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
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
