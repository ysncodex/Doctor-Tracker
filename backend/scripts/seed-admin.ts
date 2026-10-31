import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { connectDatabase } from '../src/config/database.js';
import { User } from '../src/models/user.model.js';
import { Doctor } from '../src/models/doctor.model.js';

async function seedAdmin() {
  try {
    await connectDatabase();

    // ==========================================
    // 1. Seed Admin User
    // ==========================================

    const adminEmail = 'admin@doctortracker.com';
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || adminPassword.length < 8) {
      throw new Error('Set ADMIN_PASSWORD with at least 8 characters in .env');
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    await User.updateOne(
      { email: adminEmail },
      {
        $set: {
          name: 'System Administrator',
          email: adminEmail,
          password: hashedPassword,
          role: 'admin',
        },
      },
      { upsert: true, runValidators: true }
    );

    console.log('Admin account created or updated successfully');

    // ==========================================
    // 2. Seed 6 Test Doctor Profiles
    // ==========================================

    const testDoctors = [
      {
        name: 'Dr. John Smith',
        specialization: 'Cardiology',
        hospital: 'City General Hospital',
        phone: '+8801700000001',
        email: 'john.smith@doctortracker.com',
      },
      {
        name: 'Dr. Sarah Ahmed',
        specialization: 'Neurology',
        hospital: 'Dhaka Medical College Hospital',
        phone: '+8801700000002',
        email: 'sarah.ahmed@doctortracker.com',
      },
      {
        name: 'Dr. Michael Brown',
        specialization: 'Dermatology',
        hospital: 'Square Hospital',
        phone: '+8801700000003',
        email: 'michael.brown@doctortracker.com',
      },
      {
        name: 'Dr. Emily Wilson',
        specialization: 'Pediatrics',
        hospital: 'United Hospital',
        phone: '+8801700000004',
        email: 'emily.wilson@doctortracker.com',
      },
      {
        name: 'Dr. David Lee',
        specialization: 'Orthopedics',
        hospital: 'Evercare Hospital Dhaka',
        phone: '+8801700000005',
        email: 'david.lee@doctortracker.com',
      },
      {
        name: 'Dr. Fatima Rahman',
        specialization: 'Gynecology',
        hospital: 'Ibn Sina Hospital',
        phone: '+8801700000006',
        email: 'fatima.rahman@doctortracker.com',
      },
    ];

    await Doctor.bulkWrite(
      testDoctors.map((doctor) => ({
        updateOne: {
          filter: { email: doctor.email },
          update: { $set: doctor },
          upsert: true,
        },
      }))
    );

    console.log('6 test doctor profiles created or updated successfully');

    // ==========================================
    // 3. Summary
    // ==========================================

    console.log('\n================================');
    console.log('DATABASE SEEDING COMPLETED');
    console.log('================================');
    console.log(`Admin: ${adminEmail}`);
    console.log(`Test Doctors: ${testDoctors.length}`);
    console.log('================================');
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

void seedAdmin();
