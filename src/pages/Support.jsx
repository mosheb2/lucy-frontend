import React from 'react';

export default function Support() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Help & Support</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">FAQ</h3>
          <p className="text-slate-600">Find answers to common questions</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Contact Support</h3>
          <p className="text-slate-600">Get help from our support team</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Documentation</h3>
          <p className="text-slate-600">Browse our help documentation</p>
        </div>
      </div>
    </div>
  );
} 