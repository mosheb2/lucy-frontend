import fetch from 'node-fetch';

// The Supabase URL and key to test
const supabaseUrl = 'https://bxgdijqjdtbgzycvngug.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4Z2RpanFqZHRiZ3p5Y3ZuZ3VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5OTI0NTMsImV4cCI6MjA2NzU2ODQ1M30.axSb9Ew1TelVzo-4EsbWO8vxYjuU_0FAxWMpbWrgfIw';

// Check the key format
console.log('Supabase Key Information:');
console.log('Key length:', supabaseAnonKey.length);
console.log('Key has newlines:', supabaseAnonKey.includes('\n'));
console.log('Key first 20 chars:', supabaseAnonKey.substring(0, 20) + '...');
console.log('Key last 20 chars:', '...' + supabaseAnonKey.substring(supabaseAnonKey.length - 20));

// Parse the JWT to check its contents
try {
  const parts = supabaseAnonKey.split('.');
  if (parts.length === 3) {
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    console.log('\nJWT Header:', header);
    console.log('JWT Payload:', payload);
    
    // Check if the token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.error('⚠️ WARNING: Token is expired!');
      console.log('Expiration:', new Date(payload.exp * 1000).toISOString());
      console.log('Current time:', new Date(now * 1000).toISOString());
    } else if (payload.exp) {
      console.log('Token is valid until:', new Date(payload.exp * 1000).toISOString());
    }
    
    // Check if the project reference matches the URL
    const urlProjectRef = supabaseUrl.split('//')[1].split('.')[0];
    if (payload.ref !== urlProjectRef) {
      console.error('⚠️ WARNING: Token project reference does not match URL!');
      console.log('Token ref:', payload.ref);
      console.log('URL ref:', urlProjectRef);
    } else {
      console.log('Project reference matches URL:', payload.ref);
    }
  } else {
    console.error('Invalid JWT format - does not have three parts');
  }
} catch (error) {
  console.error('Error parsing JWT:', error);
}

// Test the key against the Supabase API
async function testKey() {
  try {
    console.log('\nTesting key against Supabase API...');
    
    // Test against the auth API
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    
    console.log('Auth API response status:', authResponse.status);
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('Auth API response data:', authData);
    } else {
      const authError = await authResponse.text();
      console.error('Auth API error:', authError);
    }
    
    // Test against the REST API
    const restResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    
    console.log('REST API response status:', restResponse.status);
    
    if (restResponse.ok) {
      const restData = await restResponse.json();
      console.log('REST API response data:', restData);
    } else {
      const restError = await restResponse.text();
      console.error('REST API error:', restError);
    }
    
    // Test a simple query to get a list of tables
    const tablesResponse = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseAnonKey}`);
    
    console.log('Tables API response status:', tablesResponse.status);
    
    if (tablesResponse.ok) {
      const tablesData = await tablesResponse.json();
      console.log('Available tables:', tablesData);
    } else {
      const tablesError = await tablesResponse.text();
      console.error('Tables API error:', tablesError);
    }
  } catch (error) {
    console.error('Error testing key:', error);
  }
}

testKey(); 