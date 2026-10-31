import type { Patient } from '@/types';

type DoctorRef = Patient['doctorId'] | null | undefined;

/**
 * `doctorId` is either a plain id or a populated doctor object, and it can be
 * null when the doctor was deleted. Never touch `.name` / `._id` directly.
 */
export function getDoctorId(doctorId: DoctorRef): string {
  if (!doctorId) return '';
  return typeof doctorId === 'string' ? doctorId : doctorId._id;
}

export function getDoctorName(doctorId: DoctorRef): string | null {
  return doctorId && typeof doctorId === 'object' ? (doctorId.name ?? null) : null;
}
