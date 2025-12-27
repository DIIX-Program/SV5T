// ============================================
// Evaluation & Recommendation Service
// Features:
// - Calculate readiness score
// - JSONB caching for recommendations
// - Invalidate cache on evidence change
// - Optimize for serverless
// ============================================

import { prisma } from '../lib/prisma';
import { getEvidenceByStudent, getEvidenceByCategory } from './evidenceService';

// ============================================
// TYPES
// ============================================

export interface CategoryResult {
  isHardPassed: boolean;
  isAlmostPassed: boolean;
  hardFails: string[];
  softBonus: number;
  tips: string[];
}

export interface EvaluationPayload {
  ethics: CategoryResult;
  study: CategoryResult;
  physical: CategoryResult;
  volunteer: CategoryResult;
  integration: CategoryResult;
}

// ============================================
// EVALUATION LOGIC
// ============================================

/**
 * Calculate readiness score based on criteria
 * Scores are stored in JSONB for caching
 */
export async function calculateReadiness(
  studentId: string,
  criteria: any // From frontend submission
): Promise<{
  overallStatus: 'ELIGIBLE' | 'ALMOST_READY' | 'NOT_ELIGIBLE';
  readinessScore: number;
  categoryResults: EvaluationPayload;
}> {
  // Get approved evidence
  const [ethicsEvidence, studyEvidence, physicalEvidence, volunteerEvidence, integrationEvidence] =
    await Promise.all([
      getEvidenceByCategory(studentId, 'ethics'),
      getEvidenceByCategory(studentId, 'study'),
      getEvidenceByCategory(studentId, 'physical'),
      getEvidenceByCategory(studentId, 'volunteer'),
      getEvidenceByCategory(studentId, 'integration'),
    ]);

  // Calculate each category
  const ethicsResult = evaluateEthics(criteria, ethicsEvidence);
  const studyResult = evaluateStudy(criteria, studyEvidence);
  const physicalResult = evaluatePhysical(criteria, physicalEvidence);
  const volunteerResult = evaluateVolunteer(criteria, volunteerEvidence);
  const integrationResult = evaluateIntegration(criteria, integrationEvidence);

  // Calculate overall score
  const baseScore = ethicsResult.isHardPassed ? 70 : 0;
  const softBonus =
    ethicsResult.softBonus +
    studyResult.softBonus +
    volunteerResult.softBonus +
    integrationResult.softBonus;

  const readinessScore = Math.min(baseScore + softBonus, 100);

  // Determine overall status
  let overallStatus: 'ELIGIBLE' | 'ALMOST_READY' | 'NOT_ELIGIBLE';
  if (readinessScore >= 100) {
    overallStatus = 'ELIGIBLE';
  } else if (readinessScore >= 70) {
    overallStatus = 'ALMOST_READY';
  } else {
    overallStatus = 'NOT_ELIGIBLE';
  }

  return {
    overallStatus,
    readinessScore: Math.round(readinessScore * 100) / 100,
    categoryResults: {
      ethics: ethicsResult,
      study: studyResult,
      physical: physicalResult,
      volunteer: volunteerResult,
      integration: integrationResult,
    },
  };
}

/**
 * Save evaluation result to database
 */
export async function saveEvaluation(
  studentId: string,
  evaluation: {
    overallStatus: 'ELIGIBLE' | 'ALMOST_READY' | 'NOT_ELIGIBLE';
    readinessScore: number;
    categoryResults: EvaluationPayload;
  }
) {
  const existingResult = await prisma.evaluationResult.findUnique({
    where: { studentId },
  });

  if (existingResult) {
    return prisma.evaluationResult.update({
      where: { studentId },
      data: {
        overallStatus: evaluation.overallStatus,
        readinessScore: evaluation.readinessScore,
        categoryResults: evaluation.categoryResults as any,
        lastEvaluatedAt: new Date(),
        evaluationVersion: existingResult.evaluationVersion + 1,
      },
    });
  } else {
    return prisma.evaluationResult.create({
      data: {
        studentId,
        overallStatus: evaluation.overallStatus,
        readinessScore: evaluation.readinessScore,
        categoryResults: evaluation.categoryResults as any,
        lastEvaluatedAt: new Date(),
        evaluationVersion: 1,
      },
    });
  }
}

/**
 * Get evaluation result
 */
export async function getEvaluation(studentId: string) {
  return prisma.evaluationResult.findUnique({
    where: { studentId },
  });
}

// ============================================
// CATEGORY EVALUATION FUNCTIONS
// ============================================

function evaluateEthics(criteria: any, evidence: any[]): CategoryResult {
  const isTrainingOk = criteria.trainingPoints >= 90;
  const isNoDiscipline = criteria.noDiscipline === true;
  const isMarxistMember = criteria.marxistMember === true;
  const isExemplaryYouth = criteria.exemplaryYouth === true;

  const isHardPassed = isTrainingOk && isNoDiscipline;
  const isAlmostPassed = isTrainingOk && !isNoDiscipline;

  let softBonus = 0;
  if (isMarxistMember) softBonus += 3;
  if (isExemplaryYouth) softBonus += 3;
  if (evidence.length > 0) softBonus += Math.min(evidence.length, 6);

  return {
    isHardPassed,
    isAlmostPassed,
    hardFails: isHardPassed ? [] : ['Điểm rèn luyện < 90 hoặc có vi phạm'],
    softBonus: Math.min(softBonus, 6),
    tips: [
      'Tích lũy điểm rèn luyện từ 90 điểm trở lên',
      'Không có vi phạm kỷ luật',
      'Tham gia các hoạt động tình nguyện',
    ],
  };
}

function evaluateStudy(criteria: any, evidence: any[]): CategoryResult {
  const gpaMin = criteria.studentType === 'UNIVERSITY' ? 3.4 : 3.2;
  const isGpaOk = criteria.gpa >= gpaMin;
  const hasResearch =
    criteria.scientificResearch ||
    criteria.journalArticle ||
    criteria.conferencePaper ||
    criteria.invention;

  const isHardPassed = isGpaOk;
  const isAlmostPassed = !isGpaOk && criteria.gpa >= gpaMin - 0.3;

  let softBonus = 0;
  if (criteria.academicTeamMember) softBonus += 1;
  if (criteria.academicCompetitionAward) softBonus += 2;
  if (hasResearch) softBonus += 2;
  if (evidence.length > 0) softBonus += Math.min(evidence.length, 6);

  return {
    isHardPassed,
    isAlmostPassed,
    hardFails: isHardPassed ? [] : [`GPA ${criteria.gpa} < ${gpaMin}`],
    softBonus: Math.min(softBonus, 6),
    tips: [
      `Nâng GPA lên ≥ ${gpaMin}`,
      'Tham gia các cuộc thi học thuật',
      'Công bố bài báo hoặc nghiên cứu',
    ],
  };
}

function evaluatePhysical(criteria: any, evidence: any[]): CategoryResult {
  const isHealthyStudent = criteria.isHealthyStudent === true;
  const hasSportAward = criteria.sportAward === true;

  const isHardPassed = isHealthyStudent;
  const isAlmostPassed = false; // No soft criteria

  let softBonus = 0;
  if (hasSportAward) softBonus += 6;

  return {
    isHardPassed,
    isAlmostPassed,
    hardFails: isHardPassed ? [] : ['Không đạt tiêu chuẩn sức khỏe'],
    softBonus: softBonus,
    tips: [
      'Kiểm tra sức khỏe và đạt tiêu chuẩn',
      'Tham gia các hoạt động thể dục',
      'Tham gia giải thể thao',
    ],
  };
}

function evaluateVolunteer(criteria: any, evidence: any[]): CategoryResult {
  const isVolunteerOk = criteria.volunteerDays >= 5;
  const hasVolunteerAward = criteria.volunteerAward === true;
  const isVolunteerLeader = criteria.volunteerLeader === true;

  const isHardPassed = isVolunteerOk;
  const isAlmostPassed = !isVolunteerOk && criteria.volunteerDays >= 2;

  let softBonus = 0;
  if (hasVolunteerAward) softBonus += 2;
  if (isVolunteerLeader) softBonus += 4;
  if (evidence.length > 0) softBonus += Math.min(evidence.length, 6);

  return {
    isHardPassed,
    isAlmostPassed,
    hardFails: isHardPassed ? [] : [`Ngày tình nguyện: ${criteria.volunteerDays}/5`],
    softBonus: Math.min(softBonus, 6),
    tips: [
      'Tham gia tối thiểu 5 ngày tình nguyện',
      'Tham gia các hoạt động cộng đồng',
      'Trở thành lãnh đạo tình nguyện',
    ],
  };
}

function evaluateIntegration(criteria: any, evidence: any[]): CategoryResult {
  const hasSkillCourse = criteria.skillCourseOrUnionAward === true;
  const hasIntegration = criteria.integrationActivity === true;
  const hasLanguage = criteria.englishB1OrGpa === true;
  const hasInternational =
    criteria.internationalExchange === true || criteria.foreignLanguageCompetition === true;

  const hardReqs = [hasSkillCourse, hasIntegration, hasLanguage].filter(Boolean).length;
  const isHardPassed = hardReqs >= 2;
  const isAlmostPassed = hardReqs >= 1;

  let softBonus = 0;
  if (hasInternational) softBonus += 6;
  if (evidence.length > 0) softBonus += Math.min(evidence.length, 6);

  return {
    isHardPassed,
    isAlmostPassed,
    hardFails: isHardPassed ? [] : ['Không đủ 2 trong 3 tiêu chí cứng'],
    softBonus: Math.min(softBonus, 6),
    tips: [
      'Hoàn thành khóa học kỹ năng',
      'Tham gia các hoạt động hội nhập',
      'Đạt B1 tiếng Anh',
      'Tham gia trao đổi quốc tế',
    ],
  };
}

// ============================================
// RECOMMENDATION CACHING
// ============================================

/**
 * Mark recommendation as stale (cache invalid)
 * Call when evidence changes
 */
export async function invalidateRecommendation(studentId: string) {
  const existing = await prisma.recommendation.findUnique({
    where: { studentId },
  });

  if (existing) {
    await prisma.recommendation.update({
      where: { studentId },
      data: { isStale: true },
    });
  }
}

/**
 * Save recommendation with cache expiration
 * Cache expires in 7 days unless evidence changes
 */
export async function saveRecommendation(
  studentId: string,
  recommendations: any
) {
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 7); // 7 days cache

  const existing = await prisma.recommendation.findUnique({
    where: { studentId },
  });

  if (existing) {
    return prisma.recommendation.update({
      where: { studentId },
      data: {
        recommendations: recommendations as any,
        generatedAt: new Date(),
        validUntil,
        isStale: false,
      },
    });
  } else {
    return prisma.recommendation.create({
      data: {
        studentId,
        recommendations: recommendations as any,
        generatedAt: new Date(),
        validUntil,
        isStale: false,
      },
    });
  }
}

/**
 * Get recommendation (check cache validity)
 */
export async function getRecommendation(studentId: string) {
  const rec = await prisma.recommendation.findUnique({
    where: { studentId },
  });

  if (!rec) return null;

  // Check if cache is expired or stale
  const isExpired = new Date() > rec.validUntil;
  const isStale = rec.isStale;

  return {
    ...rec,
    isCacheValid: !isExpired && !isStale,
  };
}
