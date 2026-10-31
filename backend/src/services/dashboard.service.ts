import { Doctor } from '../models/doctor.model.js';
import { Patient } from '../models/patient.model.js';
import { fillDailySeries, fillMonthlySeries } from '../utils/time-series.js';

const MONTHS_SHOWN = 6;
const DAYS_SHOWN = 30;
const TOP_CONDITIONS = 6;
const TOP_SPECIALIZATIONS = 8;

export async function getDashboardStats() {
  const now = new Date();

  const currentMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const previousMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const seriesStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (MONTHS_SHOWN - 1), 1)
  );
  const dailyStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (DAYS_SHOWN - 1))
  );

  // Every query below is independent, so run them together. Each one is a count,
  // an index-backed $match/$group, or a small projected read: no collection is
  // ever loaded into application memory.
  const [
    totalDoctors,
    totalPatients,
    newDoctorsThisMonth,
    newPatientsThisMonth,
    previousMonthPatients,
    patientsPerDoctor,
    monthlyRows,
    dailyRows,
    conditionRows,
    specializationBreakdown,
    recentPatients,
  ] = await Promise.all([
    Doctor.countDocuments(),

    Patient.countDocuments(),

    Doctor.countDocuments({ createdAt: { $gte: currentMonthStart } }),

    Patient.countDocuments({ createdAt: { $gte: currentMonthStart } }),

    Patient.countDocuments({
      createdAt: { $gte: previousMonthStart, $lt: currentMonthStart },
    }),

    Patient.aggregate([
      { $group: { _id: '$doctorId', patientCount: { $sum: 1 } } },
      { $sort: { patientCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'doctors',
          localField: '_id',
          foreignField: '_id',
          as: 'doctor',
        },
      },
      { $unwind: '$doctor' },
      {
        $project: {
          _id: 0,
          doctorId: '$doctor._id',
          doctorName: '$doctor.name',
          specialization: '$doctor.specialization',
          patientCount: 1,
        },
      },
      { $sort: { patientCount: -1, doctorName: 1 } },
    ]),

    Patient.aggregate<{ year: number; month: number; total: number }>([
      { $match: { createdAt: { $gte: seriesStart } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: 1 },
        },
      },
      { $project: { _id: 0, year: '$_id.year', month: '$_id.month', total: 1 } },
    ]),

    Patient.aggregate<{ date: string; total: number }>([
      { $match: { createdAt: { $gte: dailyStart } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } },
          total: { $sum: 1 },
        },
      },
      { $project: { _id: 0, date: '$_id', total: 1 } },
    ]),

    Patient.aggregate<{ condition: string; count: number }>([
      { $group: { _id: '$condition', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: TOP_CONDITIONS },
      { $project: { _id: 0, condition: '$_id', count: 1 } },
    ]),

    Doctor.aggregate<{ specialization: string; count: number }>([
      { $group: { _id: '$specialization', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: TOP_SPECIALIZATIONS },
      { $project: { _id: 0, specialization: '$_id', count: 1 } },
    ]),

    Patient.find()
      .select('name age gender condition doctorId createdAt')
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1, _id: -1 })
      .limit(5)
      .lean(),
  ]);

  // Fold everything beyond the top conditions into one slice so the chart adds up to the total.
  const shownConditions = conditionRows.reduce((sum, row) => sum + row.count, 0);
  const remainder = totalPatients - shownConditions;
  const conditionBreakdown =
    remainder > 0
      ? [...conditionRows, { condition: 'Other conditions', count: remainder }]
      : conditionRows;

  const averagePatientsPerDoctor =
    totalDoctors > 0 ? Number((totalPatients / totalDoctors).toFixed(2)) : 0;

  return {
    overview: {
      totalDoctors,
      totalPatients,
      averagePatientsPerDoctor,
      newDoctorsThisMonth,
      newPatientsThisMonth,
      previousMonthPatients,
    },
    patientsPerDoctor,
    monthlyRegistrations: fillMonthlySeries(monthlyRows, now, MONTHS_SHOWN),
    dailyRegistrations: fillDailySeries(dailyRows, now, DAYS_SHOWN),
    conditionBreakdown,
    specializationBreakdown,
    recentPatients,
  };
}
