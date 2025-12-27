import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    mssv: {
      type: String,
      required: true,
      unique: true,
      match: /^\d{10}$/, // Exactly 10 digits
      index: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['STUDENT', 'ADMIN'],
      default: 'STUDENT',
      index: true
    },
    profile: {
      name: String,
      className: String,
      faculty: String,
      studentType: {
        type: String,
        enum: ['UNIVERSITY', 'COLLEGE']
      }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
