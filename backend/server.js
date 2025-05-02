const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 38765; // Random high port number

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from the frontend
  credentials: true
}));
app.use(express.json());

// API Routes
app.get('/api/modules', (req, res) => {
  try {
    const modulesPath = path.join(__dirname, 'src/data/modules.json');
    const modulesData = JSON.parse(fs.readFileSync(modulesPath, 'utf8'));
    res.json(modulesData);
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ message: 'Error fetching modules' });
  }
});

app.get('/api/modules/:id', (req, res) => {
  try {
    const moduleId = req.params.id;
    const modulePath = path.join(__dirname, `src/data/modules/${moduleId}.json`);
    
    if (!fs.existsSync(modulePath)) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    const moduleData = JSON.parse(fs.readFileSync(modulePath, 'utf8'));
    res.json(moduleData);
  } catch (error) {
    console.error(`Error fetching module ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error fetching module' });
  }
});

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Anything that doesn't match the above, send back the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Frontend available at http://localhost:${PORT}`);
});
