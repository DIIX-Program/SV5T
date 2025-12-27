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

    // Create test accounts
    const testUsers = [
      {
        mssv: '2024001001',
        passwordHash: studentPassword,
        role: 'STUDENT',
        profile: {
          name: 'Nguyễn Văn A',
          className: 'CNTT-K65',
          faculty: 'Công nghệ thông tin',
          studentType: 'UNIVERSITY'
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
          faculty: 'Công nghệ thông tin',
          studentType: 'UNIVERSITY'
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
          faculty: 'Quản lý kinh doanh',
          studentType: 'COLLEGE'
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
    console.log('MSSV: 2024001001 | Mật khẩu: student123 | Tên: Nguyễn Văn A');
    console.log('MSSV: 2024001002 | Mật khẩu: student123 | Tên: Trần Thị B');
    console.log('MSSV: 2024002001 | Mật khẩu: student123 | Tên: Lê Hoàng C');
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
