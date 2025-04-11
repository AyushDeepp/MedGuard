import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Webcam from 'react-webcam';

const ImageUploader = ({ onImageCapture }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const fileInputRef = useRef(null);
  const webcamRef = useRef(null);
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onImageCapture(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCameraCapture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      onImageCapture(imageSrc);
      setIsCameraActive(false);
    }
  };
  
  return (
    <div className="image-uploader">
      <div className="uploader-tabs">
        <motion.button 
          className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('upload');
            setIsCameraActive(false);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Upload Image
        </motion.button>
        
        <motion.button 
          className={`tab-button ${activeTab === 'camera' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('camera');
            setIsCameraActive(true);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Take Photo
        </motion.button>
      </div>
      
      <div className="uploader-content">
        {activeTab === 'upload' && (
          <div className="upload-area">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            
            <motion.div 
              className="dropzone"
              whileHover={{ scale: 1.02 }}
              onClick={() => fileInputRef.current.click()}
            >
              <div className="dropzone-content">
                <i className="fas fa-cloud-upload-alt"></i>
                <p>Click to upload or drag and drop</p>
                <span>Supports JPG, PNG</span>
              </div>
            </motion.div>
          </div>
        )}
        
        {activeTab === 'camera' && (
          <div className="camera-area">
            {isCameraActive ? (
              <>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    facingMode: "environment"
                  }}
                  className="webcam"
                />
                
                <motion.button 
                  className="capture-button"
                  onClick={handleCameraCapture}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Take Photo
                </motion.button>
              </>
            ) : (
              <motion.button 
                className="start-camera-button"
                onClick={() => setIsCameraActive(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Camera
              </motion.button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;