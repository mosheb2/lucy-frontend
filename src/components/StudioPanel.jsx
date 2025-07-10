import React from "react";
import { cn } from "@/lib/utils";

/**
 * Enhanced panel with purple accents and premium styling
 */
export default function StudioPanel({ children, className, ...props }) {
  return (
    <div
      className={cn(
        // Enhanced background with subtle gradients
        "bg-white/95 backdrop-blur-xl",
        // Purple accent border
        "border border-white/40 hover:border-purple-200/50 rounded-2xl",
        // Enhanced shadows
        "shadow-lg hover:shadow-xl hover:shadow-purple-500/10",
        // Smooth interactions
        "transition-all duration-300 ease-out",
        "hover:scale-[1.01] active:scale-[0.99]",
        // Subtle inner glow on hover
        "hover:bg-gradient-to-br hover:from-white hover:to-purple-50/30",
        // Group for child animations
        "group relative overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Subtle animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/0 to-indigo-500/0 group-hover:from-purple-500/5 group-hover:via-purple-500/2 group-hover:to-indigo-500/5 transition-all duration-500 rounded-2xl" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}