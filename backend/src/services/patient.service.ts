import mongoose from 'mongoose';
import { Patient } from '../models/patient.model.js';
import { Doctor } from '../models/doctor.model.js';
import { ApiError } from '../utils/ApiError.js';
import { buildDateRange } from '../utils/date-range.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';
import {
  buildWordSearch,
  escapeRegex,
  matchExistingLabel,
  normalizeSearchTerm,
  sortAlphabetically,
  tidyLabel,
} from '../utils/search.js';

interface PatientFilters {
  page?: unknown;
  limit?: unknown;
  search?: unknown;
  condition?: unknown;
  gender?: unknown;
  doctorId?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  sort?: unknown;
}

type SortSpec = Record<string, 1 | -1>;

/** Whitelist: the client can only pick one of these, never pass raw sort keys. */
const SORTS: Record<string, SortSpec> = {
  newest: { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 },
  name: { name: 1, _id: 1 },
};

const GENDERS = ['Male', 'Female', 'Other'];

/** "0171-234", "+880 17" and similar are treated as a phone search, everything else as a name search. */
const LOOKS_LIKE_PHONE = /^[\d+\-()\s]{3,}$/;

async function ensureDoctorExists(doctorId: string) {
  if (!mongoose.isValidObjectId(doctorId)) {
    throw new ApiError(400, 'Invalid doctor ID');
  }

  const doctorExists = await Doctor.exists({ _id: doctorId });

  if (!doctorExists) {
    throw new ApiError(404, 'Assigned doctor not found');
  }
}

/**
 * Conditions are free text. Reuse the stored spelling when only the
 * capitalisation differs ("diabetes" -> "Diabetes") so the condition filter
 * never shows the same condition twice.
 */
async function withCanonicalCondition(data: Record<string, unknown>, excludeId?: string) {
  if (typeof data.condition !== 'string' || !data.condition.trim()) return data;

  const value = tidyLabel(data.condition);
  const existing = await Patient.distinct(
    'condition',
    excludeId ? { _id: { $ne: excludeId } } : {}
  );

  return { ...data, condition: matchExistingLabel(existing, value) };
}

export async function createPatient(data: Record<string, unknown>) {
  await ensureDoctorExists(data.doctorId as string);

  return Patient.create(await withCanonicalCondition(data));
}

export async function listPatients(filters: PatientFilters) {
  const { page, limit, skip } = getPagination(filters);

  const query: Record<string, unknown> = {};

  const search = normalizeSearchTerm(filters.search);
  if (search) {
    if (LOOKS_LIKE_PHONE.test(search)) {
      query.phone = new RegExp(escapeRegex(search), 'i');
    } else {
      Object.assign(query, buildWordSearch(['name'], search));
    }
  }

  if (typeof filters.condition === 'string' && filters.condition.trim()) {
    query.condition = tidyLabel(filters.condition);
  }

  if (typeof filters.gender === 'string' && filters.gender) {
    if (!GENDERS.includes(filters.gender)) {
      throw new ApiError(400, 'Invalid gender');
    }

    query.gender = filters.gender;
  }

  if (typeof filters.doctorId === 'string' && filters.doctorId) {
    if (!mongoose.isValidObjectId(filters.doctorId)) {
      throw new ApiError(400, 'Invalid doctor ID');
    }

    query.doctorId = new mongoose.Types.ObjectId(filters.doctorId);
  }

  const dateRange = buildDateRange(filters.startDate, filters.endDate);
  if (dateRange) query.createdAt = dateRange;

  const sortKey =
    typeof filters.sort === 'string' && Object.hasOwn(SORTS, filters.sort)
      ? filters.sort
      : 'newest';

  const listQuery = Patient.find(query)
    .populate('doctorId', 'name specialization hospital')
    .sort(SORTS[sortKey])
    .skip(skip)
    .limit(limit)
    .lean();

  // Binary ordering puts "alan" after "Zoe"; use a case-insensitive order for names.
  if (sortKey === 'name') listQuery.collation({ locale: 'en', strength: 2 });

  const [patients, total] = await Promise.all([listQuery, Patient.countDocuments(query)]);

  return {
    patients,
    pagination: paginationMeta(page, limit, total),
  };
}

/** Conditions that actually exist, used to build the condition filter and form suggestions. */
export async function getPatientFilterOptions() {
  const conditions = await Patient.distinct('condition');

  return { conditions: sortAlphabetically(conditions) };
}

export async function getPatientById(id: string) {
  const patient = await Patient.findById(id)
    .populate('doctorId', 'name specialization hospital')
    .lean();

  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  return patient;
}

export async function updatePatient(id: string, data: Record<string, unknown>) {
  if (data.doctorId) {
    await ensureDoctorExists(data.doctorId as string);
  }

  const patient = await Patient.findByIdAndUpdate(
    id,
    { $set: await withCanonicalCondition(data, id) },
    { returnDocument: 'after', runValidators: true }
  ).populate('doctorId', 'name specialization hospital');

  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  return patient;
}

export async function deletePatient(id: string) {
  const patient = await Patient.findByIdAndDelete(id);

  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  return { id };
}
