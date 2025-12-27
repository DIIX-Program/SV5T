import express from 'express';
import {
  analyzeDataset,
  getDatasetForML,
  exportDatasetCSV,
  saveAnalyticsReport,
  getRecentAnalytics
} from '../controllers/analyticsController.js';

const router = express.Router();

// Analytics routes
router.get('/analyze', analyzeDataset);
router.get('/dataset-ml', getDatasetForML);
router.get('/export-csv', exportDatasetCSV);
router.post('/save-report', saveAnalyticsReport);
router.get('/recent', getRecentAnalytics);

export default router;
