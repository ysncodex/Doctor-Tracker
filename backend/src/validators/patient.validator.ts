import { z } from 'zod';

const patientFields = {
  doctorId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid doctor ID'),
  name: z.string().trim().min(2).max(100),
  age: z.coerce.number().int().min(0).max(120),
  gender: z.enum(['Male', 'Female', 'Other']),
  phone: z.string().trim().min(7).max(20),
  condition: z.string().trim().min(2).max(60),
};

export const createPatientSchema = z.object({
  body: z.object(patientFields),
});

export const updatePatientSchema = z.object({
  body: z
    .object({
      doctorId: patientFields.doctorId.optional(),
      name: patientFields.name.optional(),
      age: patientFields.age.optional(),
      gender: patientFields.gender.optional(),
      phone: patientFields.phone.optional(),
      condition: patientFields.condition.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field is required',
    }),
});
