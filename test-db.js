import mongoose from 'mongoose';
import User from './server/models/User.js';

async function test() {
  try {
    await mongoose.connect('mongodb://localhost:27017/sv5t');
    const users = await User.find({ role: 'STUDENT' }).limit(2);
    
    console.log('=== USERS IN DATABASE ===');
    users.forEach((user, idx) => {
      console.log(`\nUser ${idx + 1}:`);
      console.log('MSSV:', user.mssv);
      console.log('Profile:', JSON.stringify({
        name: user.profile?.name,
        faculty: user.profile?.faculty,
        gpa: user.profile?.gpa,
        evaluationStatus: user.profile?.evaluationStatus,
        readinessScore: user.profile?.readinessScore
      }, null, 2));
    });
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

test();
