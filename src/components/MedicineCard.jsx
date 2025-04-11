import { motion } from 'framer-motion';

const MedicineCard = ({ medicine, isCompact = false }) => {
  if (!medicine) return null;
  
  // Helper function to get field value with fallbacks
  const getField = (possibleKeys, defaultValue = 'N/A') => {
    for (const key of possibleKeys) {
      if (medicine[key] && medicine[key].trim() !== '') {
        return medicine[key];
      }
    }
    return defaultValue;
  };
  
  // Determine field names based on available data
  const name = getField(['name', 'medicine_name', 'drug_name', 'Name', 'Medicine', 'Drug']);
  const manufacturer = getField(['manufacturer', 'company', 'Manufacturer', 'Company','manufacturer_name']);
  const price = getField(['price', 'mrp', 'Price', 'MRP','price(₹)']);
  const type = getField(['type', 'form', 'Type', 'Form']);
  const packsize = getField(['packsize', 'pack_size', 'Packsize', 'Pack Size','pack_size_label']);
  const composition = getField(['composition', 'ingredients', 'Composition', 'Ingredients','short_composition1']);
  const composition2 = getField(['composition', 'ingredients', 'Composition', 'Ingredients','short_composition2']);
  const discontinued = getField(['discontinued', 'Discontinued','Is_discontinued']);
  
  // Improved check for discontinued status
  const isDiscontinued = () => {
    const value = discontinued.toLowerCase();
    return value === 'yes' || value === 'true' || value === '1' || value === 'y';
  };
  
  return (
    <motion.div 
      className={`medicine-card ${isCompact ? 'compact' : ''}`}
      whileHover={{ scale: isCompact ? 1.03 : 1 }}
    >
      {isCompact ? (
        // Compact view for search results
        <div className="medicine-card-content">
          <h3>{name}</h3>
          <p>Manufacturer: {manufacturer}</p>
          <p>Price: ₹{price}</p>
        </div>
      ) : (
        // Detailed view for selected medicine
        <div className="medicine-card-content">
          <div className="medicine-header">
            <h2>{name}</h2>
            <span className={`status-badge ${isDiscontinued() ? 'discontinued' : 'available'}`}>
              {isDiscontinued() ? 'Discontinued' : 'Available'}
            </span>
          </div>
          
          <div className="medicine-details">
            <div className="detail-row">
              <span className="detail-label">Manufacturer:</span>
              <span className="detail-value">{manufacturer}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Price:</span>
              <span className="detail-value">₹{price}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Type:</span>
              <span className="detail-value">{type}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Pack size:</span>
              <span className="detail-value">{packsize}</span>
            </div>
            
            <div className="detail-row composition">
              <span className="detail-label">Composition:</span>
              <span className="detail-value">{composition}</span>
            </div>

            <div className="detail-row composition">
              <span className="detail-label">Composition 2:</span>
              <span className="detail-value">{composition2}</span>
            </div>
            
            {/* <div className="detail-row all-fields">
              <details>
                <summary>All Available Data</summary>
                <pre>{JSON.stringify(medicine, null, 2)}</pre>
              </details>
            </div> */}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MedicineCard;