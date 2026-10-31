import mongoose, { Schema, Document } from 'mongoose';

export type PatientCondition = string;

export interface IPatient extends Document {
  doctorId: mongoose.Types.ObjectId;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  condition: PatientCondition;
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new Schema<IPatient>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 0,
      max: 120,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    condition: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
  },
  { timestamps: true }
);

patientSchema.index({ doctorId: 1, createdAt: -1 });
patientSchema.index({ condition: 1, createdAt: -1 });
patientSchema.index({ gender: 1, createdAt: -1 });
patientSchema.index({ name: 1 });
patientSchema.index({ phone: 1 });
patientSchema.index({ createdAt: -1 });

export const Patient = mongoose.model<IPatient>('Patient', patientSchema);
