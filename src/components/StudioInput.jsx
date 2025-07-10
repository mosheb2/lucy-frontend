import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Enhanced input field with purple theme and smooth animations
 */
export default function StudioInput({ className, ...props }) {
  return (
    <Input
      className={cn(
        // Base styling with purple theme
        "bg-white/95 border-slate-300 placeholder:text-slate-400 text-slate-900",
        // Focus states with purple accent
        "focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-2 focus-visible:border-purple-500",
        // Enhanced styling
        "rounded-xl py-3 px-4 shadow-sm backdrop-blur-sm",
        // Smooth transitions and hover effects
        "transition-all duration-300 hover:shadow-md hover:border-purple-300 hover:scale-[1.01]",
        "focus:scale-[1.02] focus:shadow-lg focus:bg-white",
        // Subtle gradient background on focus
        "focus:bg-gradient-to-r focus:from-white focus:to-purple-50/30",
        className
      )}
      {...props}
    />
  );
}