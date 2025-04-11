import { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import JsBarcode from 'jsbarcode';

const BarcodeScanner = ({ onDetected }) => {
  const webcamRef = useRef(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState('');
  
  // This is a simplified simulation of barcode detection
  // In a real app, you would use a proper barcode scanning library
  const captureAndProcessFrame = () => {
    if (webcamRef.current && isCameraReady) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        // Simulate barcode detection (in a real app, use a proper library)
        // For demo purposes, we'll generate a random barcode
        const randomBarcode = Math.floor(Math.random() * 1000000000000).toString();
        onDetected(randomBarcode);
      }
    }
  };
  
  return (
    <div className="barcode-scanner">
      <div className="scanner-wrapper">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            facingMode: "environment"
          }}
          onUserMedia={() => setIsCameraReady(true)}
          onUserMediaError={(err) => {
            setError('Camera access denied or not available');
            console.error(err);
          }}
          className="webcam"
        />
        
        {isCameraReady && (
          <div className="scanner-overlay">
            <div className="scanner-target"></div>
          </div>
        )}
      </div>
      
      {error && <div className="scanner-error">{error}</div>}
      
      <motion.button 
        className="capture-button"
        onClick={captureAndProcessFrame}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={!isCameraReady}
      >
        Scan Barcode
      </motion.button>
      
      <p className="scanner-instructions">
        Position the barcode within the frame and click the button to scan
      </p>
    </div>
  );
};

export default BarcodeScanner;