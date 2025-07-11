const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://app.lucysounds.com',
      'https://www.app.lucysounds.com',
      'https://lucy-frontend.herokuapp.com',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable preflight for all routes

// Add explicit CORS headers for all responses
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://app.lucysounds.com',
    'https://www.app.lucysounds.com',
    'https://lucy-frontend.herokuapp.com',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000'
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.url.includes('/auth/callback')) {
    console.log('Auth callback detected!');
    console.log('Query params:', req.query);
    console.log('Headers:', req.headers);
  }
  next();
});

// Handle client-side routing - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Frontend URL: https://app.lucysounds.com`);
}); 