import express from 'express';
import {
  getAllEvents,
  getEventsByMonth,
  getUpcomingEvents,
  getEventArchive,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  archivePastEvents
} from '../controllers/eventController.js';
import { authenticate, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/all', getAllEvents);
router.get('/upcoming', getUpcomingEvents);
router.get('/month/:month/:year', getEventsByMonth);
router.get('/archive', getEventArchive);
router.get('/:id', getEventById);

// Admin routes (protected)
router.post('/', authenticate, adminOnly, createEvent);
router.put('/:id', authenticate, adminOnly, updateEvent);
router.delete('/:id', authenticate, adminOnly, deleteEvent);
router.post('/archive/batch', authenticate, adminOnly, archivePastEvents);

export default router;
