import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import LordIcon from './LordIcon';
import { cn } from '@/lib/utils';

const CreateOption = ({ icon, title, description, onClick, gradient }) => (
  <button
    onClick={onClick}
    className="w-full p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:shadow-lg active:scale-[0.98] group text-left bg-white"
  >
    <div className="flex items-center gap-4">
      <div className={cn(
        "w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-r flex items-center justify-center group-hover:scale-110 transition-transform duration-300",
        gradient
      )}>
        <LordIcon icon={icon} size={28} colors="primary:#ffffff" trigger="hover" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-slate-900 text-base sm:text-lg">{title}</h3>
        <p className="text-sm text-slate-600 mt-0.5">{description}</p>
      </div>
    </div>
  </button>
);

export default function GlobalCreateModal({ open, onOpenChange, onSelectType }) {
  const createOptions = [
    { id: 'track', title: 'Upload Track', description: 'Share your latest song', icon: 'music', gradient: 'from-purple-500 to-indigo-600' },
    { id: 'release', title: 'Create Release', description: 'Album, EP, or single', icon: 'disc', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'collaboration', title: 'Start Collaboration', description: 'Work on a project together', icon: 'users', gradient: 'from-green-500 to-emerald-500' },
    { id: 'campaign', title: 'Launch Campaign', description: 'Promote your music', icon: 'promote', gradient: 'from-pink-500 to-rose-500' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-6 space-y-3">
          {createOptions.map((option) => (
            <CreateOption
              key={option.id}
              icon={option.icon}
              title={option.title}
              description={option.description}
              gradient={option.gradient}
              onClick={() => onSelectType(option.id)}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}