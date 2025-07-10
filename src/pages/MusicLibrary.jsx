import React from 'react';

export default function MusicLibrary() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Music Library</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">My Tracks</h3>
          <p className="text-slate-600">Manage and organize your music tracks</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Releases</h3>
          <p className="text-slate-600">View and manage your music releases</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Playlists</h3>
          <p className="text-slate-600">Create and manage your playlists</p>
        </div>
      </div>
    </div>
  );
} 