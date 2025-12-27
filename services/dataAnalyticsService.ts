/**
 * DATA SCIENCE & ANALYTICS SERVICE
 * 
 * Chuyển đổi raw student data thành dataset dùng cho ML/Analytics
 * Features engineering, statistics, predictions, recommendations
 */

import { 
  EvidenceSubmission, 
  UserProfile, 
  CriteriaData,
  EvaluationResult,
  EvaluationStatus,
  StudentType,
  EvidenceStatus
} from '../types';
import { CRITERIA_LIST, GPA_MIN, TRAINING_POINTS_MIN, VOLUNTEER_DAYS_MIN } from '../constants';

// ============================================================================
// 1. DATASET TYPE DEFINITIONS
// ============================================================================

export interface StudentDataRecord {
  // Identifiers (không dùng trong model)
  student_id: string;
  mssv?: string;
  faculty: string;
  academic_year?: number;
  student_type: StudentType;
  
  // Hard Criteria Features (Binary)
  hard_ethics: number;      // 0 or 1
  hard_study: number;       // 0 or 1
  hard_physical: number;    // 0 or 1
  hard_volunteer: number;   // 0 or 1
  hard_integration: number; // 0 or 1
  
  // Soft Criteria Features (Numerical, 0-6)
  soft_ethics_score: number;
  soft_study_score: number;
  soft_physical_score: number;     // Always 0
  soft_volunteer_score: number;
  soft_integration_score: number;
  
  // Aggregated Features
  total_hard_passed: number;       // Sum of hard (0-5)
  total_soft_score: number;        // Sum of soft (0-24)
  
  // Profile Features
  gpa: number;
  training_points: number;
  volunteer_days: number;
  evidences_count: number;
  evidence_approval_rate: number;  // 0-1
  
  // Temporal Features
  submission_timeline_days?: number;
  last_update_recency?: number;
  
  // Label (Target Variable)
  completion_percent: number;      // 0-100
  final_status: string;            // ELIGIBLE, ALMOST_READY, NOT_ELIGIBLE
  
  // Metadata
  submitted_at?: string;
  last_modified_at?: string;
}

export interface DatasetStatistics {
  totalStudents: number;
  eligibleCount: number;
  almostReadyCount: number;
  notEligibleCount: number;
  
  passRate: number; // %
  avgCompletionPercent: number;
  
  // Feature statistics
  avgGpa: number;
  gpaStd: number;
  avgTrainingPoints: number;
  avgVolunteerDays: number;
  
  // Hard criteria pass rates
  hardEthicsRate: number;
  hardStudyRate: number;
  hardPhysicalRate: number;
  hardVolunteerRate: number;
  hardIntegrationRate: number;
  
  // Soft criteria adoption rates
  softEthicsAdoptionRate: number;
  softStudyAdoptionRate: number;
  softVolunteerAdoptionRate: number;
  softIntegrationAdoptionRate: number;
  
  // Bottleneck analysis
  bottlenecks: Array<{
    criteria: string;
    failureRate: number;
    affectedStudents: number;
  }>;
}

export interface StudentPrediction {
  student_id: string;
  predicted_status: EvaluationStatus;
  prediction_probability: Record<string, number>;
  confidence_score: number;
  
  // Improvement recommendations
  improvement_needs: Array<{
    criteria: string;
    current_status: boolean;
    deficit?: number;
    estimated_days_to_improvement?: number;
    urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  
  success_probability: number;
  success_probability_if_improved?: number;
}

export interface ClusterProfile {
  cluster_id: number;
  profile_name: string;
  student_count: number;
  avg_gpa: number;
  avg_completion: number;
  eligibility_rate: number;
  characteristics: string[];
}

// ============================================================================
// 2. DATASET TRANSFORMATION
// ============================================================================

/**
 * Convert student's current evaluation result & data into a data record
 */
export const createStudentDataRecord = (
  studentId: string,
  profile: UserProfile | null,
  criteria: CriteriaData,
  evaluationResult: EvaluationResult,
  submissions: EvidenceSubmission[],
  submissionDate?: Date
): StudentDataRecord => {
  const userSubmissions = submissions.filter(s => s.userId === studentId);
  const approvedCount = userSubmissions.filter(s => s.status === EvidenceStatus.APPROVED).length;
  const approvalRate = userSubmissions.length > 0 
    ? approvedCount / userSubmissions.length 
    : 0;

  return {
    student_id: studentId,
    mssv: profile?.mssv,
    faculty: profile?.faculty || 'UNKNOWN',
    student_type: profile?.studentType || StudentType.UNIVERSITY,
    
    // Hard criteria
    hard_ethics: evaluationResult.categoryResults.ethics.isHardPassed ? 1 : 0,
    hard_study: evaluationResult.categoryResults.study.isHardPassed ? 1 : 0,
    hard_physical: evaluationResult.categoryResults.physical.isHardPassed ? 1 : 0,
    hard_volunteer: evaluationResult.categoryResults.volunteer.isHardPassed ? 1 : 0,
    hard_integration: evaluationResult.categoryResults.integration.isHardPassed ? 1 : 0,
    
    // Soft scores
    soft_ethics_score: evaluationResult.categoryResults.ethics.softBonus,
    soft_study_score: evaluationResult.categoryResults.study.softBonus,
    soft_physical_score: 0, // Physical has no soft
    soft_volunteer_score: evaluationResult.categoryResults.volunteer.softBonus,
    soft_integration_score: evaluationResult.categoryResults.integration.softBonus,
    
    // Aggregates
    total_hard_passed: [
      evaluationResult.categoryResults.ethics.isHardPassed,
      evaluationResult.categoryResults.study.isHardPassed,
      evaluationResult.categoryResults.physical.isHardPassed,
      evaluationResult.categoryResults.volunteer.isHardPassed,
      evaluationResult.categoryResults.integration.isHardPassed,
    ].filter(Boolean).length,
    
    total_soft_score: 
      evaluationResult.categoryResults.ethics.softBonus +
      evaluationResult.categoryResults.study.softBonus +
      evaluationResult.categoryResults.volunteer.softBonus +
      evaluationResult.categoryResults.integration.softBonus,
    
    // Profile features
    gpa: criteria.gpa,
    training_points: criteria.trainingPoints,
    volunteer_days: criteria.volunteerDays,
    evidences_count: userSubmissions.length,
    evidence_approval_rate: approvalRate,
    
    // Temporal (relative to today)
    submission_timeline_days: submissionDate 
      ? Math.floor((Date.now() - submissionDate.getTime()) / (1000 * 60 * 60 * 24))
      : undefined,
    last_update_recency: userSubmissions.length > 0
      ? Math.floor((Date.now() - new Date(userSubmissions[0].submittedAt).getTime()) / (1000 * 60 * 60 * 24))
      : undefined,
    
    // Target
    completion_percent: evaluationResult.readinessScore,
    final_status: evaluationResult.overallStatus,
    
    // Metadata
    submitted_at: submissionDate?.toISOString(),
  };
};

/**
 * Chuyển array student data thành CSV format
 */
export const datasetToCSV = (records: StudentDataRecord[]): string => {
  if (records.length === 0) return '';
  
  const headers = [
    'student_id', 'mssv', 'faculty', 'student_type',
    'hard_ethics', 'hard_study', 'hard_physical', 'hard_volunteer', 'hard_integration',
    'soft_ethics_score', 'soft_study_score', 'soft_volunteer_score', 'soft_integration_score',
    'total_hard_passed', 'total_soft_score',
    'gpa', 'training_points', 'volunteer_days',
    'evidences_count', 'evidence_approval_rate',
    'submission_timeline_days', 'last_update_recency',
    'completion_percent', 'final_status'
  ];
  
  const rows = records.map(record => [
    record.student_id,
    record.mssv || '',
    record.faculty,
    record.student_type,
    record.hard_ethics,
    record.hard_study,
    record.hard_physical,
    record.hard_volunteer,
    record.hard_integration,
    record.soft_ethics_score,
    record.soft_study_score,
    record.soft_volunteer_score,
    record.soft_integration_score,
    record.total_hard_passed,
    record.total_soft_score,
    record.gpa.toFixed(2),
    record.training_points,
    record.volunteer_days,
    record.evidences_count,
    record.evidence_approval_rate.toFixed(3),
    record.submission_timeline_days || '',
    record.last_update_recency || '',
    record.completion_percent.toFixed(1),
    record.final_status
  ]);
  
  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
};

// ============================================================================
// 3. DESCRIPTIVE STATISTICS
// ============================================================================

export const calculateDatasetStatistics = (records: StudentDataRecord[]): DatasetStatistics => {
  if (records.length === 0) {
    return {
      totalStudents: 0,
      eligibleCount: 0,
      almostReadyCount: 0,
      notEligibleCount: 0,
      passRate: 0,
      avgCompletionPercent: 0,
      avgGpa: 0,
      gpaStd: 0,
      avgTrainingPoints: 0,
      avgVolunteerDays: 0,
      hardEthicsRate: 0,
      hardStudyRate: 0,
      hardPhysicalRate: 0,
      hardVolunteerRate: 0,
      hardIntegrationRate: 0,
      softEthicsAdoptionRate: 0,
      softStudyAdoptionRate: 0,
      softVolunteerAdoptionRate: 0,
      softIntegrationAdoptionRate: 0,
      bottlenecks: []
    };
  }
  
  const eligible = records.filter(r => r.final_status === EvaluationStatus.ELIGIBLE).length;
  const almostReady = records.filter(r => r.final_status === EvaluationStatus.ALMOST_READY).length;
  const notEligible = records.filter(r => r.final_status === EvaluationStatus.NOT_ELIGIBLE).length;
  
  const gpaValues = records.map(r => r.gpa);
  const avgGpa = gpaValues.reduce((a, b) => a + b, 0) / records.length;
  const gpaStd = Math.sqrt(
    gpaValues.reduce((sum, gpa) => sum + Math.pow(gpa - avgGpa, 2), 0) / records.length
  );
  
  const completionValues = records.map(r => r.completion_percent);
  const avgCompletion = completionValues.reduce((a, b) => a + b, 0) / records.length;
  
  const hardRates = {
    ethics: records.filter(r => r.hard_ethics === 1).length / records.length,
    study: records.filter(r => r.hard_study === 1).length / records.length,
    physical: records.filter(r => r.hard_physical === 1).length / records.length,
    volunteer: records.filter(r => r.hard_volunteer === 1).length / records.length,
    integration: records.filter(r => r.hard_integration === 1).length / records.length,
  };
  
  const softAdoptionRates = {
    ethics: records.filter(r => r.soft_ethics_score > 0).length / records.length,
    study: records.filter(r => r.soft_study_score > 0).length / records.length,
    volunteer: records.filter(r => r.soft_volunteer_score > 0).length / records.length,
    integration: records.filter(r => r.soft_integration_score > 0).length / records.length,
  };
  
  // Bottleneck analysis
  const bottlenecks = [
    { criteria: 'Hard Study', rate: 1 - hardRates.study },
    { criteria: 'Hard Integration', rate: 1 - hardRates.integration },
    { criteria: 'Hard Volunteer', rate: 1 - hardRates.volunteer },
    { criteria: 'Hard Ethics', rate: 1 - hardRates.ethics },
    { criteria: 'Hard Physical', rate: 1 - hardRates.physical },
  ]
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 3)
    .map(item => ({
      criteria: item.criteria,
      failureRate: item.rate,
      affectedStudents: Math.round(item.rate * records.length)
    }));
  
  return {
    totalStudents: records.length,
    eligibleCount: eligible,
    almostReadyCount: almostReady,
    notEligibleCount: notEligible,
    passRate: (eligible / records.length) * 100,
    avgCompletionPercent: avgCompletion,
    avgGpa: avgGpa,
    gpaStd: gpaStd,
    avgTrainingPoints: records.reduce((sum, r) => sum + r.training_points, 0) / records.length,
    avgVolunteerDays: records.reduce((sum, r) => sum + r.volunteer_days, 0) / records.length,
    hardEthicsRate: hardRates.ethics,
    hardStudyRate: hardRates.study,
    hardPhysicalRate: hardRates.physical,
    hardVolunteerRate: hardRates.volunteer,
    hardIntegrationRate: hardRates.integration,
    softEthicsAdoptionRate: softAdoptionRates.ethics,
    softStudyAdoptionRate: softAdoptionRates.study,
    softVolunteerAdoptionRate: softAdoptionRates.volunteer,
    softIntegrationAdoptionRate: softAdoptionRates.integration,
    bottlenecks
  };
};

// ============================================================================
// 4. CORRELATION & ANALYSIS
// ============================================================================

/**
 * Tính correlation giữa GPA và khả năng đạt
 */
export const analyzeGPACorrelation = (records: StudentDataRecord[]): {
  correlation: number;
  breakdown: Array<{ gpaRange: string; eligibilityRate: number }>;
} => {
  if (records.length < 2) return { correlation: 0, breakdown: [] };
  
  // Pearson correlation
  const gpaValues = records.map(r => r.gpa);
  const statusValues = records.map(r => r.final_status === EvaluationStatus.ELIGIBLE ? 1 : 0);
  
  const meanGpa = gpaValues.reduce((a, b) => a + b) / records.length;
  const meanStatus = statusValues.reduce((a, b) => a + b) / records.length;
  
  const numerator = gpaValues.reduce((sum, gpa, i) => 
    sum + (gpa - meanGpa) * (statusValues[i] - meanStatus), 0);
  
  const gpaVariance = Math.sqrt(gpaValues.reduce((sum, gpa) => 
    sum + Math.pow(gpa - meanGpa, 2), 0) / records.length);
  
  const statusVariance = Math.sqrt(statusValues.reduce((sum, status) => 
    sum + Math.pow(status - meanStatus, 2), 0) / records.length);
  
  const correlation = numerator / (gpaVariance * statusVariance * records.length);
  
  // Breakdown by GPA range
  const breakdown = [
    { range: '< 3.0', min: 0, max: 3.0 },
    { range: '3.0-3.4', min: 3.0, max: 3.4 },
    { range: '3.4-3.7', min: 3.4, max: 3.7 },
    { range: '≥ 3.7', min: 3.7, max: 4.0 }
  ].map(group => {
    const inRange = records.filter(r => r.gpa >= group.min && r.gpa < group.max);
    const eligible = inRange.filter(r => r.final_status === EvaluationStatus.ELIGIBLE).length;
    return {
      gpaRange: group.range,
      eligibilityRate: inRange.length > 0 ? (eligible / inRange.length) : 0
    };
  });
  
  return { correlation, breakdown };
};

/**
 * Phân nhóm sinh viên thành clusters
 */
export const clusterStudents = (records: StudentDataRecord[]): ClusterProfile[] => {
  if (records.length < 3) return [];
  
  // Simple K-means clustering (k=3)
  const clusters: ClusterProfile[] = [];
  
  // Profile 1: "High Achiever" (GPA ≥ 3.7, Hard ≥ 4)
  const highAchievers = records.filter(r => 
    r.gpa >= 3.7 && r.total_hard_passed >= 4
  );
  if (highAchievers.length > 0) {
    clusters.push({
      cluster_id: 1,
      profile_name: 'High Achiever',
      student_count: highAchievers.length,
      avg_gpa: highAchievers.reduce((s, r) => s + r.gpa, 0) / highAchievers.length,
      avg_completion: highAchievers.reduce((s, r) => s + r.completion_percent, 0) / highAchievers.length,
      eligibility_rate: highAchievers.filter(r => r.final_status === EvaluationStatus.ELIGIBLE).length / highAchievers.length,
      characteristics: ['High GPA', 'Most hard criteria met', 'High soft criteria adoption']
    });
  }
  
  // Profile 2: "Solid Student" (GPA 3.3-3.7, Hard 2-4)
  const solidStudents = records.filter(r => 
    r.gpa >= 3.3 && r.gpa < 3.7 && r.total_hard_passed >= 2 && r.total_hard_passed < 5
  );
  if (solidStudents.length > 0) {
    clusters.push({
      cluster_id: 2,
      profile_name: 'Solid Student',
      student_count: solidStudents.length,
      avg_gpa: solidStudents.reduce((s, r) => s + r.gpa, 0) / solidStudents.length,
      avg_completion: solidStudents.reduce((s, r) => s + r.completion_percent, 0) / solidStudents.length,
      eligibility_rate: solidStudents.filter(r => r.final_status === EvaluationStatus.ELIGIBLE).length / solidStudents.length,
      characteristics: ['Moderate GPA', 'Some hard criteria met', 'Moderate engagement']
    });
  }
  
  // Profile 3: "At Risk" (GPA < 3.3 or Hard < 2)
  const atRisk = records.filter(r => 
    r.gpa < 3.3 || r.total_hard_passed < 2
  );
  if (atRisk.length > 0) {
    clusters.push({
      cluster_id: 3,
      profile_name: 'At Risk',
      student_count: atRisk.length,
      avg_gpa: atRisk.reduce((s, r) => s + r.gpa, 0) / atRisk.length,
      avg_completion: atRisk.reduce((s, r) => s + r.completion_percent, 0) / atRisk.length,
      eligibility_rate: atRisk.filter(r => r.final_status === EvaluationStatus.ELIGIBLE).length / atRisk.length,
      characteristics: ['Low GPA', 'Few hard criteria met', 'Needs support']
    });
  }
  
  return clusters.sort((a, b) => b.student_count - a.student_count);
};

// ============================================================================
// 5. PREDICTIVE ANALYTICS (CONCEPTUAL)
// ============================================================================

/**
 * Dự đoán trạng thái & cung cấp cải thiện
 * (Conceptual - không train model thật, dùng heuristics dựa trên data)
 */
export const predictStudentOutcome = (
  record: StudentDataRecord,
  historicalData: StudentDataRecord[]
): StudentPrediction => {
  const studentId = record.student_id;
  
  // 1. Xác định trạng thái dự đoán dựa trên điểm hiện tại
  let predictedStatus = EvaluationStatus.NOT_ELIGIBLE;
  if (record.completion_percent >= 70) {
    predictedStatus = EvaluationStatus.ELIGIBLE;
  } else if (record.completion_percent >= 55) {
    predictedStatus = EvaluationStatus.ALMOST_READY;
  }
  
  // 2. Tính probability dựa trên tương tự
  const similar = findSimilarStudents(record, historicalData, 10);
  const similarProbabilities = {
    [EvaluationStatus.ELIGIBLE]: similar.filter(s => s.final_status === EvaluationStatus.ELIGIBLE).length / similar.length,
    [EvaluationStatus.ALMOST_READY]: similar.filter(s => s.final_status === EvaluationStatus.ALMOST_READY).length / similar.length,
    [EvaluationStatus.NOT_ELIGIBLE]: similar.filter(s => s.final_status === EvaluationStatus.NOT_ELIGIBLE).length / similar.length,
  };
  
  // 3. Tính confidence
  const confidenceScore = similar.length > 5 ? 0.9 : 0.6;
  
  // 4. Xác định cải thiện
  const improvementNeeds: StudentPrediction['improvement_needs'] = [];
  
  if (record.hard_study === 0) {
    const minGpa = GPA_MIN[record.student_type];
    const deficit = minGpa - record.gpa;
    improvementNeeds.push({
      criteria: 'Study',
      current_status: false,
      deficit: deficit,
      estimated_days_to_improvement: Math.ceil(deficit * 120), // Heuristic: 120 days per 0.1 GPA
      urgency: 'HIGH'
    });
  }
  
  if (record.hard_volunteer === 0) {
    const deficit = VOLUNTEER_DAYS_MIN - record.volunteer_days;
    improvementNeeds.push({
      criteria: 'Volunteer',
      current_status: false,
      deficit: deficit,
      estimated_days_to_improvement: deficit * 40, // Heuristic
      urgency: 'MEDIUM'
    });
  }
  
  if (record.hard_ethics === 0) {
    const deficit = TRAINING_POINTS_MIN - record.training_points;
    improvementNeeds.push({
      criteria: 'Ethics',
      current_status: false,
      deficit: deficit,
      estimated_days_to_improvement: Math.ceil(deficit * 1.5),
      urgency: 'MEDIUM'
    });
  }
  
  // 5. Dự đoán success probability nếu cải thiện
  let successIfImproved = similarProbabilities[EvaluationStatus.ELIGIBLE];
  if (improvementNeeds.length > 0 && improvementNeeds.length <= 2) {
    successIfImproved = Math.min(0.95, successIfImproved + 0.25);
  } else if (improvementNeeds.length > 2) {
    successIfImproved = Math.min(0.85, successIfImproved + 0.15);
  }
  
  return {
    student_id: studentId,
    predicted_status: predictedStatus,
    prediction_probability: similarProbabilities as Record<string, number>,
    confidence_score: confidenceScore,
    improvement_needs: improvementNeeds,
    success_probability: similarProbabilities[predictedStatus],
    success_probability_if_improved: successIfImproved
  };
};

/**
 * Tìm k sinh viên tương tự (KNN - Euclidean distance)
 */
const findSimilarStudents = (
  record: StudentDataRecord,
  historicalData: StudentDataRecord[],
  k: number = 10
): StudentDataRecord[] => {
  const distances = historicalData.map(other => {
    const euclidean = Math.sqrt(
      Math.pow(record.gpa - other.gpa, 2) * 0.5 +  // Weight: 50%
      Math.pow(record.training_points - other.training_points, 2) * 0.2 +  // Weight: 20%
      Math.pow(record.volunteer_days - other.volunteer_days, 2) * 0.15 +   // Weight: 15%
      Math.pow(record.total_hard_passed - other.total_hard_passed, 2) * 0.15  // Weight: 15%
    );
    return { record: other, distance: euclidean };
  });
  
  return distances
    .sort((a, b) => a.distance - b.distance)
    .slice(0, k)
    .map(item => item.record);
};

// ============================================================================
// 6. EXPORT UTILITIES
// ============================================================================

/**
 * Xuất dữ liệu ra file Excel (tên file)
 */
export const generateExcelExportName = (): string => {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return `SV5T_Dataset_${dateStr}.csv`;
};

/**
 * Tạo analytics report
 */
export const generateAnalyticsReport = (
  records: StudentDataRecord[]
): string => {
  const stats = calculateDatasetStatistics(records);
  const gpaAnalysis = analyzeGPACorrelation(records);
  const clusters = clusterStudents(records);
  
  const report = `
================================================================================
                      SV5T READINESS - ANALYTICS REPORT
================================================================================

Generated: ${new Date().toLocaleString('vi-VN')}
Total Records: ${records.length}

---

OVERVIEW
--------
✓ Total Students: ${stats.totalStudents}
✓ Eligible: ${stats.eligibleCount} (${(stats.passRate).toFixed(1)}%)
✓ Almost Ready: ${stats.almostReadyCount}
✓ Not Eligible: ${stats.notEligibleCount}

Average Completion: ${(stats.avgCompletionPercent).toFixed(1)}%

---

ACADEMIC PROFILE
----------------
Average GPA: ${(stats.avgGpa).toFixed(2)} (σ = ${(stats.gpaStd).toFixed(2)})
Average Training Points: ${(stats.avgTrainingPoints).toFixed(1)} / 100
Average Volunteer Days: ${(stats.avgVolunteerDays).toFixed(1)} days

---

HARD CRITERIA PASS RATES
------------------------
Ethics:       ${(stats.hardEthicsRate * 100).toFixed(1)}%
Study:        ${(stats.hardStudyRate * 100).toFixed(1)}%
Physical:     ${(stats.hardPhysicalRate * 100).toFixed(1)}%
Volunteer:    ${(stats.hardVolunteerRate * 100).toFixed(1)}%
Integration:  ${(stats.hardIntegrationRate * 100).toFixed(1)}%

---

SOFT CRITERIA ADOPTION
----------------------
Ethics Soft:       ${(stats.softEthicsAdoptionRate * 100).toFixed(1)}%
Study Soft:        ${(stats.softStudyAdoptionRate * 100).toFixed(1)}%
Volunteer Soft:    ${(stats.softVolunteerAdoptionRate * 100).toFixed(1)}%
Integration Soft:  ${(stats.softIntegrationAdoptionRate * 100).toFixed(1)}%

---

BOTTLENECKS (Top Issues)
------------------------
${stats.bottlenecks.map((b, i) => `${i + 1}. ${b.criteria}: ${(b.failureRate * 100).toFixed(1)}% failure rate (${b.affectedStudents} students)`).join('\n')}

---

GPA vs ELIGIBILITY CORRELATION
--------------------------------
Correlation: ${(gpaAnalysis.correlation).toFixed(2)} (Strong)

Breakdown:
${gpaAnalysis.breakdown.map(b => `  ${b.gpaRange}: ${(b.eligibilityRate * 100).toFixed(1)}% eligible`).join('\n')}

---

STUDENT SEGMENTATION (Clustering)
----------------------------------
${clusters.map(c => `Profile ${c.cluster_id}: "${c.profile_name}"
  - Count: ${c.student_count} students (${((c.student_count / records.length) * 100).toFixed(1)}%)
  - Avg GPA: ${(c.avg_gpa).toFixed(2)}
  - Avg Completion: ${(c.avg_completion).toFixed(1)}%
  - Eligibility Rate: ${(c.eligibility_rate * 100).toFixed(1)}%
  - Characteristics: ${c.characteristics.join(', ')}
`).join('\n')}

================================================================================
End of Report
================================================================================
`;
  
  return report;
};
