import 'dotenv/config';
import mongoose from 'mongoose';

import { connectDatabase } from '../src/config/database.js';
import { Doctor } from '../src/models/doctor.model.js';
import { Patient } from '../src/models/patient.model.js';

const DAY_MS = 24 * 60 * 60 * 1000;

function createRandom(seed: number) {
  let state = seed;

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = createRandom(20261031);

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(random() * items.length)];
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * DAY_MS - Math.floor(random() * DAY_MS));
}

const DOCTORS = [
  {
    name: 'Dr. John Smith',
    specialization: 'Cardiology',
    hospital: 'City General Hospital',
    phone: '+8801700000001',
    email: 'john.smith@doctortracker.com',
    joinedDaysAgo: 175,
  },
  {
    name: 'Dr. Sarah Ahmed',
    specialization: 'Neurology',
    hospital: 'Dhaka Medical College Hospital',
    phone: '+8801700000002',
    email: 'sarah.ahmed@doctortracker.com',
    joinedDaysAgo: 160,
  },
  {
    name: 'Dr. Michael Brown',
    specialization: 'Dermatology',
    hospital: 'Square Hospital',
    phone: '+8801700000003',
    email: 'michael.brown@doctortracker.com',
    joinedDaysAgo: 120,
  },
  {
    name: 'Dr. Emily Wilson',
    specialization: 'Pediatrics',
    hospital: 'United Hospital',
    phone: '+8801700000004',
    email: 'emily.wilson@doctortracker.com',
    joinedDaysAgo: 95,
  },
  {
    name: 'Dr. David Lee',
    specialization: 'Orthopedics',
    hospital: 'Evercare Hospital Dhaka',
    phone: '+8801700000005',
    email: 'david.lee@doctortracker.com',
    joinedDaysAgo: 70,
  },
  {
    name: 'Dr. Fatima Rahman',
    specialization: 'Gynecology',
    hospital: 'Ibn Sina Hospital',
    phone: '+8801700000006',
    email: 'fatima.rahman@doctortracker.com',
    joinedDaysAgo: 45,
  },
  {
    name: 'Dr. Nadia Karim',
    specialization: 'Endocrinology',
    hospital: 'Labaid Specialized Hospital',
    phone: '+8801700000007',
    email: 'nadia.karim@doctortracker.com',
    joinedDaysAgo: 28,
  },
  {
    name: 'Dr. Arif Hossain',
    specialization: 'Cardiology',
    hospital: 'Square Hospital',
    phone: '+8801700000008',
    email: 'arif.hossain@doctortracker.com',
    joinedDaysAgo: 9,
  },
];

const FIRST_NAMES = [
  'Aarav',
  'Maya',
  'Imran',
  'Sadia',
  'Tanvir',
  'Nusrat',
  'Rafi',
  'Farhana',
  'Kamal',
  'Lina',
  'Habib',
  'Mehnaz',
  'Sohel',
  'Tania',
  'Rashed',
  'Jannat',
  'Shafiq',
  'Rima',
  'Anik',
  'Sumaiya',
];
const LAST_NAMES = [
  'Rahman',
  'Chowdhury',
  'Islam',
  'Hossain',
  'Akter',
  'Khan',
  'Siddique',
  'Begum',
  'Uddin',
  'Sarker',
  'Mia',
  'Das',
];

const CONDITIONS = [
  'Diabetes',
  'Diabetes',
  'Diabetes',
  'Hypertension',
  'Hypertension',
  'Hypertension',
  'Heart Disease',
  'Heart Disease',
  'Asthma',
  'Asthma',
  'Migraine',
  'Migraine',
  'Arthritis',
  'Thyroid Disorder',
  'Chronic Kidney Disease',
  'Anxiety Disorder',
] as const;

const GENDERS = ['Male', 'Female', 'Other'] as const;

const PATIENT_COUNT = 64;

async function seedDemo() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed demo data when NODE_ENV=production');
  }

  await connectDatabase();

  await Doctor.collection.bulkWrite(
    DOCTORS.map(({ joinedDaysAgo, ...doctor }) => {
      const joined = daysAgo(joinedDaysAgo);

      return {
        updateOne: {
          filter: { email: doctor.email },
          update: {
            $set: { ...doctor, updatedAt: new Date() },
            $min: { createdAt: joined },
          },
          upsert: true,
        },
      };
    })
  );

  const doctors = await Doctor.find({ email: { $in: DOCTORS.map((doctor) => doctor.email) } })
    .select('_id email createdAt')
    .lean();

  if (doctors.length === 0) {
    throw new Error('No demo doctors found after seeding');
  }

  const patients = Array.from({ length: PATIENT_COUNT }, (_, index) => {
    const doctor = pick(doctors);
    const earliest = Math.max(
      1,
      Math.floor((Date.now() - new Date(doctor.createdAt).getTime()) / DAY_MS)
    );
    const age = Math.floor(Math.pow(random(), 1.6) * Math.min(earliest, 175));
    const createdAt = daysAgo(age);

    return {
      updateOne: {
        filter: { phone: `+88017100${String(index + 1).padStart(5, '0')}` },
        update: {
          $setOnInsert: {
            doctorId: doctor._id,
            name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
            age: 6 + Math.floor(random() * 80),
            gender: pick(GENDERS),
            phone: `+88017100${String(index + 1).padStart(5, '0')}`,
            condition: pick(CONDITIONS),
            createdAt,
            updatedAt: createdAt,
          },
        },
        upsert: true,
      },
    };
  });

  const result = await Patient.collection.bulkWrite(patients);

  console.log('\n================================');
  console.log('DEMO DATA READY (fictional records)');
  console.log('================================');
  console.log(`Doctors:  ${DOCTORS.length}`);
  console.log(
    `Patients: ${result.upsertedCount} added, ${PATIENT_COUNT - result.upsertedCount} already present`
  );
  console.log('================================');
}

seedDemo()
  .catch((error) => {
    console.error('Demo seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
