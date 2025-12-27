export enum StudentType {
  UNIVERSITY = 'UNIVERSITY',
  COLLEGE = 'COLLEGE'
}

export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN'
}

export enum EvaluationStatus {
  ELIGIBLE = 'ELIGIBLE',
  ALMOST_READY = 'ALMOST_READY',
  NOT_ELIGIBLE = 'NOT_ELIGIBLE'
}

export enum EvidenceStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

// Auth-related interfaces
export interface AuthUser {
  id: string;
  mssv: string;
  role: UserRole;
  token?: string;
}

export interface AuthCredentials {
  mssv: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
  token?: string;
  error?: string;
}

// User model for backend
export interface User {
  id: string;
  mssv: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  userId: string;
  mssv: string;
  fullName?: string; // Giữ cả fullName (từ HEAD) để tương thích ngược
  name?: string; // Giữ cả name (từ 2.0) để tương thích với API
  className: string;
  faculty: string;
  studentType: StudentType;
  createdAt?: string;
  updatedAt?: string;
}

export interface EvidenceFile {
  id: string;
  name: string;
  url: string;
  type: string;
}

export interface EvidenceSubmission {
  id: string;
  userId: string;
  criteriaKeys: string[]; // Một minh chứng có thể thuộc nhiều tiêu chí
  description: string;
  achievementDate: string;
  files: EvidenceFile[];
  status: EvidenceStatus;
  adminComment?: string;
  submittedAt: string;
}

export interface UniversityEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  categories: string[]; // Một sự kiện có thể hỗ trợ nhiều tiêu chí
  location: string;
  link?: string;
}

export interface CriteriaData {
  trainingPoints: number;
  noDiscipline: boolean;
  marxistMember: boolean;
  exemplaryYouth: boolean;
  gpa: number;
  scientificResearch: boolean;
  journalArticle: boolean;
  conferencePaper: boolean;
  invention: boolean;
  academicTeamMember: boolean;
  academicCompetitionAward: boolean;
  isHealthyStudent: boolean;
  sportAward: boolean;
  volunteerDays: number;
  volunteerAward: boolean;
  volunteerLeader: boolean;
  skillCourseOrUnionAward: boolean;
  integrationActivity: boolean;
  englishB1OrGpa: boolean;
  internationalExchange: boolean;
  foreignLanguageCompetition: boolean;
}

export interface CategoryResult {
  isHardPassed: boolean;
  isAlmostPassed: boolean;
  hardFails: string[];
  softBonus: number;
  tips: string[];
}

export interface EvaluationResult {
  overallStatus: EvaluationStatus;
  readinessScore: number;
  categoryResults: {
    ethics: CategoryResult;
    study: CategoryResult;
    physical: CategoryResult;
    volunteer: CategoryResult;
    integration: CategoryResult;
  };
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface Confession {
  id: string;
  content: string;
  tag: string;
  createdAt: string;
  likes: number;
  commentsList: Comment[]; // Changed from comments: number to list
  color: string;
}

export interface Scholarship {
  id: string;
  name: string;
  content: string;
  expiryDate: string; // ISO Date string
  createdAt: string;
}
