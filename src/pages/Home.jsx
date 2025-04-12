import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const Home = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  useEffect(() => {
    // Check if the hero image exists
    const img = new Image();
    img.src = '/src/assets/WhatsApp Image 2023-09-17 at 11.26.32 AM.jpeg';
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageLoaded(false);
  }, []);

  return (
    <div className="home-container">
      <section className={`hero-section ${imageLoaded ? 'with-image' : ''}`}>
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1>Verify Your Medicines</h1>
          <p>Ensuring your safety with authentic medication verification</p>
          <div className="hero-buttons">
            <motion.button 
              className="primary-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/medicine-details'}
            >
              Search Medicines
            </motion.button>
            <motion.button 
              className="secondary-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/fake-detection'}
            >
              Detect Fake Medicines
            </motion.button>
          </div>
        </motion.div>
      </section>

      <section className="features-section">
        <h2>Our Features</h2>
        <div className="features-grid">
          <motion.div 
            className="feature-card"
            whileHover={{ y: -10 }}
          >
            <div className="feature-icon">
              <i className="fas fa-search"></i>
            </div>
            <h3>Medicine Information</h3>
            <p>Search for detailed information about any medicine including composition, manufacturer, and pricing.</p>
          </motion.div>

          <motion.div 
            className="feature-card"
            whileHover={{ y: -10 }}
          >
            <div className="feature-icon">
              <i className="fas fa-barcode"></i>
            </div>
            <h3>Barcode Scanning</h3>
            <p>Quickly scan medicine barcodes to verify authenticity and get detailed information.</p>
          </motion.div>

          <motion.div 
            className="feature-card"
            whileHover={{ y: -10 }}
          >
            <div className="feature-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Report Suspicious Medicines</h3>
            <p>Help protect others by reporting suspicious or counterfeit medicines you encounter.</p>
          </motion.div>
        </div>
      </section>

      <section className="about-section">
        <div className="about-content">
          <h2>Why MedGuard?</h2>
          <p>
            Counterfeit medicines pose a serious threat to public health. They may contain harmful ingredients, 
            incorrect dosages, or no active ingredients at all. MediVerify helps you ensure that the medicines 
            you consume are genuine and safe.
          </p>
          <p>
            Our platform uses advanced technology to verify medicine authenticity through barcode scanning 
            and image recognition, providing you with peace of mind about your medication.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;