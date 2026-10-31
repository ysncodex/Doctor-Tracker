import { Router } from 'express';
import * as controller from '../controllers/patient.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createPatientSchema, updatePatientSchema } from '../validators/patient.validator.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createPatientSchema), asyncHandler(controller.createPatient));
router.get('/', asyncHandler(controller.listPatients));
// Fixed paths must be registered before '/:id', or Express treats them as an id.
router.get('/filter-options', asyncHandler(controller.getPatientFilterOptions));
router.get('/:id', asyncHandler(controller.getPatient));
router.patch('/:id', validate(updatePatientSchema), asyncHandler(controller.updatePatient));
router.delete('/:id', asyncHandler(controller.deletePatient));

export default router;
