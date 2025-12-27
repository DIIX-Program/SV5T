// ============================================
// Authentication Routes - Prisma Optimized
// All routes with proper middleware & validation
// ============================================

import { Router } from 'express';
import {
  handleRegister,
  handleStudentLogin,
  handleAdminLogin,
  handleGetCurrentUser,
  handleLogout,
} from '../controllers/authController';
import {
  authenticateToken,
  requireAuth,
} from '../middleware/authMiddleware';

const router = Router();

// ============================================
// PUBLIC ENDPOINTS (No authentication required)
// ============================================

/**
 * POST /api/auth/register
 * Register new student
 * Body: { mssv, password, confirmPassword, fullName, className, faculty, studentType }
 */
router.post('/register', handleRegister);

/**
 * POST /api/auth/login
 * Student login
 * Body: { mssv, password }
 */
router.post('/login', handleStudentLogin);

/**
 * POST /api/auth/admin/login
 * Admin login
 * HIDDEN from frontend, backend-only enforcement
 * Body: { mssv, password }
 */
router.post('/admin/login', handleAdminLogin);

// ============================================
// PROTECTED ENDPOINTS (Authentication required)
// ============================================

/**
 * GET /api/auth/me
 * Get current authenticated user
 * Headers: Authorization: Bearer <token>
 */
router.get('/me', authenticateToken, requireAuth, handleGetCurrentUser);

/**
 * POST /api/auth/logout
 * Logout current user
 * Headers: Authorization: Bearer <token>
 */
router.post('/logout', authenticateToken, requireAuth, handleLogout);

export default router;
