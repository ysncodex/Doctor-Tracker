import type { RequestHandler } from 'express';
import mongoose from 'mongoose';
import * as patientService from '../services/patient.service.js';
import { ApiError } from '../utils/ApiError.js';

type IdParams = { id: string };

function validateId(id: string) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid patient ID');
  }
}

export const createPatient: RequestHandler = async (req, res) => {
  const patient = await patientService.createPatient(req.body);

  res.status(201).json({
    success: true,
    message: 'Patient created successfully',
    data: { patient },
  });
};

export const listPatients: RequestHandler = async (req, res) => {
  const result = await patientService.listPatients(req.query);

  res.status(200).json({
    success: true,
    data: result.patients,
    pagination: result.pagination,
  });
};

export const getPatientFilterOptions: RequestHandler = async (_req, res) => {
  const options = await patientService.getPatientFilterOptions();

  res.status(200).json({
    success: true,
    data: options,
  });
};

export const getPatient: RequestHandler<IdParams> = async (req, res) => {
  validateId(req.params.id);

  const patient = await patientService.getPatientById(req.params.id);

  res.status(200).json({
    success: true,
    data: { patient },
  });
};

export const updatePatient: RequestHandler<IdParams> = async (req, res) => {
  validateId(req.params.id);

  const patient = await patientService.updatePatient(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Patient updated successfully',
    data: { patient },
  });
};

export const deletePatient: RequestHandler<IdParams> = async (req, res) => {
  validateId(req.params.id);

  await patientService.deletePatient(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Patient deleted successfully',
  });
};
