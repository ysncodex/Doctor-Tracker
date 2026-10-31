import { Doctor } from '../models/doctor.model.js';
import { Patient } from '../models/patient.model.js';
import { ApiError } from '../utils/ApiError.js';
import { buildDateRange } from '../utils/date-range.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';
import {
  buildWordSearch,
  matchExistingLabel,
  normalizeSearchTerm,
  sortAlphabetically,
  tidyLabel,
} from '../utils/search.js';

interface DoctorFilters {
  page?: unknown;
  limit?: unknown;
  search?: unknown;
  specialization?: unknown;
  hospital?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  sort?: unknown;
}

type SortSpec = Record<string, 1 | -1>;

const SORTS: Record<string, SortSpec> = {
  newest: { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 },
  name: { name: 1, _id: 1 },
};

const LABEL_FIELDS = ['specialization', 'hospital'] as const;

function readLabel(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? tidyLabel(value) : undefined;
}

async function withCanonicalLabels(data: Record<string, unknown>, excludeId?: string) {
  const result = { ...data };

  await Promise.all(
    LABEL_FIELDS.map(async (field) => {
      const value = readLabel(result[field]);
      if (!value) return;

      const existing = await Doctor.distinct(field, excludeId ? { _id: { $ne: excludeId } } : {});
      result[field] = matchExistingLabel(existing, value);
    })
  );

  return result;
}

export async function createDoctor(data: Record<string, unknown>) {
  return Doctor.create(await withCanonicalLabels(data));
}

export async function listDoctors(filters: DoctorFilters) {
  const { page, limit, skip } = getPagination(filters);

  const query: Record<string, unknown> = {};

  const search = normalizeSearchTerm(filters.search);
  if (search) {
    Object.assign(query, buildWordSearch(['name', 'specialization', 'hospital', 'email'], search));
  }

  const specialization = readLabel(filters.specialization);
  if (specialization) query.specialization = specialization;

  const hospital = readLabel(filters.hospital);
  if (hospital) query.hospital = hospital;

  const dateRange = buildDateRange(filters.startDate, filters.endDate);
  if (dateRange) query.createdAt = dateRange;

  const sortKey =
    typeof filters.sort === 'string' && Object.hasOwn(SORTS, filters.sort)
      ? filters.sort
      : 'newest';

  const listQuery = Doctor.find(query)
    .select('name specialization hospital phone email createdAt')
    .sort(SORTS[sortKey])
    .skip(skip)
    .limit(limit)
    .lean();

  if (sortKey === 'name') listQuery.collation({ locale: 'en', strength: 2 });

  const [doctors, total] = await Promise.all([listQuery, Doctor.countDocuments(query)]);

  return {
    doctors,
    pagination: paginationMeta(page, limit, total),
  };
}

export async function getDoctorFilterOptions() {
  const [specializations, hospitals] = await Promise.all([
    Doctor.distinct('specialization'),
    Doctor.distinct('hospital'),
  ]);

  return {
    specializations: sortAlphabetically(specializations),
    hospitals: sortAlphabetically(hospitals),
  };
}

const OPTIONS_LIMIT = 1000;

export async function listDoctorOptions() {
  return Doctor.find()
    .select('name specialization hospital')
    .sort({ name: 1, _id: 1 })
    .collation({ locale: 'en', strength: 2 })
    .limit(OPTIONS_LIMIT)
    .lean();
}

export async function getDoctorById(id: string) {
  const doctor = await Doctor.findById(id).lean();

  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  return doctor;
}

export async function updateDoctor(id: string, data: Record<string, unknown>) {
  const doctor = await Doctor.findByIdAndUpdate(
    id,
    { $set: await withCanonicalLabels(data, id) },
    {
      returnDocument: 'after',
      runValidators: true,
    }
  );

  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  return doctor;
}

export async function deleteDoctor(id: string) {
  const doctor = await Doctor.findById(id);

  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  const patientExists = await Patient.exists({ doctorId: id });

  if (patientExists) {
    throw new ApiError(409, 'This doctor has patients. Reassign or delete the patients first.');
  }

  await doctor.deleteOne();

  return { id };
}

export async function getDoctorPatients(id: string, filters: DoctorFilters) {
  const doctorExists = await Doctor.exists({ _id: id });

  if (!doctorExists) {
    throw new ApiError(404, 'Doctor not found');
  }

  const { page, limit, skip } = getPagination(filters);

  const [patients, total] = await Promise.all([
    Patient.find({ doctorId: id }).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit).lean(),

    Patient.countDocuments({ doctorId: id }),
  ]);

  return {
    patients,
    pagination: paginationMeta(page, limit, total),
  };
}
