import React from 'react';

export default function Distribution() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Distribution</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Digital Stores</h3>
          <p className="text-slate-600">Distribute to Spotify, Apple Music, and more</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Release Planning</h3>
          <p className="text-slate-600">Plan and schedule your releases</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Analytics</h3>
          <p className="text-slate-600">Track your distribution performance</p>
        </div>
      </div>
    </div>
  );
} 