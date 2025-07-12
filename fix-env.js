import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the current .env file
try {
  const envPath = path.join(__dirname, '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  console.log('Original .env file content length:', envContent.length);
  
  // Fix the Supabase anon key by removing line breaks
  const fixedContent = envContent.replace(
    /VITE_SUPABASE_ANON_KEY=([^\n]*)\n([^\n]*)\n([^\n]*)/g,
    'VITE_SUPABASE_ANON_KEY=$1$2$3'
  );
  
  console.log('Fixed .env file content length:', fixedContent.length);
  
  // Write the fixed content back to .env
  fs.writeFileSync(envPath, fixedContent);
  console.log('.env file fixed successfully');
  
  // Also fix the .env.production file
  const prodEnvPath = path.join(__dirname, '.env.production');
  if (fs.existsSync(prodEnvPath)) {
    const prodEnvContent = fs.readFileSync(prodEnvPath, 'utf8');
    const fixedProdContent = prodEnvContent.replace(
      /VITE_SUPABASE_ANON_KEY=([^\n]*)\n([^\n]*)\n([^\n]*)/g,
      'VITE_SUPABASE_ANON_KEY=$1$2$3'
    );
    fs.writeFileSync(prodEnvPath, fixedProdContent);
    console.log('.env.production file fixed successfully');
  }
  
  // Create a new .env.local file with the correct format
  const localEnvPath = path.join(__dirname, '.env.local');
  
  // Supabase configuration - ensure it's on a single line
  const supabaseUrl = 'https://bxgdijqjdtbgzycvngug.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4Z2RpanFqZHRiZ3p5Y3ZuZ3VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5OTI0NTMsImV4cCI6MjA2NzU2ODQ1M30.T_KZxQHOxYvgIYLGpDXVqCj9Vgdp8YFvgSt0JHsLvAc';
  
  // API configuration
  const apiUrl = 'https://api.lucysounds.com/api';
  
  // Create environment variable content
  const localEnvContent = `# Supabase Configuration
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseAnonKey}

# API Configuration
VITE_API_URL=${apiUrl}

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SOCIAL_FEATURES=true
VITE_ENABLE_WEB3_FEATURES=true
`;
  
  fs.writeFileSync(localEnvPath, localEnvContent);
  console.log('.env.local file created successfully');
  
  // Output the key for verification
  console.log('\nVerifying Supabase anon key:');
  console.log('Key length:', supabaseAnonKey.length);
  console.log('Key first 10 chars:', supabaseAnonKey.substring(0, 10) + '...');
  console.log('Key has newlines:', supabaseAnonKey.includes('\n'));
  
} catch (error) {
  console.error('Error fixing environment files:', error);
} 