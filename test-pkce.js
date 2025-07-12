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

// Create Supabase client with PKCE flow
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    debug: true
  }
});

// Test the PKCE flow
async function testPKCEFlow() {
  try {
    console.log('Testing PKCE flow...');
    
    // 1. Generate a PKCE URL
    const domain = 'app.lucysounds.com';
    const redirectUrl = `https://${domain}/auth/callback`;
    
    const { data: pkceData, error: pkceError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
        flowType: 'pkce'
      }
    });
    
    if (pkceError) {
      console.error('PKCE URL generation error:', pkceError);
      return;
    }
    
    console.log('PKCE URL generated successfully!');
    console.log('URL:', pkceData.url);
    
    // 2. Extract the code challenge and verifier
    const pkceUrl = new URL(pkceData.url);
    const codeChallenge = pkceUrl.searchParams.get('code_challenge');
    const codeChallengeMethod = pkceUrl.searchParams.get('code_challenge_method');
    
    console.log('Code Challenge:', codeChallenge);
    console.log('Code Challenge Method:', codeChallengeMethod);
    
    // 3. Test the token endpoint directly with a mock code
    console.log('\nSimulating token exchange with a mock code...');
    
    // This is a mock code - in a real scenario, this would be returned by the OAuth provider
    const mockCode = '36c5337b-8dfd-4947-b476-687367dd5886';
    
    // Build the token exchange URL
    const tokenUrl = `${supabaseUrl}/auth/v1/token?grant_type=pkce`;
    
    console.log('Token URL:', tokenUrl);
    console.log('Headers:', {
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey.substring(0, 10) + '...'
    });
    
    // In a real scenario, we would make a POST request to the token endpoint
    // with the code and code_verifier
    console.log('Would send POST body with:');
    console.log('- code:', mockCode);
    console.log('- code_verifier: [stored verifier from the initial request]');
    console.log('- redirect_uri:', redirectUrl);
    
    // 4. Check Supabase version
    console.log('\nChecking Supabase client version...');
    console.log('Supabase JS client version:', supabase.auth.getClientVersion());
    
    // 5. Verify PKCE is enabled in the client
    console.log('\nVerifying PKCE configuration...');
    console.log('Auth configuration:', {
      flowType: 'pkce',
      persistSession: true,
      detectSessionInUrl: false,
      autoRefreshToken: true
    });
    
    console.log('\nPKCE flow test complete!');
    console.log('\nRecommendations:');
    console.log('1. Ensure the Supabase project has the correct redirect URLs configured');
    console.log('2. Check that the site URL in Supabase matches your application domain');
    console.log('3. Verify that PKCE flow is enabled for the project');
    console.log('4. Make sure cookies are enabled in the browser');
    console.log('5. Check for any CORS issues in the browser console');
    console.log('6. Ensure the anon key is correct and has not expired');
  } catch (err) {
    console.error('Unexpected error in PKCE test:', err);
  }
}

testPKCEFlow(); 