import type { Patient } from '@/types';

type DoctorRef = Patient['doctorId'] | null | undefined;

export function getDoctorId(doctorId: DoctorRef): string {
  if (!doctorId) return '';
  return typeof doctorId === 'string' ? doctorId : doctorId._id;
}

export function getDoctorName(doctorId: DoctorRef): string | null {
  return doctorId && typeof doctorId === 'object' ? (doctorId.name ?? null) : null;
}
