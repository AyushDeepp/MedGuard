import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import MedicineCard from '../components/MedicineCard';
import BarcodeScanner from '../components/BarcodeScanner';
import ImageUploader from '../components/ImageUploader';

const FakeDetection = () => {
  const [image, setImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [barcodeValue, setBarcodeValue] = useState('');
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [extractedText, setExtractedText] = useState('');

  // Load scan history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('scanHistory');
    if (savedHistory) {
      try {
        setScanHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error parsing scan history:', e);
      }
    }
  }, []);

  // Save scan history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('scanHistory', JSON.stringify(scanHistory));
  }, [scanHistory]);

  const handleImageCapture = (imageData) => {
    setImage(imageData);
    // Reset previous analysis results when a new image is captured
    setAnalysisResult(null);
    setExtractedText('');
  };
  
  const handleAnalyze = async () => {
    if (!image) {
      setError('Please upload or capture an image first');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    
    try {
      // Convert base64 image to file object
      const imageFile = dataURLtoFile(image, 'medicine_image.jpg');
      
      // Create form data for the API request
      const formData = new FormData();
      formData.append('image', imageFile);
      
      // Send the image to the backend for OCR and verification
      const response = await axios.post('http://localhost:5000/api/medicines/ocr-verify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const { isGenuine, medicineName, extractedText, matches } = response.data;
      
      setExtractedText(extractedText);
      
      setAnalysisResult({
        isGenuine,
        message: isGenuine 
          ? `Medicine verified as genuine. Found in government database.`
          : `FRAUD DETECTED: Medicine not found in government database.`,
        medicineName
      });
      
      // If medicine is genuine, set the first match as the medicine details
      if (isGenuine && matches && matches.length > 0) {
        setMedicine(matches[0]);
      } else {
        setMedicine(null);
      }
      
    } catch (err) {
      console.error('Error during analysis:', err);
      setError(err.response?.data?.error || 'An error occurred during analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper function to convert base64 to file
  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  };
  
  const handleBarcodeChange = (e) => {
    setBarcodeValue(e.target.value);
  };

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    if (!barcodeValue.trim()) {
      setError('Please enter a barcode');
      return;
    }
    
    fetchMedicineByBarcode(barcodeValue);
  };

  const handleBarcodeScan = (scannedBarcode) => {
    setBarcodeValue(scannedBarcode);
    setShowScanner(false);
    fetchMedicineByBarcode(scannedBarcode);
  };

  const fetchMedicineByBarcode = async (barcode) => {
    setLoading(true);
    setError('');
    setMedicine(null);
    
    try {
      const response = await axios.get(`http://localhost:5000/api/medicines/barcode/${barcode}`);
      setMedicine(response.data);
      
      // Add to scan history if not already present
      const timestamp = new Date().toISOString();
      const newScan = { 
        barcode, 
        medicineName: response.data.name || response.data.medicine_name || 'Unknown Medicine',
        timestamp 
      };
      
      setScanHistory(prevHistory => {
        // Check if this barcode is already in history
        const exists = prevHistory.some(item => item.barcode === barcode);
        if (!exists) {
          // Keep only the 10 most recent scans
          return [newScan, ...prevHistory].slice(0, 10);
        }
        return prevHistory;
      });
      
    } catch (err) {
      console.error('Error fetching medicine:', err);
      setError('Failed to fetch medicine details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearScanHistory = () => {
    setScanHistory([]);
    localStorage.removeItem('scanHistory');
  };

  return (
    <div className="fake-detection-container">
      <motion.div 
        className="detection-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Fake Medicine Detection</h1>
        <p>Upload or take a photo of your medicine to verify its authenticity</p>
      </motion.div>
      
      <div className="detection-content">
        <ImageUploader onImageCapture={handleImageCapture} />
        
        {image && (
          <motion.div 
            className="preview-section"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3>Image Preview</h3>
            <div className="image-preview">
              <img src={image} alt="Medicine preview" />
            </div>
            
            <motion.button 
              className="analyze-button"
              onClick={handleAnalyze}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Medicine'}
            </motion.button>
          </motion.div>
        )}
        
        {/* Analysis Results Section */}
        {analysisResult && (
          <motion.div 
            className={`analysis-results ${analysisResult.isGenuine ? 'genuine' : 'fake'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3>Analysis Results</h3>
            
            <div className="result-status">
              {analysisResult.isGenuine ? (
                <div className="genuine-badge">
                  <i className="fas fa-check-circle"></i>
                  <span>GENUINE MEDICINE</span>
                </div>
              ) : (
                <div className="fake-badge">
                  <i className="fas fa-exclamation-triangle"></i>
                  <span>FRAUD DETECTED</span>
                </div>
              )}
            </div>
            
            <p className="result-message">{analysisResult.message}</p>
            
            {/* {extractedText && (
              <div className="extracted-text">
                <h4>Extracted Text:</h4>
                <pre>{extractedText}</pre>
              </div>
            )} */}
            
            {/* {medicine && analysisResult.isGenuine && (
              <div className="medicine-details">
                <h4>Medicine Information:</h4>
                <MedicineCard medicine={medicine} />
              </div>
            )} */}
          </motion.div>
        )}
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="instructions">
          <h3>How to use this feature:</h3>
          <ol>
            <li>Upload an image of your medicine or take a photo using your camera</li>
            <li>Make sure the medicine name is clearly visible and well-lit</li>
            <li>Click "Analyze Medicine" to verify its authenticity</li>
            <li>Review the results to determine if your medicine is genuine</li>
          </ol>
          <p className="note">Note: For best results, ensure the medicine name is clearly visible in the image.</p>
        </div>
      </div>
    </div>
  );
};

export default FakeDetection;