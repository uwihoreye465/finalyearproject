const express = require('express');
const app = express();

// Only essential middleware
app.use(express.json());

// Simple test route
app.post('/test', (req, res) => {
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Raw body keys:', Object.keys(req.body));
  
  res.json({
    success: true,
    received: req.body,
    isEmpty: Object.keys(req.body).length === 0
  });
});

app.listen(3001, () => {
  console.log('Test server running on port 3001');
});