const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Add detailed logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.url}`);
  
  // Log headers for auth-related requests
  if (req.url.includes('/auth/callback') || req.url.includes('/login') || req.url.includes('/api/auth')) {
    console.log('Auth-related request detected!');
    console.log('Query params:', req.query);
    console.log('Headers:', req.headers);
    
    // Add CORS headers for auth callbacks
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  
  // Log response
  const originalSend = res.send;
  res.send = function(body) {
    console.log(`${timestamp} - Response status: ${res.statusCode}`);
    return originalSend.call(this, body);
  };
  
  next();
});

// Handle client-side routing - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Frontend URL: http://localhost:${PORT}`);
});
