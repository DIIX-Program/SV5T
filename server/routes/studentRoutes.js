import express from 'express';
import {
  getAllStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentsByFaculty,
  getStudentStatistics
} from '../controllers/studentController.js';

const router = express.Router();

// Student routes
router.get('/all', getAllStudents);
router.get('/statistics', getStudentStatistics);
router.get('/faculty/:faculty', getStudentsByFaculty);
router.get('/:id', getStudent);
router.post('/', createStudent);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

export default router;
