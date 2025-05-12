// server.js
import express from 'express';

const app = express();
const PORT = process.env.PORT || 8082;

app.get('/api/events', (req, res) => {
  res.json({ events: [] });  // Примерен API
});

app.listen(PORT, () => {
  console.log(`✅ Main server running on port ${PORT}`);
});