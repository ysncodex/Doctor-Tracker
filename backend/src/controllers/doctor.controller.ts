import type { RequestHandler } from 'express';
import mongoose from 'mongoose';
import * as doctorService from '../services/doctor.service.js';
import { ApiError } from '../utils/ApiError.js';

type IdParams = { id: string };

function validateId(id: string) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid doctor ID');
  }
}

export const createDoctor: RequestHandler = async (req, res) => {
  const doctor = await doctorService.createDoctor(req.body);

  res.status(201).json({
    success: true,
    message: 'Doctor created successfully',
    data: { doctor },
  });
};

export const listDoctors: RequestHandler = async (req, res) => {
  const result = await doctorService.listDoctors(req.query);

  res.status(200).json({
    success: true,
    data: result.doctors,
    pagination: result.pagination,
  });
};

export const getDoctorFilterOptions: RequestHandler = async (_req, res) => {
  const options = await doctorService.getDoctorFilterOptions();

  res.status(200).json({
    success: true,
    data: options,
  });
};

export const listDoctorOptions: RequestHandler = async (_req, res) => {
  const doctors = await doctorService.listDoctorOptions();

  res.status(200).json({
    success: true,
    data: doctors,
  });
};

export const getDoctor: RequestHandler<IdParams> = async (req, res) => {
  validateId(req.params.id);

  const doctor = await doctorService.getDoctorById(req.params.id);

  res.status(200).json({
    success: true,
    data: { doctor },
  });
};

export const updateDoctor: RequestHandler<IdParams> = async (req, res) => {
  validateId(req.params.id);

  const doctor = await doctorService.updateDoctor(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Doctor updated successfully',
    data: { doctor },
  });
};

export const deleteDoctor: RequestHandler<IdParams> = async (req, res) => {
  validateId(req.params.id);

  await doctorService.deleteDoctor(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Doctor deleted successfully',
  });
};

export const getDoctorPatients: RequestHandler<IdParams> = async (req, res) => {
  validateId(req.params.id);

  const result = await doctorService.getDoctorPatients(req.params.id, req.query);

  res.status(200).json({
    success: true,
    data: result.patients,
    pagination: result.pagination,
  });
};
