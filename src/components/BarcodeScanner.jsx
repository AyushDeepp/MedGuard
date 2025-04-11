import { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion } from 'framer-motion';

const BarcodeScanner = ({ onScan, onError, onClose }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [scannerInstance, setScannerInstance] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Get available cameras
    Html5Qrcode.getCameras()
      .then(devices => {
        if (devices && devices.length) {
          setCameras(devices);
          setSelectedCamera(devices[0].id);
        } else {
          setError('No camera devices found');
        }
      })
      .catch(err => {
        setError('Error getting cameras: ' + err.message);
        if (onError) onError(err);
      });

    // Cleanup on unmount
    return () => {
      if (scannerInstance) {
        scannerInstance.stop().catch(err => console.error('Error stopping scanner:', err));
      }
    };
  }, [onError]);

  const startScanner = () => {
    if (!selectedCamera) {
      setError('Please select a camera');
      return;
    }

    setError('');
    const html5QrCode = new Html5Qrcode('reader');
    setScannerInstance(html5QrCode);

    html5QrCode
      .start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Success callback
          if (onScan) {
            onScan(decodedText);
          }
          // Optionally stop scanning after successful scan
          // html5QrCode.stop().catch(err => console.error('Error stopping scanner:', err));
        },
        (errorMessage) => {
          // Error callback - ignore frequent errors during scanning
          if (errorMessage.includes('No MultiFormat Readers')) {
            setError('This browser may not fully support barcode scanning');
          }
        }
      )
      .then(() => {
        setIsStarted(true);
      })
      .catch((err) => {
        setError('Error starting scanner: ' + err.message);
        if (onError) onError(err);
      });
  };

  const stopScanner = () => {
    if (scannerInstance) {
      scannerInstance
        .stop()
        .then(() => {
          setIsStarted(false);
        })
        .catch((err) => {
          console.error('Error stopping scanner:', err);
        });
    }
  };

  const handleCameraChange = (e) => {
    setSelectedCamera(e.target.value);
  };

  return (
    <motion.div 
      className="barcode-scanner-container"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="scanner-header">
        <h2>Scan Medicine Barcode</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      {error && <div className="scanner-error">{error}</div>}

      <div className="camera-selection">
        <label htmlFor="camera-select">Select Camera:</label>
        <select 
          id="camera-select" 
          value={selectedCamera} 
          onChange={handleCameraChange}
          disabled={isStarted}
        >
          {cameras.map(camera => (
            <option key={camera.id} value={camera.id}>
              {camera.label || `Camera ${camera.id}`}
            </option>
          ))}
        </select>
      </div>

      <div id="reader" className="scanner-viewport"></div>

      <div className="scanner-controls">
        {!isStarted ? (
          <motion.button 
            className="start-button"
            onClick={startScanner}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Scanner
          </motion.button>
        ) : (
          <motion.button 
            className="stop-button"
            onClick={stopScanner}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Stop Scanner
          </motion.button>
        )}
      </div>

      <div className="scanner-instructions">
        <p>Position the barcode within the scanner frame.</p>
        <p>Make sure the barcode is well-lit and clearly visible.</p>
      </div>
    </motion.div>
  );
};

export default BarcodeScanner;