// Re-export the Supabase client from the fixed version
// This ensures we only have one instance of the client in the app
import { supabase, auth, getUserProfile, updateUserProfile } from './supabase-auth-fixed';

export { supabase, auth, getUserProfile, updateUserProfile };

// Log that we're using the fixed client
console.log('Using unified Supabase client from supabase-auth-fixed.js'); 