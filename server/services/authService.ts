// ============================================
// Authentication Service - Prisma Optimized
// Features:
// - MSSV validation (exactly 10 digits)
// - Secure password hashing (bcryptjs)
// - JWT token generation
// - Role-based access
// - Backend-only security
// ============================================

import { hash, compare } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'sv5t-secret-key-change-in-production';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'sv5t-admin-secret-change-in-production';
const JWT_EXPIRY = '7d';
const BCRYPT_ROUNDS = 10;

// ============================================
// VALIDATION
// ============================================

/**
 * Validate MSSV format (exactly 10 digits)
 */
export function isValidMSSV(mssv: string): boolean {
  return /^\d{10}$/.test(mssv);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

// ============================================
// PASSWORD HANDLING
// ============================================

/**
 * Hash password using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, BCRYPT_ROUNDS);
}

/**
 * Compare plaintext password with hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return compare(password, hash);
}

// ============================================
// TOKEN HANDLING
// ============================================

export interface TokenPayload {
  id: string;
  mssv: string;
  role: 'STUDENT' | 'ADMIN';
}

/**
 * Generate JWT token
 */
export function generateToken(payload: TokenPayload, isAdmin: boolean = false): string {
  const secret = isAdmin ? ADMIN_SECRET : JWT_SECRET;
  return sign(payload, secret, { expiresIn: JWT_EXPIRY });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string, isAdmin: boolean = false): TokenPayload | null {
  try {
    const secret = isAdmin ? ADMIN_SECRET : JWT_SECRET;
    const decoded = verify(token, secret) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

// ============================================
// AUTHENTICATION OPERATIONS
// ============================================

export interface RegisterInput {
  mssv: string;
  password: string;
  confirmPassword?: string;
  fullName: string;
  className: string;
  faculty: string;
  studentType?: 'UNIVERSITY' | 'COLLEGE';
}

export interface LoginInput {
  mssv: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    mssv: string;
    role: string;
    fullName?: string;
  };
  token?: string;
  error?: string;
}

/**
 * Register new student
 * BACKEND VALIDATION - CRITICAL
 */
export async function registerStudent(input: RegisterInput): Promise<AuthResponse> {
  try {
    // 1. Validate MSSV
    if (!isValidMSSV(input.mssv)) {
      return {
        success: false,
        message: 'MSSV phải có 10 chữ số',
        error: 'INVALID_MSSV',
      };
    }

    // 2. Validate password
    if (!isValidPassword(input.password)) {
      return {
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự',
        error: 'INVALID_PASSWORD',
      };
    }

    // 3. Validate confirm password
    if (input.confirmPassword && input.password !== input.confirmPassword) {
      return {
        success: false,
        message: 'Mật khẩu xác nhận không khớp',
        error: 'PASSWORD_MISMATCH',
      };
    }

    // 4. Validate required fields
    if (!input.fullName || !input.className || !input.faculty) {
      return {
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin',
        error: 'MISSING_FIELDS',
      };
    }

    // 5. Check MSSV uniqueness (CRITICAL - prevent duplicate)
    const existingUser = await prisma.user.findUnique({
      where: { mssv: input.mssv },
      select: { id: true }, // Only select ID to minimize data transfer
    });

    if (existingUser) {
      return {
        success: false,
        message: 'MSSV đã được đăng ký',
        error: 'MSSV_EXISTS',
      };
    }

    // 6. Hash password
    const passwordHash = await hashPassword(input.password);

    // 7. Create user + student profile in transaction
    const user = await prisma.user.create({
      data: {
        mssv: input.mssv,
        passwordHash,
        role: 'STUDENT',
        isActive: true,
        studentProfile: {
          create: {
            fullName: input.fullName,
            className: input.className,
            faculty: input.faculty,
            studentType: input.studentType || 'UNIVERSITY',
            academicYear: new Date().getFullYear(),
            gpa: 0,
          },
        },
      },
      select: {
        id: true,
        mssv: true,
        role: true,
        studentProfile: {
          select: {
            fullName: true,
          },
        },
      },
    });

    // 8. Generate token
    const token = generateToken(
      {
        id: user.id,
        mssv: user.mssv,
        role: user.role as 'STUDENT' | 'ADMIN',
      },
      false
    );

    // 9. Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        resourceType: 'STUDENT',
        resourceId: user.id,
      },
    });

    return {
      success: true,
      message: 'Đăng ký thành công',
      user: {
        id: user.id,
        mssv: user.mssv,
        role: user.role,
        fullName: user.studentProfile?.fullName,
      },
      token,
    };
  } catch (error) {
    console.error('Register error:', error);
    return {
      success: false,
      message: 'Đăng ký thất bại, vui lòng thử lại',
      error: 'INTERNAL_ERROR',
    };
  }
}

/**
 * Login student or admin
 * BACKEND VALIDATION - CRITICAL
 */
export async function loginUser(input: LoginInput, isAdmin: boolean = false): Promise<AuthResponse> {
  try {
    // 1. Validate MSSV
    if (!isValidMSSV(input.mssv)) {
      return {
        success: false,
        message: 'MSSV hoặc mật khẩu không đúng',
        error: 'INVALID_CREDENTIALS',
      };
    }

    // 2. Find user by MSSV (OPTIMIZED QUERY)
    const user = await prisma.user.findUnique({
      where: { mssv: input.mssv },
      select: {
        id: true,
        mssv: true,
        passwordHash: true,
        role: true,
        isActive: true,
        studentProfile: {
          select: {
            fullName: true,
          },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        message: 'MSSV hoặc mật khẩu không đúng',
        error: 'INVALID_CREDENTIALS',
      };
    }

    // 3. Check if user is active
    if (!user.isActive) {
      return {
        success: false,
        message: 'Tài khoản đã bị khóa',
        error: 'ACCOUNT_INACTIVE',
      };
    }

    // 4. Check role if admin login
    if (isAdmin && user.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Bạn không có quyền truy cập admin',
        error: 'INSUFFICIENT_PERMISSION',
      };
    }

    // 5. Verify password
    const passwordValid = await verifyPassword(input.password, user.passwordHash);
    if (!passwordValid) {
      return {
        success: false,
        message: 'MSSV hoặc mật khẩu không đúng',
        error: 'INVALID_CREDENTIALS',
      };
    }

    // 6. Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
      select: { id: true }, // Minimal select
    });

    // 7. Generate token
    const token = generateToken(
      {
        id: user.id,
        mssv: user.mssv,
        role: user.role as 'STUDENT' | 'ADMIN',
      },
      isAdmin
    );

    // 8. Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        resourceType: 'USER',
      },
    });

    return {
      success: true,
      message: 'Đăng nhập thành công',
      user: {
        id: user.id,
        mssv: user.mssv,
        role: user.role,
        fullName: user.studentProfile?.fullName,
      },
      token,
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Đăng nhập thất bại, vui lòng thử lại',
      error: 'INTERNAL_ERROR',
    };
  }
}

/**
 * Get current user from token
 */
export async function getCurrentUser(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        mssv: true,
        role: true,
        isActive: true,
        studentProfile: {
          select: {
            fullName: true,
            className: true,
            faculty: true,
            studentType: true,
            academicYear: true,
            gpa: true,
            trainingPoints: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * Verify user authorization
 * BACKEND VALIDATION - CRITICAL
 */
export async function authorizeUser(userId: string, requiredRole?: 'STUDENT' | 'ADMIN'): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return false;
    }

    if (requiredRole && user.role !== requiredRole) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}
