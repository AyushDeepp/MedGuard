import { motion } from 'framer-motion';

const MedicineCard = ({ medicine, isCompact = false }) => {
  if (!medicine) return null;
  
  return (
    <motion.div 
      className={`medicine-card ${isCompact ? 'compact' : ''}`}
      whileHover={{ scale: isCompact ? 1.03 : 1 }}
    >
      {isCompact ? (
        // Compact view for search results
        <div className="medicine-card-content">
          <h3>{medicine.name || 'Unknown Medicine'}</h3>
          <p>Manufacturer: {medicine.manufacturer || 'Unknown'}</p>
          <p>Price: ₹{medicine.price || 'N/A'}</p>
        </div>
      ) : (
        // Detailed view for selected medicine
        <div className="medicine-card-content">
          <div className="medicine-header">
            <h2>{medicine.name || 'Unknown Medicine'}</h2>
            <span className={`status-badge ${medicine.discontinued === 'Yes' ? 'discontinued' : 'available'}`}>
              {medicine.discontinued === 'Yes' ? 'Discontinued' : 'Available'}
            </span>
          </div>
          
          <div className="medicine-details">
            <div className="detail-row">
              <span className="detail-label">Manufacturer:</span>
              <span className="detail-value">{medicine.manufacturer || 'Unknown'}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Price:</span>
              <span className="detail-value">₹{medicine.price || 'N/A'}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Type:</span>
              <span className="detail-value">{medicine.type || 'N/A'}</span>
            </div>
            
            <div className="detail-row composition">
              <span className="detail-label">Composition:</span>
              <span className="detail-value">{medicine.composition || 'Not available'}</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MedicineCard;