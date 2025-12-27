// ============================================
// Student Profile Service - Prisma Optimized
// Features:
// - Get profile by user
// - Update profile
// - Get by faculty with pagination
// - Statistics aggregation
// ============================================

import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

// ============================================
// TYPES
// ============================================

export interface StudentProfileInput {
  fullName: string;
  className: string;
  faculty: string;
  studentType: 'UNIVERSITY' | 'COLLEGE';
  academicYear: number;
  gpa: number;
  trainingPoints: number;
  phone?: string;
}

// ============================================
// QUERIES
// ============================================

/**
 * Get student profile by user ID
 * OPTIMIZED: Selective fields, no N+1
 */
export async function getStudentProfile(userId: string) {
  return prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      evaluationResult: {
        select: {
          overallStatus: true,
          readinessScore: true,
          lastEvaluatedAt: true,
        },
      },
      recommendation: {
        select: {
          generatedAt: true,
          isStale: true,
        },
      },
    },
  });
}

/**
 * Get student with evaluation details
 */
export async function getStudentWithEvaluation(userId: string) {
  return prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      evaluationResult: true,
      recommendation: true,
    },
  });
}

/**
 * Get students by faculty with pagination
 * CRITICAL INDEX: StudentProfile(faculty)
 */
export async function getStudentsByFaculty(
  faculty: string,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;

  const [students, total] = await Promise.all([
    prisma.studentProfile.findMany({
      where: { faculty },
      select: {
        id: true,
        fullName: true,
        className: true,
        faculty: true,
        studentType: true,
        gpa: true,
        evaluationResult: {
          select: {
            overallStatus: true,
            readinessScore: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.studentProfile.count({
      where: { faculty },
    }),
  ]);

  return {
    data: students,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get all students for admin (with pagination)
 * CRITICAL: Avoid SELECT *
 */
export async function getAllStudents(
  page: number = 1,
  limit: number = 20,
  filters?: {
    faculty?: string;
    studentType?: 'UNIVERSITY' | 'COLLEGE';
    overallStatus?: string;
  }
) {
  const skip = (page - 1) * limit;

  const where: Prisma.StudentProfileWhereInput = {};
  if (filters?.faculty) where.faculty = filters.faculty;
  if (filters?.studentType) where.studentType = filters.studentType;
  if (filters?.overallStatus) {
    where.evaluationResult = {
      overallStatus: filters.overallStatus as any,
    };
  }

  const [students, total] = await Promise.all([
    prisma.studentProfile.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        className: true,
        faculty: true,
        studentType: true,
        academicYear: true,
        gpa: true,
        trainingPoints: true,
        evaluationResult: {
          select: {
            overallStatus: true,
            readinessScore: true,
            lastEvaluatedAt: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.studentProfile.count({ where }),
  ]);

  return {
    data: students,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Update student profile
 */
export async function updateStudentProfile(
  userId: string,
  data: Partial<StudentProfileInput>
) {
  return prisma.studentProfile.update({
    where: { userId },
    data: {
      ...(data.fullName && { fullName: data.fullName }),
      ...(data.className && { className: data.className }),
      ...(data.faculty && { faculty: data.faculty }),
      ...(data.studentType && { studentType: data.studentType }),
      ...(data.academicYear && { academicYear: data.academicYear }),
      ...(data.gpa !== undefined && { gpa: data.gpa }),
      ...(data.trainingPoints !== undefined && { trainingPoints: data.trainingPoints }),
      ...(data.phone !== undefined && { phone: data.phone }),
    },
  });
}

// ============================================
// STATISTICS
// ============================================

/**
 * Get statistics by faculty
 */
export async function getStatisticsByFaculty(faculty: string) {
  const students = await prisma.studentProfile.findMany({
    where: { faculty },
    select: {
      gpa: true,
      trainingPoints: true,
      evaluationResult: {
        select: {
          overallStatus: true,
          readinessScore: true,
        },
      },
    },
  });

  if (students.length === 0) {
    return {
      faculty,
      totalStudents: 0,
      averageGpa: 0,
      averageTrainingPoints: 0,
      avgReadinessScore: 0,
      eligibleCount: 0,
      almostReadyCount: 0,
      notEligibleCount: 0,
    };
  }

  const totalGpa = students.reduce((sum, s) => sum + s.gpa, 0);
  const totalTraining = students.reduce((sum, s) => sum + s.trainingPoints, 0);

  const evaluations = students.filter(s => s.evaluationResult);
  const totalReadiness = evaluations.reduce((sum, s) => sum + (s.evaluationResult?.readinessScore || 0), 0);

  const eligible = students.filter(s => s.evaluationResult?.overallStatus === 'ELIGIBLE').length;
  const almostReady = students.filter(s => s.evaluationResult?.overallStatus === 'ALMOST_READY').length;
  const notEligible = students.filter(s => s.evaluationResult?.overallStatus === 'NOT_ELIGIBLE').length;

  return {
    faculty,
    totalStudents: students.length,
    averageGpa: parseFloat((totalGpa / students.length).toFixed(2)),
    averageTrainingPoints: Math.round(totalTraining / students.length),
    avgReadinessScore: evaluations.length > 0 
      ? parseFloat((totalReadiness / evaluations.length).toFixed(2))
      : 0,
    eligibleCount: eligible,
    almostReadyCount: almostReady,
    notEligibleCount: notEligible,
  };
}

/**
 * Get all faculties
 */
export async function getAllFaculties() {
  const faculties = await prisma.studentProfile.findMany({
    select: { faculty: true },
    distinct: ['faculty'],
    orderBy: { faculty: 'asc' },
  });

  return faculties.map(f => f.faculty);
}
