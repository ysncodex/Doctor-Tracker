import { z } from 'zod';

const doctorFields = {
  name: z.string().trim().min(2).max(100),
  specialization: z.string().trim().min(2).max(100),
  hospital: z.string().trim().min(2).max(150),
  phone: z.string().trim().min(7).max(20),
  email: z.string().trim().email().max(254),
};

export const createDoctorSchema = z.object({
  body: z.object(doctorFields),
});

export const updateDoctorSchema = z.object({
  body: z
    .object({
      name: doctorFields.name.optional(),
      specialization: doctorFields.specialization.optional(),
      hospital: doctorFields.hospital.optional(),
      phone: doctorFields.phone.optional(),
      email: doctorFields.email.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field is required',
    }),
});
