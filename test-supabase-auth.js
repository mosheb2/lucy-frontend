import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Get Supabase configuration from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase configuration:');
console.log('URL:', supabaseUrl);
console.log('Anon Key Length:', supabaseAnonKey ? supabaseAnonKey.length : 0);
console.log('Anon Key First 10 chars:', supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + '...' : 'none');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    debug: true
  }
});

// Test the connection
async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Try to get the session
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Supabase connection error:', error);
    } else {
      console.log('Supabase connection successful!');
      console.log('Session data:', data);
    }
    
    // Test OAuth URL generation
    console.log('\nTesting OAuth URL generation...');
    const domain = 'app.lucysounds.com';
    const redirectUrl = `https://${domain}/auth/callback`;
    
    try {
      const { data: oauthData, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true // Don't actually redirect
        }
      });
      
      if (oauthError) {
        console.error('OAuth URL generation error:', oauthError);
      } else {
        console.log('OAuth URL generated successfully!');
        console.log('URL:', oauthData.url);
        
        // Check if the redirect URL is included in the generated URL
        const urlObj = new URL(oauthData.url);
        const params = new URLSearchParams(urlObj.search);
        const redirectParam = params.get('redirect_to');
        
        console.log('Redirect parameter:', redirectParam);
        
        if (redirectParam && redirectParam.includes(domain)) {
          console.log('✅ Redirect URL is correctly included in the OAuth URL');
        } else {
          console.warn('⚠️ Redirect URL is not correctly included in the OAuth URL');
          console.log('This suggests that the redirect URL may not be allowed in Supabase settings');
          console.log('You need to add these URLs to your Supabase project:');
          console.log(`- ${redirectUrl}`);
          console.log(`- https://${domain}`);
        }
      }
    } catch (oauthErr) {
      console.error('Error testing OAuth URL:', oauthErr);
    }
    
    // Test PKCE flow
    console.log('\nTesting PKCE flow...');
    try {
      const { data: pkceData, error: pkceError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
          flowType: 'pkce'
        }
      });
      
      if (pkceError) {
        console.error('PKCE flow error:', pkceError);
      } else {
        console.log('PKCE flow URL generated successfully!');
        console.log('URL:', pkceData.url);
        
        // Check for code_challenge parameter
        const pkceUrl = new URL(pkceData.url);
        const pkceParams = new URLSearchParams(pkceUrl.search);
        const hasCodeChallenge = pkceParams.has('code_challenge');
        
        if (hasCodeChallenge) {
          console.log('✅ PKCE code_challenge parameter is present');
        } else {
          console.warn('⚠️ PKCE code_challenge parameter is missing');
          console.log('This suggests that PKCE flow may not be configured correctly');
        }
      }
    } catch (pkceErr) {
      console.error('Error testing PKCE flow:', pkceErr);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testConnection(); 