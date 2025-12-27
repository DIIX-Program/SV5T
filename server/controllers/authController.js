import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sv5t-secret-key-change-in-production';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'sv5t-admin-secret-change-in-production';

// Validate MSSV format (exactly 10 digits)
const isValidMSSV = (mssv) => /^\d{10}$/.test(mssv);

// Generate JWT token
const generateToken = (user, isAdmin = false) => {
  const secret = isAdmin ? ADMIN_SECRET : JWT_SECRET;
  return jwt.sign(
    { id: user._id, mssv: user.mssv, role: user.role },
    secret,
    { expiresIn: '7d' }
  );
};

// Student Registration
export const registerStudent = async (req, res) => {
  try {
    const { mssv, password, name, className, faculty, studentType } = req.body;

    // Validate required fields
    if (!mssv || !password || !name || !className || !faculty) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng điền đầy đủ thông tin'
      });
    }

    // Validate MSSV format
    if (!isValidMSSV(mssv)) {
      return res.status(400).json({
        success: false,
        error: 'MSSV phải có 10 chữ số'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Mật khẩu phải có ít nhất 6 ký tự'
      });
    }

    // Check if student already exists
    const existingUser = await User.findOne({ mssv });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'MSSV đã được đăng ký'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new student
    const newUser = new User({
      mssv,
      passwordHash: hashedPassword,
      role: 'STUDENT',
      profile: {
        name,
        className,
        faculty,
        studentType: studentType || 'UNIVERSITY'
      },
      isActive: true,
      createdAt: new Date()
    });

    await newUser.save();

    // Generate token
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      user: {
        id: newUser._id,
        mssv: newUser.mssv,
        role: newUser.role,
        name: newUser.profile.name,
        profile: newUser.profile
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Đăng ký thất bại, vui lòng thử lại'
    });
  }
};

// Unified Login (for both students and admins)
export const loginStudent = async (req, res) => {
  try {
    const { mssv, password } = req.body;

    // Validate inputs
    if (!mssv || !password) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng nhập MSSV và mật khẩu'
      });
    }

    // Validate MSSV format
    if (!isValidMSSV(mssv)) {
      return res.status(400).json({
        success: false,
        error: 'MSSV không hợp lệ'
      });
    }

    // Find user (student or admin)
    const user = await User.findOne({ mssv });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'MSSV hoặc mật khẩu không chính xác'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'MSSV hoặc mật khẩu không chính xác'
      });
    }

    // Generate token based on role
    const isAdmin = user.role === 'ADMIN';
    const token = generateToken(user, isAdmin);

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      user: {
        id: user._id,
        mssv: user.mssv,
        role: user.role,
        name: user.profile.name,
        profile: user.profile
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Đăng nhập thất bại, vui lòng thử lại'
    });
  }
};

// Admin Login (hidden endpoint)
export const loginAdmin = async (req, res) => {
  try {
    const { mssv, password } = req.body;

    // Validate inputs
    if (!mssv || !password) {
      return res.status(401).json({
        success: false,
        error: 'Thông tin xác thực không hợp lệ'
      });
    }

    // Validate MSSV format
    if (!isValidMSSV(mssv)) {
      return res.status(401).json({
        success: false,
        error: 'Thông tin xác thực không hợp lệ'
      });
    }

    // Find admin - only accept ADMIN role
    const user = await User.findOne({ mssv, role: 'ADMIN' });
    if (!user) {
      // Don't reveal whether user exists or role is wrong
      return res.status(401).json({
        success: false,
        error: 'Thông tin xác thực không hợp lệ'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Thông tin xác thực không hợp lệ'
      });
    }

    // Generate admin token
    const token = generateToken(user, true);

    res.status(200).json({
      success: true,
      message: 'Đăng nhập quản trị viên thành công',
      user: {
        id: user._id,
        mssv: user.mssv,
        role: user.role,
        name: user.profile.name,
        profile: user.profile
      },
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      error: 'Đăng nhập thất bại, vui lòng thử lại'
    });
  }
};

// Get current user info (verify token)
export const getCurrentUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        mssv: user.mssv,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

// Logout (client-side mainly)
export const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};
