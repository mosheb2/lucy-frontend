import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define environment variables with proper formatting
const supabaseUrl = 'https://bxgdijqjdtbgzycvngug.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4Z2RpanFqZHRiZ3p5Y3ZuZ3VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5OTI0NTMsImV4cCI6MjA2NzU2ODQ1M30.T_KZxQHOxYvgIYLGpDXVqCj9Vgdp8YFvgSt0JHsLvAc';
const apiUrl = 'https://api.lucysounds.com/api';

// Check if we have environment variables from Heroku
const herokuSupabaseUrl = process.env.VITE_SUPABASE_URL;
const herokuSupabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const herokuApiUrl = process.env.VITE_API_URL;

// Use Heroku environment variables if available
const finalSupabaseUrl = herokuSupabaseUrl || supabaseUrl;
const finalSupabaseAnonKey = herokuSupabaseAnonKey || supabaseAnonKey;
const finalApiUrl = herokuApiUrl || apiUrl;

// Verify the anon key is not split across multiple lines
const cleanedAnonKey = finalSupabaseAnonKey.replace(/\r?\n|\r/g, '').trim();

// Environment variables content
const envVars = `# Supabase Configuration
VITE_SUPABASE_URL=${finalSupabaseUrl}
VITE_SUPABASE_ANON_KEY=${cleanedAnonKey}

# API Configuration
VITE_API_URL=${finalApiUrl}

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SOCIAL_FEATURES=true
VITE_ENABLE_WEB3_FEATURES=true`;

// Write to .env file
fs.writeFileSync(path.join(__dirname, '.env'), envVars);

// Write to .env.production file
fs.writeFileSync(path.join(__dirname, '.env.production'), envVars);

console.log('Environment variables set up successfully!');
console.log('Supabase URL:', finalSupabaseUrl);
console.log('Supabase Anon Key Length:', cleanedAnonKey.length);
console.log('API URL:', finalApiUrl); 