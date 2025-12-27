import mongoose from 'mongoose';

const AnalyticsDataSchema = new mongoose.Schema({
  academicYear: {
    type: Number,
    required: true
  },
  faculty: {
    type: String,
    required: true
  },
  totalStudents: Number,
  eligibleCount: Number,
  almostReadyCount: Number,
  notEligibleCount: Number,
  averageGPA: Number,
  averageTrainingPoints: Number,
  passRate: Number,
  hardCriteriaPasses: {
    academicPerformance: Number,
    trainingExcellence: Number,
    volunteerWork: Number,
    skillsDevelopment: Number,
    communityContribution: Number
  },
  softCriteriaAverages: {
    academicEnrichment: Number,
    leadershipInitiative: Number,
    articulateCommunication: Number,
    socialResponsibility: Number
  },
  bottlenecks: [{
    criteriaId: String,
    criteriaName: String,
    failureRate: Number,
    studentCount: Number,
    suggestions: [String]
  }],
  clusterProfiles: [{
    name: String,
    percentage: Number,
    characteristics: [String],
    eligibilityRate: Number
  }],
  correlationAnalysis: {
    gpaVsEligibility: Number,
    trainingVsEligibility: Number,
    hardVsSoft: Number
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  generatedBy: String
});

export const AnalyticsData = mongoose.model('AnalyticsData', AnalyticsDataSchema);
