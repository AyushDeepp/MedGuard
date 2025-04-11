import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import BarcodeScanner from '../components/BarcodeScanner';
import MedicineCard from '../components/MedicineCard';

const MedicineDetails = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  // Real-time search with debounce
  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    if (searchQuery.trim().length > 2) {
      setLoading(true);
      const timeout = setTimeout(() => {
        handleSearch();
      }, 300); // 300ms debounce
      
      setDebounceTimeout(timeout);
    } else if (searchQuery.trim().length === 0) {
      setSearchResults([]);
    }
    
    return () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
    };
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setLoading(false);
      return;
    }
    
    setError('');
    
    try {
      const response = await axios.get(`http://localhost:5000/api/medicines/search?query=${searchQuery}`);
      setSearchResults(response.data);
      setSelectedMedicine(null);
    } catch (err) {
      setError('Failed to fetch medicine data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeDetected = async (barcode) => {
    setIsScanning(false);
    setLoading(true);
    
    try {
      const response = await axios.get(`http://localhost:5000/api/medicines/barcode/${barcode}`);
      setSelectedMedicine(response.data);
      setSearchResults([]);
    } catch (err) {
      setError('Failed to fetch medicine data from barcode. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="medicine-details-container">
      <motion.div 
        className="search-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Medicine Details</h1>
        <p>Search for medicines by name or scan barcode to get detailed information</p>
        
        <div className="search-options">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Enter medicine name..."
              value={searchQuery}
              onChange={handleInputChange}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <button 
                className="clear-button"
                onClick={() => setSearchQuery('')}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
          
          <div className="or-divider">OR</div>
          
          <motion.button 
            className="scan-button"
            onClick={() => setIsScanning(!isScanning)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isScanning ? 'Cancel Scan' : 'Scan Barcode'}
          </motion.button>
        </div>
        
        {isScanning && (
          <motion.div 
            className="scanner-container"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <BarcodeScanner onDetected={handleBarcodeDetected} />
          </motion.div>
        )}
        
        {error && <div className="error-message">{error}</div>}
      </motion.div>

      <div className="results-section">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Searching medicines...</p>
          </div>
        ) : (
          <>
            {selectedMedicine && (
              <motion.div 
                className="selected-medicine"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h2>Medicine Information</h2>
                <MedicineCard medicine={selectedMedicine} />
              </motion.div>
            )}
            
            {searchResults.length > 0 && !selectedMedicine && (
              <div className="search-results">
                <h2>Search Results</h2>
                <div className="results-grid">
                  {searchResults.map((medicine, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      onClick={() => setSelectedMedicine(medicine)}
                    >
                      <MedicineCard medicine={medicine} isCompact={true} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            {!selectedMedicine && searchResults.length === 0 && searchQuery.trim().length > 2 && !loading && (
              <div className="no-results">
                <h3>No medicines found matching "{searchQuery}"</h3>
                <p>Try a different search term or scan the barcode</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MedicineDetails;