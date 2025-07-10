import React from 'react';
import { cn } from '@/lib/utils';

export default function GlassCard({ children, className, glowColor, ...props }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10 bg-black/20 backdrop-blur-lg shadow-lg",
        className
      )}
      {...props}
    >
      {/* Optional glow effect */}
      {glowColor && (
        <div
          className="absolute inset-0 opacity-50 blur-3xl"
          style={{
            background: `radial-gradient(circle at center, ${glowColor} 0%, transparent 70%)`
          }}
        />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}