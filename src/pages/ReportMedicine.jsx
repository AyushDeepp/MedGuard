import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const ReportMedicine = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    medicineName: '',
    manufacturer: '',
    batchNumber: '',
    purchaseLocation: '',
    issueDescription: '',
    evidenceImage: null
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        evidenceImage: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      const response = await axios.post(
        'http://localhost:5000/api/reports',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${user.token}`
          }
        }
      );

      setMessage({
        type: 'success',
        text: 'Report submitted successfully. Thank you for helping keep our community safe!'
      });
      setFormData({
        medicineName: '',
        manufacturer: '',
        batchNumber: '',
        purchaseLocation: '',
        issueDescription: '',
        evidenceImage: null
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to submit report. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="report-medicine-container">
      <motion.div 
        className="report-form-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Report Suspicious Medicine</h1>
        <p>Help us protect others by reporting suspicious or counterfeit medicines</p>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="report-form">
          <div className="form-group">
            <label htmlFor="medicineName">Medicine Name*</label>
            <input
              type="text"
              id="medicineName"
              name="medicineName"
              value={formData.medicineName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="manufacturer">Manufacturer</label>
            <input
              type="text"
              id="manufacturer"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="batchNumber">Batch Number</label>
            <input
              type="text"
              id="batchNumber"
              name="batchNumber"
              value={formData.batchNumber}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="purchaseLocation">Purchase Location*</label>
            <input
              type="text"
              id="purchaseLocation"
              name="purchaseLocation"
              value={formData.purchaseLocation}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="issueDescription">Description of Issue*</label>
            <textarea
              id="issueDescription"
              name="issueDescription"
              value={formData.issueDescription}
              onChange={handleChange}
              rows="4"
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="evidenceImage">Upload Evidence (if available)</label>
            <input
              type="file"
              id="evidenceImage"
              name="evidenceImage"
              onChange={handleImageChange}
              accept="image/*"
            />
          </div>

          <motion.button
            type="submit"
            className="submit-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default ReportMedicine;