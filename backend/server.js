const express = require('express');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Store medicines data
let medicinesData = [];

// Load CSV data on server start
fs.createReadStream(path.join(__dirname, 'data', 'A_Z_medicines_dataset_of_India.csv'))
  .pipe(csv())
  .on('data', (data) => medicinesData.push(data))
  .on('end', () => {
    console.log('CSV data loaded successfully');
  });

// API Routes
app.get('/api/medicines', (req, res) => {
  res.json(medicinesData);
});

// Search medicine by name
app.get('/api/medicines/search', (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }
  
  const results = medicinesData.filter(medicine => 
    medicine.name && medicine.name.toLowerCase().includes(query.toLowerCase())
  );
  
  res.json(results);
});

// Get medicine by barcode
app.get('/api/medicines/barcode/:code', (req, res) => {
  const { code } = req.params;
  
  // In a real app, you would match the barcode to the medicine
  // For demo purposes, we'll return a medicine based on the first digits of the barcode
  const index = parseInt(code.substring(0, 3)) % medicinesData.length;
  res.json(medicinesData[index] || { error: 'Medicine not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});