import express from 'express';
import {
  registerStudent,
  loginStudent,
  loginAdmin,
  getCurrentUser,
  logout
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerStudent);
router.post('/login', loginStudent);
router.post('/admin/login', loginAdmin); // Hidden admin endpoint

// Protected routes
router.get('/me', authenticate, getCurrentUser);
router.post('/logout', authenticate, logout);

export default router;
