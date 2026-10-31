import { Router } from 'express';
import authRoutes from './auth.routes.js';
import doctorRoutes from './doctor.routes.js';
import patientRoutes from './patient.routes.js';
import dashboardRoutes from './dashboard.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Doctor Tracker API is running',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/doctors', doctorRoutes);
router.use('/patients', patientRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
