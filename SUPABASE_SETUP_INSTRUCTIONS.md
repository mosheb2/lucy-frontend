# Supabase Setup Instructions

## Issue Diagnosis

The current Supabase project configuration is not working because the API key is invalid. This could be because:
- The Supabase project has been deleted
- The API keys have been rotated
- The project has been recreated with the same ID but different keys

## Solution: Create a New Supabase Project

Follow these steps to create a new Supabase project and update the application:

### 1. Create a New Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign in or create an account
2. Click "New project"
3. Choose an organization or create a new one
4. Enter a name for your project
5. Set a secure database password
6. Choose a region close to your users
7. Click "Create new project"
8. Wait for the project to be created (this may take a few minutes)

### 2. Get the API Keys

1. Once your project is created, go to the project dashboard
2. In the left sidebar, click on "Settings" (gear icon)
3. Click on "API" in the submenu
4. You'll find your project URL and anon/public key on this page
5. Copy both the URL and the anon key

### 3. Update the Application

#### Update Environment Variables

1. Create or edit the `.env` file in the root of the project:

```
VITE_SUPABASE_URL=your_new_supabase_url
VITE_SUPABASE_ANON_KEY=your_new_anon_key
```

2. Create or edit the `.env.production` file with the same values:

```
VITE_SUPABASE_URL=your_new_supabase_url
VITE_SUPABASE_ANON_KEY=your_new_anon_key
```

#### Update Any Hardcoded Values

1. Search for any hardcoded Supabase URLs or keys in the codebase:

```bash
grep -r "bxgdijqjdtbgzycvngug" --include="*.js" --include="*.jsx" .
grep -r "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" --include="*.js" --include="*.jsx" .
```

2. Replace any hardcoded values with the new URL and key

#### Update the Supabase Client

1. Open `src/api/supabase-auth.js` and ensure it's using environment variables:

```javascript
import { createClient } from '@supabase/supabase-js';

// Get environment variables from either import.meta.env (Vite dev) or process.env (Node.js production)
const env = typeof import.meta !== 'undefined' ? import.meta.env : process.env;

// Get Supabase configuration
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

// Export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});
```

### 4. Set Up the Database Schema

If your application requires specific database tables or schemas:

1. Go to the SQL Editor in your Supabase dashboard
2. Create the necessary tables and schemas
3. Import any required data

### 5. Configure Authentication

1. Go to the Authentication settings in your Supabase dashboard
2. Configure the authentication providers you need (Email, OAuth providers, etc.)
3. Set up any required redirect URLs

### 6. Rebuild and Deploy

1. Rebuild the application:

```bash
npm run build
```

2. Deploy the application to your hosting provider

## Testing

After completing these steps, test the authentication flow to ensure it's working correctly:

1. Sign up a new user
2. Sign in with the new user
3. Verify that protected routes are accessible
4. Test any other authentication-related functionality

## Troubleshooting

If you continue to experience issues:

1. Check the browser console for errors
2. Verify that the environment variables are correctly set
3. Ensure that the Supabase client is properly configured
4. Check the Supabase dashboard for any errors or issues
5. Verify that your database schema is correctly set up 