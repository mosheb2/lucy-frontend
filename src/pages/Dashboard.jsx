import React, { useState, useEffect } from 'react';
import ActionButton from '../components/ActionButton';
import AnimatedIcon from '../components/AnimatedIcon';
import QuickActions from '../components/dashboard/QuickActions';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import KeyStats from '../components/dashboard/KeyStats';
import ProServices from '../components/dashboard/ProServices';
import StoriesSection from '../components/dashboard/StoriesSection';
import GlobalCreateModal from '../components/GlobalCreateModal';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const [globalCreateOpen, setGlobalCreateOpen] = useState(false);
  const { user, loading } = useAuth();

  const isLoading = loading;
  
  const handleGlobalCreate = (type) => {
    // This function can be expanded later
    console.log("Creating item of type:", type);
    setGlobalCreateOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <AnimatedIcon icon="loading" size={48} className="mx-auto mb-4 text-purple-600" trigger="spin" />
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // If user is not loaded, show nothing (or a spinner). Do not show login prompt here.
    return null;
  }

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 p-4 md:px-8 md:py-6">
        {/* Header section: Welcome message and Create button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Welcome, {user.artist_name || user.full_name}!</h1>
            <p className="text-lg text-slate-700 mt-1">Here's your command center.</p>
          </div>
          <div className="w-full md:w-auto">
            <ActionButton 
              size="lg"
              icon="plus" 
              className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl"
              onClick={() => setGlobalCreateOpen(true)}
             >
              Create
            </ActionButton>
          </div>
        </div>

        {/* Key Statistics section */}
        <KeyStats user={user} />

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left/main column for larger screens */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <QuickActions />
            <StoriesSection user={user} />
            <ActivityFeed user={user} />
          </div>
          {/* Right/sidebar column for larger screens */}
          <div className="lg:col-span-1 space-y-6 md:space-y-8">
            <ProServices />
          </div>
        </div>
      </div>
      <GlobalCreateModal
        open={globalCreateOpen}
        onOpenChange={setGlobalCreateOpen}
        onSelectType={handleGlobalCreate}
      />
    </>
  );
}