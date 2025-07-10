import React from 'react';

export default function SongRegistration() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Song Registration</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Copyright Registration</h3>
          <p className="text-slate-600">Register your songs for copyright protection</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">PRO Registration</h3>
          <p className="text-slate-600">Register with Performance Rights Organizations</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Legal Services</h3>
          <p className="text-slate-600">Get legal assistance for your music</p>
        </div>
      </div>
    </div>
  );
} 