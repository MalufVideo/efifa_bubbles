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

// Default Config (game values must match GameType enum: EMOBILE, ECONSOLE, ROCKET_LEAGUE)
let appConfig = {
  game: 'EMOBILE', 
  apiUrl: 'https://events.tinytoolkit.io/api/well-wishes/messages/live?team=barcelona', 
  isAnimating: true,  // Auto-start by default
  lastResetTimestamp: 0
};

// API Endpoints
app.get('/api/config', (req, res) => {
  res.json(appConfig);
});

app.post('/api/config', (req, res) => {
  const newConfig = req.body;
  appConfig = { ...appConfig, ...newConfig };
  console.log('Config updated:', appConfig);
  res.json(appConfig);
});

// Proxy endpoint to fetch messages (bypasses CORS)
app.get('/api/messages', async (req, res) => {
  try {
    const targetUrl = appConfig.apiUrl || 'https://events.tinytoolkit.io/api/well-wishes/messages/live?team=barcelona';
    const separator = targetUrl.includes('?') ? '&' : '?';
    const fetchUrl = `${targetUrl}${separator}_t=${Date.now()}`;
    
    const response = await fetch(fetchUrl, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy fetch error:', error.message);
    res.status(500).json({ error: error.message });
  }
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
