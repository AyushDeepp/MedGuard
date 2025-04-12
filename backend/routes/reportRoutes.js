const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/reports');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Import report controller functions here
const {
  createReport,
  getUserReports,
  getAllReports,
  updateReportStatus,
} = require('../controllers/reportController');

router.post('/', protect, upload.single('evidenceImage'), createReport);
router.get('/user', protect, getUserReports);
router.get('/', protect, getAllReports);
router.put('/:id/status', protect, updateReportStatus);

module.exports = router;