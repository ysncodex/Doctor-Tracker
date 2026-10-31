import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import apiRoutes from './routes/index.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { apiRateLimiter } from './middleware/rate-limit.middleware.js';

const app = express();

app.disable('x-powered-by');

// The API sits behind the Next.js rewrite proxy, so the client IP arrives in
// X-Forwarded-For. Trust exactly that one hop so rate limits apply per client,
// not to the proxy itself. Set TRUST_PROXY_HOPS=0 if the API is exposed directly.
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
