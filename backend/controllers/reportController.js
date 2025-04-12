const Report = require('../models/reportModel');

// Create new report
const createReport = async (req, res) => {
  try {
    const { medicineName, manufacturer, batchNumber, purchaseLocation, issueDescription } = req.body;
    
    const report = await Report.create({
      user: req.user._id,
      medicineName,
      manufacturer,
      batchNumber,
      purchaseLocation,
      issueDescription,
      evidenceImage: req.file ? req.file.path : null,
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get user's reports
const getUserReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user._id }).sort('-createdAt');
    res.json(reports);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all reports (admin only)
const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().populate('user', 'name email').sort('-createdAt');
    res.json(reports);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update report status (admin only)
const updateReportStatus = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (report) {
      report.status = req.body.status;
      const updatedReport = await report.save();
      res.json(updatedReport);
    } else {
      res.status(404).json({ message: 'Report not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createReport,
  getUserReports,
  getAllReports,
  updateReportStatus,
};