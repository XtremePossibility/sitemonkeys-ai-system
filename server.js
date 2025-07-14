// server.js — Minimal web server that runs your API
import express from 'express';
import handler from './api/chat.js';

const app = express();
app.use(express.json());

app.post('/api/chat', handler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
