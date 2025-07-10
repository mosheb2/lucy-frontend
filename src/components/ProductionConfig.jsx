// Production Configuration for Supabase and Heroku Deployment
// Note: Environment variables should be set at build time or through your deployment platform

export const PRODUCTION_CONFIG = {
  // Database Configuration
  database: {
    provider: 'supabase',
    url: import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key',
    serviceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key',
  },
  
  // Authentication Configuration
  auth: {
    provider: 'supabase',
    googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    redirectUrl: import.meta.env.VITE_AUTH_REDIRECT_URL || 'https://your-app.herokuapp.com/auth/callback',
  },
  
  // File Storage Configuration
  storage: {
    provider: 'supabase',
    bucketName: 'lucy-uploads',
    publicUrl: import.meta.env.VITE_SUPABASE_STORAGE_URL,
  },
  
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://your-app.herokuapp.com/api',
    timeout: 30000,
  },
  
  // CDN Configuration
  cdn: {
    baseUrl: import.meta.env.VITE_CDN_BASE_URL || 'https://your-app.herokuapp.com',
  },
  
  // Performance Configuration
  performance: {
    enableServiceWorker: true,
    enableCodeSplitting: true,
    enableImageOptimization: true,
    enableGzip: true,
  },
  
  // Security Configuration
  security: {
    enableCSP: true,
    enableHTTPS: true,
    corsOrigins: [
      'https://your-app.herokuapp.com',
      'https://your-custom-domain.com'
    ],
  }
};

// Environment Detection
export const isProduction = () => {
  return import.meta.env.MODE === 'production';
};

export const isDevelopment = () => {
  return import.meta.env.MODE === 'development';
};

// Database Tables Schema for Supabase
export const SUPABASE_SCHEMA = {
  users: {
    id: 'uuid',
    email: 'text',
    full_name: 'text',
    artist_name: 'text',
    bio: 'text',
    profile_image_url: 'text',
    cover_image_url: 'text',
    genre: 'text',
    website: 'text',
    location: 'text',
    verified: 'boolean',
    followers_count: 'integer',
    following_count: 'integer',
    posts_count: 'integer',
    created_at: 'timestamp',
    updated_at: 'timestamp',
  },
  
  posts: {
    id: 'uuid',
    author_id: 'uuid',
    author_name: 'text',
    author_avatar_url: 'text',
    content: 'text',
    image_url: 'text',
    track_id: 'uuid',
    likes: 'integer',
    comments: 'integer',
    shares: 'integer',
    created_at: 'timestamp',
    updated_at: 'timestamp',
  },
  
  tracks: {
    id: 'uuid',
    title: 'text',
    artist_id: 'uuid',
    artist_name: 'text',
    genre: 'text',
    duration_seconds: 'integer',
    audio_file_url: 'text',
    cover_art_url: 'text',
    lyrics: 'text',
    isrc_code: 'text',
    created_at: 'timestamp',
    updated_at: 'timestamp',
  },
  
  follows: {
    id: 'uuid',
    follower_id: 'uuid',
    following_id: 'uuid',
    created_at: 'timestamp',
  },
  
  likes: {
    id: 'uuid',
    user_id: 'uuid',
    target_type: 'text',
    target_id: 'uuid',
    created_at: 'timestamp',
  },
  
  comments: {
    id: 'uuid',
    post_id: 'uuid',
    author_id: 'uuid',
    author_name: 'text',
    author_avatar_url: 'text',
    content: 'text',
    parent_comment_id: 'uuid',
    likes: 'integer',
    created_at: 'timestamp',
    updated_at: 'timestamp',
  }
};

// Deployment Instructions
export const DEPLOYMENT_GUIDE = `
# LUCY Platform - Heroku Deployment Guide

## Prerequisites
1. Heroku CLI installed
2. Supabase account and project created
3. Git repository ready

## Step 1: Supabase Setup

### 1. Create Supabase Project
Visit https://supabase.com and create a new project
Note down your project URL and anon key

### 2. Create Database Tables
Run these SQL commands in your Supabase SQL editor:

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  artist_name TEXT,
  bio TEXT,
  profile_image_url TEXT,
  cover_image_url TEXT,
  genre TEXT,
  website TEXT,
  location TEXT,
  verified BOOLEAN DEFAULT FALSE,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts table
CREATE TABLE public.posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES public.users(id) NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar_url TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  track_id UUID,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security and create policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Posts are viewable by everyone" ON public.posts
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

## Step 2: Heroku Deployment

### 1. Create Heroku App
heroku create lucy-music-platform

### 2. Set Environment Variables
heroku config:set VITE_SUPABASE_URL=https://your-project.supabase.co
heroku config:set VITE_SUPABASE_ANON_KEY=your-anon-key
heroku config:set VITE_GOOGLE_CLIENT_ID=your-google-client-id

### 3. Deploy
git add .
git commit -m "Production deployment setup"
git push heroku main

### 4. Open App
heroku open
`;