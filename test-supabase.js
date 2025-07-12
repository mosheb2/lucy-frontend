// Load environment variables from .env.fixed
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.fixed' });

// Get Supabase configuration from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase configuration:');
console.log('URL:', supabaseUrl);
console.log('Anon Key Length:', supabaseAnonKey ? supabaseAnonKey.length : 0);
console.log('Anon Key First 10 chars:', supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + '...' : 'none');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test the connection
async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Supabase connection error:', error);
    } else {
      console.log('Supabase connection successful!');
      console.log('Session data:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testConnection(); 