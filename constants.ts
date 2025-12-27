
import { StudentType } from './types';

export const GPA_MIN = {
  [StudentType.UNIVERSITY]: 3.4,
  [StudentType.COLLEGE]: 3.2
};

export const TRAINING_POINTS_MIN = 90;
export const VOLUNTEER_DAYS_MIN = 5;

export const CATEGORY_LABELS = {
  ethics: 'Đạo đức tốt',
  study: 'Học tập tốt',
  physical: 'Thể lực tốt',
  volunteer: 'Tình nguyện tốt',
  integration: 'Hội nhập tốt'
};

export const CRITERIA_LIST = [
  { id: 1, key: 'ethics', label: 'Đạo đức tốt' },
  { id: 2, key: 'study', label: 'Học tập tốt' },
  { id: 3, key: 'physical', label: 'Thể lực tốt' },
  { id: 4, key: 'volunteer', label: 'Tình nguyện tốt' },
  { id: 5, key: 'integration', label: 'Hội nhập tốt' }
] as const;

export const DB_SCHEMA_DESCRIPTION = `
-- Database Schema for SV5T Evaluation System
CREATE TABLE Students (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    student_id VARCHAR(50),
    type ENUM('UNIVERSITY', 'COLLEGE'),
    training_points INT,
    gpa DECIMAL(3, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE CriteriaAchievements (
    id UUID PRIMARY KEY,
    student_id UUID REFERENCES Students(id),
    category ENUM('ETHICS', 'STUDY', 'PHYSICAL', 'VOLUNTEER', 'INTEGRATION'),
    type ENUM('HARD', 'SOFT'),
    description TEXT,
    proof_url TEXT,
    date_achieved DATE -- Must check between Aug 1st prev and Aug 1st curr
);
`;
