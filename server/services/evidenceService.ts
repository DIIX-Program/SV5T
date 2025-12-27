// ============================================
// Evidence Service - Prisma Optimized
// Features:
// - Submit evidence with file URL
// - Get evidence by student & category
// - Approve/reject evidence
// - List pending for admin
// ============================================

import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

// ============================================
// TYPES
// ============================================

export interface EvidenceSubmitInput {
  category: string;
  title: string;
  description?: string;
  fileUrl?: string;
  fileName?: string;
  achievementDate: string; // ISO date
}

// ============================================
// QUERIES
// ============================================

/**
 * Submit evidence for student
 * File should be uploaded to S3/Supabase Storage FIRST
 * Only URL is stored here
 */
export async function submitEvidence(
  studentId: string,
  input: EvidenceSubmitInput
) {
  return prisma.evidenceSubmission.create({
    data: {
      studentId,
      category: input.category.toLowerCase(),
      title: input.title,
      description: input.description,
      fileUrl: input.fileUrl,
      fileName: input.fileName,
      achievementDate: new Date(input.achievementDate),
      status: 'PENDING',
      submittedAt: new Date(),
    },
  });
}

/**
 * Get evidence by student (all, approved, or pending)
 * CRITICAL INDEX: EvidenceSubmission(studentId, category, status)
 */
export async function getEvidenceByStudent(
  studentId: string,
  status?: 'PENDING' | 'APPROVED' | 'REJECTED'
) {
  return prisma.evidenceSubmission.findMany({
    where: {
      studentId,
      ...(status && { status }),
    },
    select: {
      id: true,
      category: true,
      title: true,
      description: true,
      fileUrl: true,
      achievementDate: true,
      status: true,
      adminNotes: true,
      submittedAt: true,
      approvedAt: true,
    },
    orderBy: { achievementDate: 'desc' },
  });
}

/**
 * Get evidence by category for student
 * Used for evaluation calculation
 */
export async function getEvidenceByCategory(
  studentId: string,
  category: string
) {
  return prisma.evidenceSubmission.findMany({
    where: {
      studentId,
      category: category.toLowerCase(),
      status: 'APPROVED',
    },
    select: {
      id: true,
      title: true,
      achievementDate: true,
    },
    orderBy: { achievementDate: 'desc' },
  });
}

/**
 * Get all pending evidence for admin approval
 * CRITICAL INDEX: EvidenceSubmission(status)
 */
export async function getPendingEvidence(
  page: number = 1,
  limit: number = 20,
  category?: string
) {
  const skip = (page - 1) * limit;

  const where: Prisma.EvidenceSubmissionWhereInput = {
    status: 'PENDING',
    ...(category && { category: category.toLowerCase() }),
  };

  const [evidence, total] = await Promise.all([
    prisma.evidenceSubmission.findMany({
      where,
      select: {
        id: true,
        studentId: true,
        student: {
          select: {
            fullName: true,
            className: true,
            faculty: true,
          },
        },
        category: true,
        title: true,
        description: true,
        fileUrl: true,
        achievementDate: true,
        submittedAt: true,
      },
      skip,
      take: limit,
      orderBy: { submittedAt: 'asc' },
    }),
    prisma.evidenceSubmission.count({ where }),
  ]);

  return {
    data: evidence,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get evidence detail for admin
 */
export async function getEvidenceDetail(evidenceId: string) {
  return prisma.evidenceSubmission.findUnique({
    where: { id: evidenceId },
    include: {
      student: {
        select: {
          id: true,
          fullName: true,
          className: true,
          faculty: true,
        },
      },
    },
  });
}

// ============================================
// ADMIN ACTIONS
// ============================================

/**
 * Approve evidence
 */
export async function approveEvidence(
  evidenceId: string,
  notes?: string
) {
  return prisma.evidenceSubmission.update({
    where: { id: evidenceId },
    data: {
      status: 'APPROVED',
      adminNotes: notes,
      approvedAt: new Date(),
    },
  });
}

/**
 * Reject evidence
 */
export async function rejectEvidence(
  evidenceId: string,
  notes: string
) {
  return prisma.evidenceSubmission.update({
    where: { id: evidenceId },
    data: {
      status: 'REJECTED',
      adminNotes: notes,
    },
  });
}

/**
 * Delete evidence (only if PENDING or by admin)
 */
export async function deleteEvidence(evidenceId: string) {
  return prisma.evidenceSubmission.delete({
    where: { id: evidenceId },
  });
}

// ============================================
// STATISTICS
// ============================================

/**
 * Get evidence statistics for student
 */
export async function getEvidenceStats(studentId: string) {
  const evidence = await prisma.evidenceSubmission.findMany({
    where: { studentId },
    select: { status: true },
  });

  return {
    total: evidence.length,
    approved: evidence.filter(e => e.status === 'APPROVED').length,
    pending: evidence.filter(e => e.status === 'PENDING').length,
    rejected: evidence.filter(e => e.status === 'REJECTED').length,
  };
}

/**
 * Get evidence statistics by category for student
 */
export async function getEvidenceStatsByCategory(studentId: string) {
  const evidence = await prisma.evidenceSubmission.findMany({
    where: { studentId },
    select: {
      category: true,
      status: true,
    },
  });

  const categories = new Set(evidence.map(e => e.category));
  const stats: Record<string, { approved: number; pending: number; rejected: number }> = {};

  categories.forEach(cat => {
    const catEvidence = evidence.filter(e => e.category === cat);
    stats[cat] = {
      approved: catEvidence.filter(e => e.status === 'APPROVED').length,
      pending: catEvidence.filter(e => e.status === 'PENDING').length,
      rejected: catEvidence.filter(e => e.status === 'REJECTED').length,
    };
  });

  return stats;
}
