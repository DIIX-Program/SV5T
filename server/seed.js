import User from './models/User.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sv5t_database');
    console.log('✓ Connected to MongoDB');

    // Clear existing users (optional - comment out to keep existing data)
    await User.deleteMany({});
    console.log('✓ Cleared existing users');

    // Hash passwords
    const studentPassword = await bcrypt.hash('student123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);

    // Create test accounts with full evaluation data
    const testUsers = [
      {
        mssv: '2024001001',
        passwordHash: studentPassword,
        role: 'STUDENT',
        profile: {
          name: 'Nguyễn Văn A',
          className: 'CNTT-K65',
          faculty: 'Công nghệ Thông tin',
          studentType: 'UNIVERSITY',
          gpa: 3.45,
          trainingPoints: 92,
          evaluationStatus: 'ELIGIBLE',
          readinessScore: 88
        },
        isActive: true,
        createdAt: new Date()
      },
      {
        mssv: '2024001002',
        passwordHash: studentPassword,
        role: 'STUDENT',
        profile: {
          name: 'Trần Thị B',
          className: 'CNTT-K65',
          faculty: 'Công nghệ Thông tin',
          studentType: 'UNIVERSITY',
          gpa: 3.78,
          trainingPoints: 95,
          evaluationStatus: 'ELIGIBLE',
          readinessScore: 94
        },
        isActive: true,
        createdAt: new Date()
      },
      {
        mssv: '2024002001',
        passwordHash: studentPassword,
        role: 'STUDENT',
        profile: {
          name: 'Lê Hoàng C',
          className: 'QLKD-K65',
          faculty: 'Kinh tế - Quản trị',
          studentType: 'COLLEGE',
          gpa: 2.85,
          trainingPoints: 88,
          evaluationStatus: 'ALMOST_READY',
          readinessScore: 68
        },
        isActive: true,
        createdAt: new Date()
      },
      // More students for dashboard stats
      {
        mssv: '2024003001',
        passwordHash: studentPassword,
        role: 'STUDENT',
        profile: {
          name: 'Phạm Minh D',
          className: 'CK-K65',
          faculty: 'Cơ khí - Kỹ thuật',
          studentType: 'UNIVERSITY',
          gpa: 2.65,
          trainingPoints: 82,
          evaluationStatus: 'NOT_ELIGIBLE',
          readinessScore: 42
        },
        isActive: true,
        createdAt: new Date()
      },
      {
        mssv: '2024004001',
        passwordHash: studentPassword,
        role: 'STUDENT',
        profile: {
          name: 'Võ Thị E',
          className: 'NN-K65',
          faculty: 'Ngôn ngữ & Văn hóa',
          studentType: 'UNIVERSITY',
          gpa: 3.52,
          trainingPoints: 91,
          evaluationStatus: 'ELIGIBLE',
          readinessScore: 82
        },
        isActive: true,
        createdAt: new Date()
      },
      {
        mssv: '2024005001',
        passwordHash: studentPassword,
        role: 'STUDENT',
        profile: {
          name: 'Hoàng Văn F',
          className: 'KHUD-K65',
          faculty: 'Khoa học ứng dụng',
          studentType: 'UNIVERSITY',
          gpa: 3.12,
          trainingPoints: 86,
          evaluationStatus: 'ALMOST_READY',
          readinessScore: 58
        },
        isActive: true,
        createdAt: new Date()
      },
      {
        mssv: '2024006001',
        passwordHash: studentPassword,
        role: 'STUDENT',
        profile: {
          name: 'Đỗ Thị G',
          className: 'DL-K65',
          faculty: 'Du lịch - Nhà hàng',
          studentType: 'COLLEGE',
          gpa: 2.58,
          trainingPoints: 78,
          evaluationStatus: 'NOT_ELIGIBLE',
          readinessScore: 38
        },
        isActive: true,
        createdAt: new Date()
      },
      {
        mssv: '0000000001',
        passwordHash: adminPassword,
        role: 'ADMIN',
        profile: {
          name: 'Phạm Thị Admin',
          className: 'ADMIN',
          faculty: 'Phòng Quản lý',
          studentType: 'UNIVERSITY'
        },
        isActive: true,
        createdAt: new Date()
      },
      {
        mssv: '0000000002',
        passwordHash: adminPassword,
        role: 'ADMIN',
        profile: {
          name: 'Võ Văn Hệ Thống',
          className: 'ADMIN',
          faculty: 'Phòng IT',
          studentType: 'UNIVERSITY'
        },
        isActive: true,
        createdAt: new Date()
      }
    ];

    // Insert users
    const createdUsers = await User.insertMany(testUsers);
    console.log(`✓ Created ${createdUsers.length} test accounts`);

    // Print account info
    console.log('\n📋 TEST ACCOUNTS CREATED:\n');
    console.log('====== SINH VIÊN ======');
    console.log('MSSV: 2024001001 | Mật khẩu: student123 | Nguyễn Văn A - CNTT (GPA 3.45, 88%)');
    console.log('MSSV: 2024001002 | Mật khẩu: student123 | Trần Thị B - CNTT (GPA 3.78, 94%)');
    console.log('MSSV: 2024002001 | Mật khẩu: student123 | Lê Hoàng C - Kinh tế (GPA 2.85, 68%)');
    console.log('MSSV: 2024003001 | Mật khẩu: student123 | Phạm Minh D - Cơ khí (GPA 2.65, 42%)');
    console.log('MSSV: 2024004001 | Mật khẩu: student123 | Võ Thị E - Ngôn ngữ (GPA 3.52, 82%)');
    console.log('MSSV: 2024005001 | Mật khẩu: student123 | Hoàng Văn F - Khoa học (GPA 3.12, 58%)');
    console.log('MSSV: 2024006001 | Mật khẩu: student123 | Đỗ Thị G - Du lịch (GPA 2.58, 38%)');
    console.log('\n====== QUẢN TRỊ VIÊN ======');
    console.log('MSSV: 0000000001 | Mật khẩu: admin123 | Tên: Phạm Thị Admin');
    console.log('MSSV: 0000000002 | Mật khẩu: admin123 | Tên: Võ Văn Hệ Thống');
    console.log('\n✓ Database seed completed successfully!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
