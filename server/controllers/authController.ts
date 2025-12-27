// ============================================
// Authentication Controller - Prisma Optimized
// Endpoints:
// - POST /api/auth/register
// - POST /api/auth/login
// - POST /api/auth/admin/login
// - GET /api/auth/me
// - POST /api/auth/logout
// ============================================

import { Request, Response } from 'express';
import {
  registerStudent,
  loginUser,
  getCurrentUser,
  TokenPayload,
} from '../services/authService';
import { prisma } from '../lib/prisma';

// ============================================
// STUDENT REGISTRATION
// ============================================

export async function handleRegister(req: Request, res: Response) {
  try {
    const { mssv, password, confirmPassword, fullName, className, faculty, studentType } = req.body;

    const result = await registerStudent({
      mssv,
      password,
      confirmPassword,
      fullName,
      className,
      faculty,
      studentType: studentType || 'UNIVERSITY',
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error('Register handler error:', error);
    return res.status(500).json({
      success: false,
      message: 'Đăng ký thất bại',
      error: 'INTERNAL_ERROR',
    });
  }
}

// ============================================
// STUDENT LOGIN
// ============================================

export async function handleStudentLogin(req: Request, res: Response) {
  try {
    const { mssv, password } = req.body;

    if (!mssv || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp MSSV và mật khẩu',
        error: 'MISSING_FIELDS',
      });
    }

    const result = await loginUser({ mssv, password }, false);

    if (!result.success) {
      return res.status(401).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Student login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Đăng nhập thất bại',
      error: 'INTERNAL_ERROR',
    });
  }
}

// ============================================
// ADMIN LOGIN
// CRITICAL: Backend-only enforcement
// ============================================

export async function handleAdminLogin(req: Request, res: Response) {
  try {
    const { mssv, password } = req.body;

    if (!mssv || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp MSSV và mật khẩu',
        error: 'MISSING_FIELDS',
      });
    }

    // Login with admin flag (checks role in authService)
    const result = await loginUser({ mssv, password }, true);

    if (!result.success) {
      // Log failed admin access attempt
      await prisma.auditLog.create({
        data: {
          action: 'FAILED_ADMIN_LOGIN',
          resourceType: 'ADMIN',
          details: {
            mssv,
            reason: result.error,
          },
        },
      });

      return res.status(401).json(result);
    }

    // Log successful admin login
    await prisma.auditLog.create({
      data: {
        userId: result.user?.id,
        action: 'ADMIN_LOGIN',
        resourceType: 'ADMIN',
      },
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Đăng nhập admin thất bại',
      error: 'INTERNAL_ERROR',
    });
  }
}

// ============================================
// GET CURRENT USER
// ============================================

export async function handleGetCurrentUser(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập',
        error: 'NOT_AUTHENTICATED',
      });
    }

    const user = await getCurrentUser(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tìm thấy',
        error: 'USER_NOT_FOUND',
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lấy thông tin người dùng thất bại',
      error: 'INTERNAL_ERROR',
    });
  }
}

// ============================================
// LOGOUT
// ============================================

export async function handleLogout(req: Request, res: Response) {
  try {
    if (req.user) {
      // Log audit
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'LOGOUT',
          resourceType: 'USER',
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Đăng xuất thất bại',
      error: 'INTERNAL_ERROR',
    });
  }
}
