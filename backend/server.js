const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process'); 
const crypto = require('crypto');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 54321; // Random high port number
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret';

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from the frontend
  credentials: true
}));
app.use(express.json());

// API Routes
app.get('/git/api/modules', (req, res) => {
  try {
    const modulesPath = path.join(__dirname, 'src/data/modules.json');
    const modulesData = JSON.parse(fs.readFileSync(modulesPath, 'utf8'));
    res.json(modulesData);
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ message: 'Error fetching modules' });
  }
});

app.get('/git/api/modules/:id', (req, res) => {
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

app.get('/git/manifest.json', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/manifest.json'));
});

// Webhook endpoint for GitHub
app.post('/git/webhook', (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const eventType = req.headers['x-github-event'];
  const payload = req.body;
  
  // Verify signature if using a secret
  if (WEBHOOK_SECRET) {
    if (!signature) {
      return res.status(401).send('No signature provided');
    }
    
    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    const calculatedSignature = 'sha256=' + hmac.update(JSON.stringify(payload)).digest('hex');
    
    if (signature !== calculatedSignature) {
      return res.status(401).send('Invalid signature');
    }
  }
  
  // Check if this is a push event to the main branch
  if (eventType === 'push' && payload.ref === 'refs/heads/main') {
    console.log('Received push to main branch, updating repository...');
    
    // Execute update script
    exec(path.join(__dirname, 'update-repo.sh'), (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing update script: ${error}`);
        return res.status(500).json({ 
          message: 'Error updating repository',
          error: stderr
        });
      }
      
      console.log(`Update successful: ${stdout}`);
      return res.json({ 
        message: 'Repository updated successfully',
        details: stdout
      });
    });
  } else {
    // Not a push to main or not a push event
    return res.json({ 
      message: 'Webhook received, but no action taken',
      event: eventType,
      ref: payload.ref
    });
  }
});


// Specific route for /git/static/ files
app.use('/git', express.static(path.join(__dirname, '../frontend/build')));



// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Frontend available at http://localhost:${PORT}`);
});
