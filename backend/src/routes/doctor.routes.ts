import { Router } from 'express';
import * as controller from '../controllers/doctor.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createDoctorSchema, updateDoctorSchema } from '../validators/doctor.validator.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createDoctorSchema), asyncHandler(controller.createDoctor));
router.get('/', asyncHandler(controller.listDoctors));

router.get('/options', asyncHandler(controller.listDoctorOptions));
router.get('/filter-options', asyncHandler(controller.getDoctorFilterOptions));

router.get('/:id/patients', asyncHandler(controller.getDoctorPatients));
router.get('/:id', asyncHandler(controller.getDoctor));
router.patch('/:id', validate(updateDoctorSchema), asyncHandler(controller.updateDoctor));
router.delete('/:id', asyncHandler(controller.deleteDoctor));

export default router;
