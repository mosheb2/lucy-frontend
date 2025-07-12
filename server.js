import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  
  // Enhanced logging for auth callback routes
  if (req.url.includes('/auth/callback')) {
    console.log('=== AUTH CALLBACK DETECTED ===');
    console.log('Full URL:', `${req.protocol}://${req.get('host')}${req.originalUrl}`);
    console.log('Query params:', req.query);
    console.log('Headers:', req.headers);
    
    // Log hash fragment if it was passed in a special header (for debugging)
    const hashFragment = req.headers['x-hash-fragment'];
    if (hashFragment) {
      console.log('Hash fragment:', hashFragment);
    }
    
    // Modify response to track when it completes
    const originalEnd = res.end;
    res.end = function() {
      console.log(`Auth callback response completed with status: ${res.statusCode}`);
      return originalEnd.apply(this, arguments);
    };
  }
  
  next();
});

// Special handler for auth callback route
app.get('/auth/callback', (req, res, next) => {
  console.log('Processing /auth/callback route');
  console.log('Query parameters:', req.query);
  
  // Just serve the index.html and let the client-side handle it
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Handle client-side routing - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Frontend URL: https://app.lucysounds.com`);
}); 