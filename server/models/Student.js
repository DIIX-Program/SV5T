import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  mssv: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  faculty: {
    type: String,
    required: true
  },
  academicYear: {
    type: Number,
    required: true
  },
  studentType: {
    type: String,
    enum: ['chính quy', 'liên thông', 'tài năng']
  },
  gpa: {
    type: Number,
    min: 0,
    max: 4
  },
  trainingPoints: {
    type: Number,
    default: 0
  },
  hardCriteria: {
    academicPerformance: Boolean,
    trainingExcellence: Boolean,
    volunteerWork: Boolean,
    skillsDevelopment: Boolean,
    communityContribution: Boolean
  },
  softCriteria: {
    academicEnrichment: { type: Number, min: 0, max: 6 },
    leadershipInitiative: { type: Number, min: 0, max: 6 },
    articulateCommunication: { type: Number, min: 0, max: 6 },
    socialResponsibility: { type: Number, min: 0, max: 6 }
  },
  evidenceSubmissions: [{
    criteriaId: String,
    title: String,
    description: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected'] },
    submittedAt: Date,
    approvedAt: Date
  }],
  evaluationResult: {
    status: { type: String, enum: ['eligible', 'almost_ready', 'not_eligible'] },
    readinessScore: Number,
    confidence: Number,
    evaluatedAt: Date,
    evaluatedBy: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
StudentSchema.index({ mssv: 1 });
StudentSchema.index({ email: 1 });
StudentSchema.index({ faculty: 1 });
StudentSchema.index({ academicYear: 1 });
StudentSchema.index({ 'evaluationResult.status': 1 });

export const Student = mongoose.model('Student', StudentSchema);
