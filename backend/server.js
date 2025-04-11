const express = require('express');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const multer = require('multer');
const { createWorker } = require('tesseract.js');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

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

// Add this endpoint to your server.js file

// OCR and medicine verification endpoint
app.post('/api/medicines/ocr-verify', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('Processing image for OCR:', req.file.path);
    
    // Initialize Tesseract worker with the current API
    const worker = await createWorker('eng');
    
    // Set additional OCR parameters for better text recognition
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,()-',
      preserve_interword_spaces: '1',
    });
    
    // Recognize text - using the current API
    const { data } = await worker.recognize(req.file.path);
    const extractedText = data.text;
    
    // Terminate worker
    await worker.terminate();
    
    console.log('Extracted text:', extractedText);
    
    // Extract potential medicine name from the text
    const medicineName = extractMedicineName(extractedText);
    
    if (!medicineName || medicineName.trim().length < 3) {
      return res.status(400).json({ 
        error: 'Could not identify a valid medicine name in the image',
        extractedText 
      });
    }
    
    // Search for the medicine in the database
    const searchTerm = medicineName.toLowerCase().trim();
    
    // Determine which field to use for medicine name
    const sampleMedicine = medicinesData.length > 0 ? medicinesData[0] : {};
    const availableFields = Object.keys(sampleMedicine);
    
    const nameField = availableFields.find(field => 
      field.toLowerCase().includes('name') || 
      field.toLowerCase() === 'medicine' || 
      field.toLowerCase() === 'drug'
    ) || availableFields[0];
    
    console.log(`Verifying medicine "${searchTerm}" in field "${nameField}"`);
    
    const results = medicinesData.filter(medicine => {
      if (!medicine[nameField]) return false;
      return medicine[nameField].toLowerCase().includes(searchTerm);
    });
    
    const isGenuine = results.length > 0;
    
    console.log(`Medicine "${searchTerm}" verification result: ${isGenuine ? 'Genuine' : 'Potentially fake'}`);
    
    // Clean up the uploaded file
    fs.unlinkSync(req.file.path);
    
    res.json({
      isGenuine,
      medicineName: searchTerm,
      extractedText,
      matchCount: results.length,
      matches: results.slice(0, 5) // Return up to 5 matches
    });
    
  } catch (error) {
    console.error('OCR Error:', error);
    res.status(500).json({ error: 'Error processing image: ' + error.message });
  }
});

// Function to extract medicine name from OCR text
function extractMedicineName(text) {
  if (!text) return null;
  
  console.log('Attempting to extract medicine name from:', text);
  
  // Preprocess text - remove extra spaces, normalize text
  text = text.replace(/\s+/g, ' ').trim();
  
  // Split text into lines and process
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  if (lines.length === 0) return null;
  
  // Common medicine name patterns and keywords
  const medicineKeywords = ['tablet', 'capsule', 'syrup', 'injection', 'ointment', 'cream', 'suspension', 'solution', 'drops'];
  const commonMedicineWords = ['paracetamol', 'ibuprofen', 'aspirin', 'amoxicillin', 'crocin', 'dolo', 'calpol', 'azithromycin', 'metformin'];
  
  // Check for common medicine names directly in the text
  for (const commonMed of commonMedicineWords) {
    const regex = new RegExp(`\\b${commonMed}\\b`, 'i');
    if (regex.test(text)) {
      console.log('Found common medicine name:', commonMed);
      return commonMed;
    }
  }
  
  // First approach: Look for lines with dosage information (e.g., 500mg)
  for (const line of lines) {
    // Look for lines with mg, mcg, ml patterns which often indicate medicine names with strength
    if (/\d+\s*(mg|mcg|ml|g)\b/i.test(line)) {
      // Extract the part before the strength
      const match = line.match(/^([A-Za-z\s\-]+)/i);
      if (match && match[1] && match[1].trim().length >= 3) {
        const name = match[1].trim();
        console.log('Found medicine name with dosage pattern:', name);
        return name;
      }
    }
  }
  
  // Second approach: Look for lines containing medicine keywords
  for (const line of lines) {
    for (const keyword of medicineKeywords) {
      if (line.toLowerCase().includes(keyword)) {
        // Extract the part before the keyword
        const parts = line.toLowerCase().split(keyword);
        if (parts[0] && parts[0].trim().length >= 3) {
          const name = parts[0].trim();
          console.log('Found medicine name with keyword pattern:', name);
          return name;
        }
      }
    }
  }
  
  // Third approach: Check for words that look like medicine names (all caps or title case words)
  for (const line of lines) {
    // Check for ALL CAPS words (common for medicine brand names)
    const allCapsMatch = line.match(/\b[A-Z]{3,}\b/);
    if (allCapsMatch) {
      const name = allCapsMatch[0];
      console.log('Found potential medicine name in ALL CAPS:', name);
      return name;
    }
    
    // Check for Title Case words (also common for medicine names)
    const titleCaseMatch = line.match(/\b[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]+)*\b/);
    if (titleCaseMatch) {
      const name = titleCaseMatch[0];
      console.log('Found potential medicine name in Title Case:', name);
      return name;
    }
  }
  
  // Fourth approach: Check if any line matches with medicines in our database
  // This is more computationally expensive but can be more accurate
  for (const line of lines) {
    if (line.trim().length >= 3) {
      // Try to match each word in the line
      const words = line.trim().split(/\s+/);
      for (const word of words) {
        if (word.length < 3) continue; // Skip short words
        
        const searchTerm = word.toLowerCase();
        
        // Determine which field to use for medicine name
        const sampleMedicine = medicinesData.length > 0 ? medicinesData[0] : {};
        const availableFields = Object.keys(sampleMedicine);
        
        const nameField = availableFields.find(field => 
          field.toLowerCase().includes('name') || 
          field.toLowerCase() === 'medicine' || 
          field.toLowerCase() === 'drug'
        ) || availableFields[0];
        
        // Check if this word matches any medicine in our database
        const matches = medicinesData.some(medicine => {
          if (!medicine[nameField]) return false;
          return medicine[nameField].toLowerCase().includes(searchTerm);
        });
        
        if (matches) {
          console.log('Found medicine name by database match:', word);
          return word;
        }
      }
    }
  }
  
  // Fifth approach: Try to extract the most prominent word from the first few lines
  // This is a fallback approach
  const firstFewLines = lines.slice(0, 3).join(' ');
  const words = firstFewLines.split(/\s+/).filter(word => word.length >= 3);
  
  if (words.length > 0) {
    // Sort words by length (longer words are more likely to be medicine names)
    words.sort((a, b) => b.length - a.length);
    console.log('Using most prominent word as medicine name:', words[0]);
    return words[0];
  }
  
  // Last resort: just return the first line if it's long enough
  if (lines[0].trim().length >= 3) {
    console.log('Using first line as medicine name:', lines[0].trim());
    return lines[0].trim();
  }
  
  console.log('Could not extract medicine name from text');
  return null;
}

// Verify medicine by name
app.post('/api/medicines/verify', (req, res) => {
  const { medicineName } = req.body;
  
  if (!medicineName || medicineName.trim().length < 3) {
    return res.status(400).json({ error: 'Medicine name must be at least 3 characters' });
  }
  
  const searchTerm = medicineName.toLowerCase().trim();
  
  // Determine which field to use for medicine name
  const sampleMedicine = medicinesData.length > 0 ? medicinesData[0] : {};
  const availableFields = Object.keys(sampleMedicine);
  
  const nameField = availableFields.find(field => 
    field.toLowerCase().includes('name') || 
    field.toLowerCase() === 'medicine' || 
    field.toLowerCase() === 'drug'
  ) || availableFields[0];
  
  console.log(`Verifying medicine "${searchTerm}" in field "${nameField}"`);
  
  const results = medicinesData.filter(medicine => {
    if (!medicine[nameField]) return false;
    return medicine[nameField].toLowerCase().includes(searchTerm);
  });
  
  const isGenuine = results.length > 0;
  
  console.log(`Medicine "${searchTerm}" verification result: ${isGenuine ? 'Genuine' : 'Potentially fake'}`);
  
  res.json({
    isGenuine,
    medicineName: searchTerm,
    matchCount: results.length,
    matches: results.slice(0, 5) // Return up to 5 matches
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});