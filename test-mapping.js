import mongoose from 'mongoose';
import User from './server/models/User.js';

async function test() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/sv5t_database');
    
    const users = await User.find({ role: 'STUDENT' });
    console.log(`\n✓ Found ${users.length} students\n`);
    
    console.log('=== MAPPING STUDENTS ===\n');
    
    const students = users.map((user, idx) => {
      const gpa = user.profile?.gpa || 0;
      const evaluationStatus = user.profile?.evaluationStatus || 'NOT_ELIGIBLE';
      const readinessScore = user.profile?.readinessScore || 0;

      let statusLabel = 'Chưa đạt';
      if (evaluationStatus === 'ELIGIBLE') statusLabel = 'Đủ điều kiện';
      else if (evaluationStatus === 'ALMOST_READY') statusLabel = 'Gần đạt';

      const mapped = {
        _id: user._id,
        mssv: user.mssv,
        fullName: user.profile.name,
        faculty: user.profile.faculty,
        gpa,
        status: statusLabel,
        evaluationStatus,
        readinessScore,
        completionPercent: Math.min(100, Math.max(0, readinessScore))
      };
      
      if (idx === 0) {
        console.log('First student mapped:');
        console.log(JSON.stringify(mapped, null, 2));
        console.log('\n');
      }
      
      return mapped;
    });
    
    console.log(`✓ Successfully mapped ${students.length} students`);
    console.log('\nAll mapped data summary:');
    students.forEach((s, idx) => {
      console.log(`${idx + 1}. ${s.mssv} - ${s.fullName} - ${s.faculty} - GPA: ${s.gpa} - Status: ${s.status}`);
    });
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

test();
