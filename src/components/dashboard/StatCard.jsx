import React from 'react';
import StudioPanel from '../StudioPanel';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StatCard({ title, value, change, icon: Icon, color }) {
  const isPositive = change >= 0;
  return (
    <StudioPanel className="p-4 sm:p-5">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", color)}>
                <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
                <h3 className="text-sm font-medium text-slate-500 truncate">{title}</h3>
                <p className="text-xl md:text-2xl font-bold text-slate-900 truncate">{value}</p>
            </div>
        </div>
        {change !== undefined && (
          <div className={cn(
            "flex items-center text-sm font-semibold",
            isPositive ? "text-green-500" : "text-red-500"
          )}>
            {isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
    </StudioPanel>
  );
}