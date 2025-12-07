import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Default Config
let appConfig = {
  game: 'emobile', 
  apiUrl: '', 
  isAnimating: false,
  lastResetTimestamp: 0
};

// API Endpoints
app.get('/api/config', (req, res) => {
  res.json(appConfig);
});

app.post('/api/config', (req, res) => {
  const newConfig = req.body;
  appConfig = { ...appConfig, ...newConfig };
  // console.log('Config updated:', appConfig);
  res.json(appConfig);
});

// Serve static files from the React build (../dist)
const buildPath = path.join(__dirname, '../dist');
app.use(express.static(buildPath));

// Handle client-side routing by returning index.html for all non-API routes
// Express 5 requires named wildcard parameters
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
