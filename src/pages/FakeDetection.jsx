import { useState } from 'react';
import { motion } from 'framer-motion';
import ImageUploader from '../components/ImageUploader';

const FakeDetection = () => {
  const [image, setImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const handleImageCapture = (imageData) => {
    setImage(imageData);
  };
  
  const handleAnalyze = () => {
    // This is a placeholder for the actual analysis functionality
    // You mentioned you'll provide details on this later
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      // Here you would display the results
      alert("Analysis complete! This is a placeholder for the actual functionality.");
    }, 2000);
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
        
        <div className="instructions">
          <h3>How to use this feature:</h3>
          <ol>
            <li>Upload an image of your medicine or take a photo using your camera</li>
            <li>Make sure the medicine is clearly visible and well-lit</li>
            <li>Click "Analyze Medicine" to verify its authenticity</li>
            <li>Review the results to determine if your medicine is genuine</li>
          </ol>
          <p className="note">Note: This feature is currently in development. More details will be provided soon.</p>
        </div>
      </div>
    </div>
  );
};

export default FakeDetection;