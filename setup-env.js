import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variables
const envVars = `# Supabase Configuration
VITE_SUPABASE_URL=https://bxgdijqjdtbgzycvngug.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4Z2RpanFqZHRiZ3p5Y3ZuZ3VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5OTI0NTMsImV4cCI6MjA2NzU2ODQ1M30.T_KZxQHOxYvgIYLGpDXVqCj9Vgdp8YFvgSt0JHsLvAc

# API Configuration
VITE_API_URL=https://api.lucysounds.com/api

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SOCIAL_FEATURES=true
VITE_ENABLE_WEB3_FEATURES=true`;

// Write to .env file
fs.writeFileSync(path.join(__dirname, '.env'), envVars);

// Production environment variables
const prodEnvVars = `# Supabase Configuration
VITE_SUPABASE_URL=https://bxgdijqjdtbgzycvngug.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4Z2RpanFqZHRiZ3p5Y3ZuZ3VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5OTI0NTMsImV4cCI6MjA2NzU2ODQ1M30.T_KZxQHOxYvgIYLGpDXVqCj9Vgdp8YFvgSt0JHsLvAc

# API Configuration
VITE_API_URL=https://api.lucysounds.com/api

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SOCIAL_FEATURES=true
VITE_ENABLE_WEB3_FEATURES=true`;

// Write to .env.production file
fs.writeFileSync(path.join(__dirname, '.env.production'), prodEnvVars);

console.log('Environment variables set up successfully!'); 