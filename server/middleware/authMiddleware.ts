// ============================================
// Authentication Middleware - Prisma Optimized
// Features:
// - JWT token verification
// - Role-based access control
// - User context injection
// - Backend-only authorization
// ============================================

import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload, authorizeUser } from '../services/authService';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload & { isValid: boolean };
    }
  }
}

// ============================================
// MIDDLEWARE FUNCTIONS
// ============================================

/**
 * Extract and verify JWT token from Authorization header
 * All requests must include: Authorization: Bearer <token>
 */
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token không được cung cấp',
        error: 'NO_TOKEN',
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer "
    
    // Determine if it's admin token
    const isAdmin = req.path.includes('/admin');
    const payload = verifyToken(token, isAdmin);

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn',
        error: 'INVALID_TOKEN',
      });
    }

    // Verify user is still active in database
    const isAuthorized = await authorizeUser(payload.id);
    if (!isAuthorized) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản không hoạt động',
        error: 'USER_INACTIVE',
      });
    }

    // Attach user to request
    req.user = {
      ...payload,
      isValid: true,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Xác thực thất bại',
      error: 'AUTH_ERROR',
    });
  }
}

/**
 * Require STUDENT role
 */
export function requireStudent(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user || req.user.role !== 'STUDENT') {
    return res.status(403).json({
      success: false,
      message: 'Chỉ sinh viên mới có thể truy cập',
      error: 'INSUFFICIENT_PERMISSION',
    });
  }

  next();
}

/**
 * Require ADMIN role
 * CRITICAL: Backend enforcement, frontend cannot bypass
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user || req.user.role !== 'ADMIN') {
    // Log unauthorized access attempt
    console.warn(`⚠️ Unauthorized admin access attempt:`, {
      userId: req.user?.id,
      role: req.user?.role,
      ip: req.ip,
      path: req.path,
    });

    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền truy cập tài nguyên này',
      error: 'INSUFFICIENT_PERMISSION',
    });
  }

  // Double-check authorization in database
  const isAdmin = await authorizeUser(req.user.id, 'ADMIN');
  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền truy cập tài nguyên này',
      error: 'INSUFFICIENT_PERMISSION',
    });
  }

  next();
}

/**
 * Require authentication (any logged-in user)
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user || !req.user.isValid) {
    return res.status(401).json({
      success: false,
      message: 'Vui lòng đăng nhập',
      error: 'NOT_AUTHENTICATED',
    });
  }

  next();
}

/**
 * Optional authentication (enhance request if token present)
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyToken(token, false);

      if (payload) {
        const isAuthorized = await authorizeUser(payload.id);
        if (isAuthorized) {
          req.user = {
            ...payload,
            isValid: true,
          };
        }
      }
    }
  } catch (error) {
    // Silently fail - this is optional
  }

  next();
}

/**
 * Check if user owns resource (for data isolation)
 * Usage: Call after authenticateToken
 */
export async function checkResourceOwnership(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập',
        error: 'NOT_AUTHENTICATED',
      });
    }

    // Extract studentId from request
    const studentId = req.params.studentId || req.body.studentId;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'studentId không được cung cấp',
        error: 'MISSING_PARAM',
      });
    }

    // Check: ADMIN can access any, STUDENT can only access own data
    if (req.user.role === 'STUDENT') {
      // Verify student owns this resource
      if (req.user.id !== studentId) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập tài nguyên này',
          error: 'INSUFFICIENT_PERMISSION',
        });
      }
    }

    next();
  } catch (error) {
    console.error('Resource ownership check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Kiểm tra quyền thất bại',
      error: 'SERVER_ERROR',
    });
  }
}

// ============================================
// MIDDLEWARE CHAINS
// ============================================

/**
 * Chain middlewares for student endpoints
 */
export function studentOnly(...handlers: any[]) {
  return [
    authenticateToken,
    requireStudent,
    ...handlers,
  ];
}

/**
 * Chain middlewares for admin endpoints
 */
export function adminOnly(...handlers: any[]) {
  return [
    authenticateToken,
    requireAdmin,
    ...handlers,
  ];
}

/**
 * Chain middlewares for authenticated endpoints
 */
export function authRequired(...handlers: any[]) {
  return [
    authenticateToken,
    requireAuth,
    ...handlers,
  ];
}
