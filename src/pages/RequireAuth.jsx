import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/api/supabase-auth-fixed';

const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [checkingSupabase, setCheckingSupabase] = useState(false);
  
  // Check if the current route is an auth route that doesn't require authentication
  const isAuthRoute = ['/login', '/signup', '/auth/callback', '/debug-auth.html'].some(route => 
    location.pathname.toLowerCase().startsWith(route.toLowerCase())
  );
  
  // Check localStorage directly as a backup
  const isAuthenticatedInStorage = localStorage.getItem('user_authenticated') === 'true';
  const hasAuthToken = !!localStorage.getItem('auth_token');
  const hasSupabaseSession = !!localStorage.getItem('supabase.auth.token');
  
  useEffect(() => {
    console.log('RequireAuth - Checking authentication state:', {
      contextIsAuthenticated: isAuthenticated,
      contextLoading: loading,
      hasUser: !!user,
      isAuthRoute,
      isAuthenticatedInStorage,
      hasAuthToken,
      hasSupabaseSession,
      pathname: location.pathname
    });
    
    // Determine if the user is authenticated based on multiple sources
    const checkAuth = async () => {
      // If we're on an auth route, don't need to check auth
      if (isAuthRoute) {
        console.log('RequireAuth - On auth route, no need to check auth');
        setIsAuth(false);
        setAuthChecked(true);
        return;
      }
      
      // If we have a user in context, they're authenticated
      if (user) {
        console.log('RequireAuth - User found in context, authenticated');
        setIsAuth(true);
        setAuthChecked(true);
        return;
      }
      
      // If localStorage says they're authenticated and we have a token, trust it
      if (isAuthenticatedInStorage && (hasAuthToken || hasSupabaseSession)) {
        console.log('RequireAuth - User authenticated according to localStorage');
        setIsAuth(true);
        setAuthChecked(true);
        return;
      }
      
      // If the context says they're authenticated, trust it
      if (isAuthenticated) {
        console.log('RequireAuth - Context reports user is authenticated');
        setIsAuth(true);
        setAuthChecked(true);
        return;
      }
      
      // If we have a Supabase session in localStorage, check if it's valid
      if (hasSupabaseSession && !checkingSupabase) {
        setCheckingSupabase(true);
        try {
          console.log('RequireAuth - Checking Supabase session');
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('RequireAuth - Error getting Supabase session:', error);
          } else if (data?.session) {
            console.log('RequireAuth - Valid Supabase session found');
            setIsAuth(true);
            setAuthChecked(true);
            return;
          }
        } catch (error) {
          console.error('RequireAuth - Error checking Supabase session:', error);
        } finally {
          setCheckingSupabase(false);
        }
      }
      
      // Direct check of localStorage for a session
      try {
        const sessionStr = localStorage.getItem('supabase.auth.token');
        if (sessionStr) {
          const sessionData = JSON.parse(sessionStr);
          if (sessionData && sessionData.access_token) {
            console.log('RequireAuth - Found valid session data in localStorage');
            setIsAuth(true);
            setAuthChecked(true);
            return;
          }
        }
      } catch (error) {
        console.error('RequireAuth - Error parsing session from localStorage:', error);
      }
      
      // If we're not loading and none of the above conditions are met, user is not authenticated
      if (!loading) {
        console.log('RequireAuth - User is not authenticated');
        setIsAuth(false);
        setAuthChecked(true);
      }
    };
    
    checkAuth();
  }, [isAuthenticated, loading, user, isAuthRoute, isAuthenticatedInStorage, hasAuthToken, hasSupabaseSession, location.pathname, checkingSupabase]);
  
  // Show loading spinner while checking authentication
  if (loading || !authChecked || checkingSupabase) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  
  // If not authenticated and not on an auth route, redirect to login
  if (!isAuth && !isAuthRoute) {
    console.log('RequireAuth - Not authenticated, redirecting to login');
    // Store the current location to redirect back after login
    localStorage.setItem('auth_redirect', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // User is authenticated or on an auth route, render children
  return children;
};

export default RequireAuth; 