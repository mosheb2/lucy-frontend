import fetch from 'node-fetch';

// The Supabase URL and key to test
const supabaseUrl = 'https://bxgdijqjdtbgzycvngug.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4Z2RpanFqZHRiZ3p5Y3ZuZ3VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5OTI0NTMsImV4cCI6MjA2NzU2ODQ1M30.T_KZxQHOxYvgIYLGpDXVqCj9Vgdp8YFvgSt0JHsLvAc';

async function checkSupabaseProject() {
  console.log('Checking Supabase project status...');
  console.log(`URL: ${supabaseUrl}`);
  
  try {
    // Check if the project exists
    const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    
    const data = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', data);
    
    if (response.status === 401) {
      console.log('\nDIAGNOSIS: The Supabase project exists, but the API key is invalid.');
      console.log('\nRECOMMENDATIONS:');
      console.log('1. Create a new Supabase project and get new API keys');
      console.log('2. Update the .env file with the new API keys');
      console.log('3. Update any hardcoded API keys in the codebase');
      console.log('4. Rebuild and redeploy the application');
    } else if (response.status === 404) {
      console.log('\nDIAGNOSIS: The Supabase project does not exist.');
      console.log('\nRECOMMENDATIONS:');
      console.log('1. Create a new Supabase project');
      console.log('2. Update the .env file with the new project URL and API keys');
      console.log('3. Update any hardcoded URLs and API keys in the codebase');
      console.log('4. Rebuild and redeploy the application');
    } else if (response.status === 200) {
      console.log('\nDIAGNOSIS: The Supabase project exists and the API key is valid.');
      console.log('\nRECOMMENDATIONS:');
      console.log('1. Check for other issues in the application code');
      console.log('2. Verify that the client is correctly configured');
    } else {
      console.log('\nDIAGNOSIS: Unexpected response from Supabase.');
      console.log('\nRECOMMENDATIONS:');
      console.log('1. Check the Supabase status page for any outages');
      console.log('2. Verify your network connection');
      console.log('3. Contact Supabase support if the issue persists');
    }
  } catch (error) {
    console.error('Error checking Supabase project:', error);
  }
}

checkSupabaseProject(); 