export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
}

export type PatientCondition = string;

export type DoctorOption = Pick<Doctor, '_id' | 'name' | 'specialization' | 'hospital'>;

export type Gender = 'Male' | 'Female' | 'Other';

export interface Patient {
  _id: string;
  doctorId: Doctor | string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  condition: PatientCondition;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

export interface DoctorFilterOptions {
  specializations: string[];
  hospitals: string[];
}

export interface PatientFilterOptions {
  conditions: string[];
}

export interface DashboardStats {
  overview: {
    totalDoctors: number;
    totalPatients: number;
    averagePatientsPerDoctor: number;
    newDoctorsThisMonth: number;
    newPatientsThisMonth: number;
    previousMonthPatients: number;
  };
  patientsPerDoctor: {
    doctorId: string;
    doctorName: string;
    specialization: string;
    patientCount: number;
  }[];
  monthlyRegistrations: {
    year: number;
    month: number;
    total: number;
  }[];
  dailyRegistrations: {
    date: string;
    total: number;
  }[];
  conditionBreakdown: {
    condition: string;
    count: number;
  }[];
  specializationBreakdown: {
    specialization: string;
    count: number;
  }[];
  recentPatients: Patient[];
}
