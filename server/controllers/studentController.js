import User from '../models/User.js';

// Get all students
export const getAllStudents = async (req, res) => {
  try {
    const { faculty, academicYear, status } = req.query;
    let filter = { role: 'STUDENT' };

    if (faculty) filter['profile.faculty'] = faculty;
    if (academicYear) filter['profile.academicYear'] = parseInt(academicYear);
    // status filter may not apply to User model

    // Fetch from database
    const users = await User.find(filter);

    // Map User data to expected student format
    const students = users.map(user => {
      const gpa = user.profile?.gpa || 0;
      const evaluationStatus = user.profile?.evaluationStatus || 'NOT_ELIGIBLE';
      const readinessScore = user.profile?.readinessScore || 0;

      // Map evaluationStatus to user-friendly label
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
};

// Get single student
export const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create student
export const createStudent = async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update student
export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    res.json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete student
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get students by faculty
export const getStudentsByFaculty = async (req, res) => {
  try {
    const { faculty } = req.params;
    const students = await Student.find({ faculty });
    res.json({
      success: true,
      faculty,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get statistics
export const getStudentStatistics = async (req, res) => {
  try {
    const { academicYear, faculty } = req.query;
    let filter = {};

    if (academicYear) filter.academicYear = parseInt(academicYear);
    if (faculty) filter.faculty = faculty;

    const totalStudents = await Student.countDocuments(filter);
    const eligibleCount = await Student.countDocuments({
      ...filter,
      'evaluationResult.status': 'eligible'
    });
    const almostReadyCount = await Student.countDocuments({
      ...filter,
      'evaluationResult.status': 'almost_ready'
    });
    const notEligibleCount = await Student.countDocuments({
      ...filter,
      'evaluationResult.status': 'not_eligible'
    });

    const students = await Student.find(filter);
    const avgGPA = students.reduce((sum, s) => sum + (s.gpa || 0), 0) / totalStudents || 0;
    const avgTraining = students.reduce((sum, s) => sum + (s.trainingPoints || 0), 0) / totalStudents || 0;

    res.json({
      success: true,
      statistics: {
        totalStudents,
        eligibleCount,
        almostReadyCount,
        notEligibleCount,
        passRate: (eligibleCount / totalStudents * 100).toFixed(2) + '%',
        averageGPA: avgGPA.toFixed(2),
        averageTrainingPoints: avgTraining.toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
