// server.js — Full web server for API and frontend

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import handler from './api/chat.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static frontend files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Handle JSON requests to /api/chat
app.use(express.json());
app.post('/api/chat', handler);

// Fallback: serve index.html for all other routes (e.g., /, /something)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Launch the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
