import { Router } from 'express';
import { loginRateLimiter } from '../middleware/rate-limit.middleware.js';
import { login, logout, me } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { loginSchema } from '../validators/auth.validator.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/login', loginRateLimiter, validate(loginSchema), asyncHandler(login));
router.post('/logout', authenticate, asyncHandler(logout));
router.get('/me', authenticate, asyncHandler(me));

export default router;
