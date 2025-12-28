import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './server/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sv5t')
  .then(() => console.log('✓ MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Test endpoint - same as getAllStudents
app.get('/api/students/all', async (req, res) => {
  try {
    const { faculty, academicYear, status } = req.query;
    let filter = { role: 'STUDENT' };

    if (faculty) filter['profile.faculty'] = faculty;
    if (academicYear) filter['profile.academicYear'] = parseInt(academicYear);

    const users = await User.find(filter);

    const students = users.map(user => {
      const gpa = user.profile?.gpa || 0;
      const evaluationStatus = user.profile?.evaluationStatus || 'NOT_ELIGIBLE';
      const readinessScore = user.profile?.readinessScore || 0;

      let statusLabel = 'Chưa đạt';
      if (evaluationStatus === 'ELIGIBLE') statusLabel = 'Đủ điều kiện';
      else if (evaluationStatus === 'ALMOST_READY') statusLabel = 'Gần đạt';

      return {
        _id: user._id,
        mssv: user.mssv,
        fullName: user.profile.name,
        faculty: user.profile.faculty,
        academicYear: user.profile.academicYear,
        studentType: user.profile.studentType,
        gpa,
        status: statusLabel,
        evaluationStatus,
        readinessScore,
        completionPercent: Math.min(100, Math.max(0, readinessScore))
      };
    });

    res.json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✓ Test API server running at http://localhost:${PORT}`);
  console.log(`✓ Try: http://localhost:${PORT}/api/students/all\n`);
});
