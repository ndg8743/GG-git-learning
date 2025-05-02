const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
