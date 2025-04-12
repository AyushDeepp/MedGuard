const mongoose = require('mongoose');

const reportSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    medicineName: {
      type: String,
      required: true,
    },
    manufacturer: String,
    batchNumber: String,
    purchaseLocation: {
      type: String,
      required: true,
    },
    issueDescription: {
      type: String,
      required: true,
    },
    evidenceImage: String,
    status: {
      type: String,
      enum: ['pending', 'investigating', 'resolved'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;