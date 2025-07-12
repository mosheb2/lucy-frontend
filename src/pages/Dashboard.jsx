import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import KeyStats from '@/components/dashboard/KeyStats';
import ChartCard from '@/components/dashboard/ChartCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import GrowthHub from '@/components/dashboard/GrowthHub';
import TaskList from '@/components/dashboard/TaskList';
import ProServices from '@/components/dashboard/ProServices';
import StoriesSection from '@/components/dashboard/StoriesSection';
import QuickActions from '@/components/dashboard/QuickActions';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [sessionUser, setSessionUser] = useState(null);

  useEffect(() => {
    // Check if we have a session in localStorage
    const checkLocalSession = () => {
      try {
        const sessionStr = localStorage.getItem('supabase.auth.token');
        if (sessionStr) {
          const sessionData = JSON.parse(sessionStr);
          if (sessionData && sessionData.user) {
            console.log('Dashboard: Found user in localStorage');
            setSessionUser(sessionData.user);
          }
        }
      } catch (e) {
        console.error('Error parsing session from localStorage:', e);
      }
      setIsLoading(false);
    };

    // If we have a user from context, use it
    if (user) {
      console.log('Dashboard: Using user from context');
      setSessionUser(user);
      setIsLoading(false);
    } else {
      // Otherwise check localStorage
      console.log('Dashboard: No user in context, checking localStorage');
      checkLocalSession();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // If no user found, show a message with a login button
  if (!user && !sessionUser) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Loader2 className="w-12 h-12 text-purple-600 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Session expired or not found</h1>
        <p className="text-gray-600 mb-6">Please log in again to access your dashboard</p>
        <button 
          onClick={() => window.location.href = '/login'}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Use either the context user or session user
  const displayUser = user || sessionUser;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {displayUser?.user_metadata?.name || displayUser?.email || 'Artist'}</h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your music today</p>
        </div>
        <QuickActions />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KeyStats />
        <ChartCard 
          title="Weekly Streams"
          data={[1200, 1900, 3000, 5000, 4000, 6500, 7000]}
          labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
        />
        <ChartCard 
          title="Revenue Growth"
          data={[500, 800, 1100, 900, 1300, 1600, 2000]}
          labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
          chartType="line"
          color="#4ade80"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed user={displayUser} />
        </div>
        <div>
          <TaskList />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GrowthHub user={displayUser} />
        <ProServices />
      </div>
      
      <StoriesSection />
    </div>
  );
}