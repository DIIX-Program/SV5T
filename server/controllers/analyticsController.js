import { Student } from '../models/Student.js';
import { AnalyticsData } from '../models/Analytics.js';

// Analyze dataset
export const analyzeDataset = async (req, res) => {
  try {
    const { academicYear, faculty } = req.query;
    let filter = {};

    if (academicYear) filter.academicYear = parseInt(academicYear);
    if (faculty) filter.faculty = faculty;

    const students = await Student.find(filter);

    if (students.length === 0) {
      return res.json({
        success: true,
        message: 'No students found for analysis',
        data: {}
      });
    }

    // Calculate statistics
    const totalStudents = students.length;
    const eligibleCount = students.filter(s => s.evaluationResult?.status === 'eligible').length;
    const almostReadyCount = students.filter(s => s.evaluationResult?.status === 'almost_ready').length;
    const notEligibleCount = students.filter(s => s.evaluationResult?.status === 'not_eligible').length;

    const averageGPA = (students.reduce((sum, s) => sum + (s.gpa || 0), 0) / totalStudents).toFixed(2);
    const averageTraining = (students.reduce((sum, s) => sum + (s.trainingPoints || 0), 0) / totalStudents).toFixed(2);
    const passRate = ((eligibleCount / totalStudents) * 100).toFixed(2);

    // Hard criteria analysis
    const hardCriteriaPasses = {
      academicPerformance: 0,
      trainingExcellence: 0,
      volunteerWork: 0,
      skillsDevelopment: 0,
      communityContribution: 0
    };

    students.forEach(s => {
      Object.keys(hardCriteriaPasses).forEach(key => {
        if (s.hardCriteria?.[key]) hardCriteriaPasses[key]++;
      });
    });

    Object.keys(hardCriteriaPasses).forEach(key => {
      hardCriteriaPasses[key] = ((hardCriteriaPasses[key] / totalStudents) * 100).toFixed(2) + '%';
    });

    // Soft criteria analysis
    const softCriteriaAverages = {
      academicEnrichment: 0,
      leadershipInitiative: 0,
      articulateCommunication: 0,
      socialResponsibility: 0
    };

    students.forEach(s => {
      Object.keys(softCriteriaAverages).forEach(key => {
        softCriteriaAverages[key] += s.softCriteria?.[key] || 0;
      });
    });

    Object.keys(softCriteriaAverages).forEach(key => {
      softCriteriaAverages[key] = (softCriteriaAverages[key] / totalStudents).toFixed(2);
    });

    // GPA correlation with eligibility
    const eligibleGPA = students.filter(s => s.evaluationResult?.status === 'eligible').map(s => s.gpa || 0);
    const notEligibleGPA = students.filter(s => s.evaluationResult?.status === 'not_eligible').map(s => s.gpa || 0);
    
    const avgEligibleGPA = eligibleGPA.length > 0 ? (eligibleGPA.reduce((a, b) => a + b) / eligibleGPA.length).toFixed(2) : 0;
    const avgNotEligibleGPA = notEligibleGPA.length > 0 ? (notEligibleGPA.reduce((a, b) => a + b) / notEligibleGPA.length).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        totalStudents,
        eligibleCount,
        almostReadyCount,
        notEligibleCount,
        passRate: passRate + '%',
        averageGPA,
        averageTraining,
        hardCriteriaPasses,
        softCriteriaAverages,
        correlationAnalysis: {
          avgEligibleGPA,
          avgNotEligibleGPA,
          gpaImportance: 'High - GPA is strong predictor of eligibility'
        },
        analyzedAt: new Date(),
        filter
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get dataset for ML training
export const getDatasetForML = async (req, res) => {
  try {
    const { academicYear } = req.query;
    let filter = {};
    if (academicYear) filter.academicYear = parseInt(academicYear);

    const students = await Student.find(filter);

    // Convert to ML-ready format
    const dataset = students.map(s => ({
      id: s._id,
      mssv: s.mssv,
      hardCriteria: [
        s.hardCriteria?.academicPerformance ? 1 : 0,
        s.hardCriteria?.trainingExcellence ? 1 : 0,
        s.hardCriteria?.volunteerWork ? 1 : 0,
        s.hardCriteria?.skillsDevelopment ? 1 : 0,
        s.hardCriteria?.communityContribution ? 1 : 0
      ],
      softCriteria: [
        s.softCriteria?.academicEnrichment || 0,
        s.softCriteria?.leadershipInitiative || 0,
        s.softCriteria?.articulateCommunication || 0,
        s.softCriteria?.socialResponsibility || 0
      ],
      gpa: s.gpa || 0,
      trainingPoints: s.trainingPoints || 0,
      evidenceCount: s.evidenceSubmissions?.length || 0,
      approvedEvidenceCount: s.evidenceSubmissions?.filter(e => e.status === 'approved').length || 0,
      label: s.evaluationResult?.status === 'eligible' ? 1 : 0,
      confidence: s.evaluationResult?.confidence || 0.5
    }));

    res.json({
      success: true,
      count: dataset.length,
      data: dataset
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Export dataset to CSV format
export const exportDatasetCSV = async (req, res) => {
  try {
    const { academicYear } = req.query;
    let filter = {};
    if (academicYear) filter.academicYear = parseInt(academicYear);

    const students = await Student.find(filter);

    // Create CSV header
    let csv = 'MSSV,Full Name,Faculty,GPA,Training Points,Academic Performance,Training Excellence,Volunteer Work,Skills Development,Community Contribution,Academic Enrichment,Leadership Initiative,Articulate Communication,Social Responsibility,Evidence Count,Approved Evidence,Status\n';

    // Add data rows
    students.forEach(s => {
      csv += `${s.mssv},"${s.fullName}",${s.faculty},${s.gpa || 0},${s.trainingPoints || 0},${s.hardCriteria?.academicPerformance ? 'Yes' : 'No'},${s.hardCriteria?.trainingExcellence ? 'Yes' : 'No'},${s.hardCriteria?.volunteerWork ? 'Yes' : 'No'},${s.hardCriteria?.skillsDevelopment ? 'Yes' : 'No'},${s.hardCriteria?.communityContribution ? 'Yes' : 'No'},${s.softCriteria?.academicEnrichment || 0},${s.softCriteria?.leadershipInitiative || 0},${s.softCriteria?.articulateCommunication || 0},${s.softCriteria?.socialResponsibility || 0},${s.evidenceSubmissions?.length || 0},${s.evidenceSubmissions?.filter(e => e.status === 'approved').length || 0},"${s.evaluationResult?.status || 'pending'}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="student-dataset-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Save analytics report
export const saveAnalyticsReport = async (req, res) => {
  try {
    const analyticsData = new AnalyticsData(req.body);
    await analyticsData.save();
    res.status(201).json({
      success: true,
      message: 'Analytics report saved',
      data: analyticsData
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get recent analytics
export const getRecentAnalytics = async (req, res) => {
  try {
    const analytics = await AnalyticsData.findOne().sort({ generatedAt: -1 });
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
