import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const supabaseUrl = 'https://bxgdijqjdtbgzycvngug.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4Z2RpanFqZHRiZ3p5Y3ZuZ3VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5OTI0NTMsImV4cCI6MjA2NzU2ODQ1M30.T_KZxQHOxYvgIYLGpDXVqCj9Vgdp8YFvgSt0JHsLvAc';

// API configuration
const apiUrl = 'https://api.lucysounds.com/api';

// Feature flags
const enableAnalytics = true;
const enableSocialFeatures = true;
const enableWeb3Features = true;

// Create environment variable content
const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseAnonKey}

# API Configuration
VITE_API_URL=${apiUrl}

# Feature Flags
VITE_ENABLE_ANALYTICS=${enableAnalytics}
VITE_ENABLE_SOCIAL_FEATURES=${enableSocialFeatures}
VITE_ENABLE_WEB3_FEATURES=${enableWeb3Features}
`;

// Write to .env file
fs.writeFileSync(path.join(__dirname, '.env'), envContent);
console.log('.env file created successfully');

// Write to .env.production file
fs.writeFileSync(path.join(__dirname, '.env.production'), envContent);
console.log('.env.production file created successfully');

console.log('Environment setup complete!'); 