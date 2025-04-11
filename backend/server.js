const express = require('express');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Store medicines data
let medicinesData = [];

// Load CSV data on server start
fs.createReadStream(path.join(__dirname, 'data', 'A_Z_medicines_dataset_of_India.csv'))
  .pipe(csv())
  .on('data', (data) => {
    // Clean and normalize the data
    const cleanedData = {};
    Object.keys(data).forEach(key => {
      // Remove BOM characters and trim whitespace
      const cleanKey = key.replace(/^\uFEFF/, '').trim();
      cleanedData[cleanKey] = data[key].trim();
    });
    medicinesData.push(cleanedData);
  })
  .on('end', () => {
    console.log(`CSV data loaded successfully. Loaded ${medicinesData.length} medicines.`);
    // Log the first item to check structure
    // if (medicinesData.length > 0) {
    //   console.log('Sample medicine data:', medicinesData[0]);
    //   console.log('Available fields:', Object.keys(medicinesData[0]));
    // }
  });

// API Routes
app.get('/api/medicines', (req, res) => {
  res.json(medicinesData.slice(0, 100)); // Limit to first 100 for performance
});

// Search medicine by name
app.get('/api/medicines/search', (req, res) => {
  const { query } = req.query;
  if (!query || query.trim().length < 3) {
    return res.status(400).json({ error: 'Search query must be at least 3 characters' });
  }
  
  const searchTerm = query.toLowerCase().trim();
  
  // Check what fields are available in the data
  const sampleMedicine = medicinesData.length > 0 ? medicinesData[0] : {};
  const availableFields = Object.keys(sampleMedicine);
  
  // Determine which field to use for medicine name
  const nameField = availableFields.find(field => 
    field.toLowerCase().includes('name') || 
    field.toLowerCase() === 'medicine' || 
    field.toLowerCase() === 'drug'
  ) || availableFields[0];
  
  console.log(`Searching for "${searchTerm}" in field "${nameField}"`);
  
  const results = medicinesData.filter(medicine => {
    if (!medicine[nameField]) return false;
    return medicine[nameField].toLowerCase().includes(searchTerm);
  }).slice(0, 20); // Limit to 20 results for performance
  
  console.log(`Found ${results.length} results`);
  
  res.json(results);
});

// Get medicine by barcode
app.get('/api/medicines/barcode/:code', (req, res) => {
  const { code } = req.params;
  
  // In a real app, you would match the barcode to the medicine
  // For demo purposes, we'll return a medicine based on the first digits of the barcode
  const index = parseInt(code.substring(0, 3)) % medicinesData.length;
  const medicine = medicinesData[index] || null;
  
  if (!medicine) {
    return res.status(404).json({ error: 'Medicine not found' });
  }
  
  res.json(medicine);
});

// User routes
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});