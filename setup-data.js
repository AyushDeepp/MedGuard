import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory (ES modules don't have __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'backend', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('Created data directory in backend folder');
}

// Check if CSV file exists in project root
const sourcePath = path.join(__dirname, 'A_Z_medicines_dataset_of_India.csv');
const destPath = path.join(dataDir, 'A_Z_medicines_dataset_of_India.csv');

if (fs.existsSync(sourcePath)) {
  // Copy the file to backend/data
  fs.copyFileSync(sourcePath, destPath);
  console.log('CSV file copied to backend/data folder');
} else {
  console.error('CSV file not found in project root. Please place the A_Z_medicines_dataset_of_India.csv file in the project root directory.');
}