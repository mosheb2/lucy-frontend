import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AnimatedIcon from './AnimatedIcon';

export default function ActionButton({ 
  children, 
  className, 
  variant = "primary",
  size = "default",
  icon, 
  iconPosition = 'left',
  ...props 
}) {
  const baseClasses = "font-semibold transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 hover:scale-[1.02] group relative overflow-hidden inline-flex items-center justify-center";
  
  const variantClasses = {
    primary: cn(
      "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700",
      "text-white border-0 rounded-xl",
      "hover:shadow-purple-500/25 active:shadow-purple-600/30"
    ),
    secondary: cn(
      "bg-white/90 backdrop-blur-sm text-slate-800 hover:bg-white",
      "border border-slate-200 hover:border-purple-300 rounded-xl",
      "hover:shadow-md hover:text-purple-700",
    ),
    destructive: cn(
      "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600",
      "text-white border-0 rounded-xl",
      "hover:shadow-red-500/25 active:shadow-red-600/30"
    ),
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm h-9 gap-1.5",
    default: "px-4 py-2.5 h-10 gap-2",
    lg: "px-6 py-3 text-lg h-12 gap-2.5"
  };

  const iconSizeMap = { sm: 16, default: 18, lg: 20 };
  const iconSize = iconSizeMap[size];

  return (
    <Button
      className={cn(
        baseClasses, 
        variantClasses[variant], 
        sizeClasses[size], 
        className
      )}
      {...props}
    >
      <>
        {icon && iconPosition === 'left' && (
          <AnimatedIcon 
            icon={icon} 
            size={iconSize} 
            className={cn(
              "flex-shrink-0",
              variant === 'primary' || variant === 'destructive' 
                ? "text-white" 
                : "text-slate-600 group-hover:text-purple-600"
            )}
            trigger="hover"
          />
        )}
        {children && <span className="truncate">{children}</span>}
        {icon && iconPosition === 'right' && (
          <AnimatedIcon 
            icon={icon} 
            size={iconSize} 
            className={cn(
              "flex-shrink-0",
              variant === 'primary' || variant === 'destructive' 
                ? "text-white" 
                : "text-slate-600 group-hover:text-purple-600"
            )}
            trigger="hover"
          />
        )}
      </>
    </Button>
  );
}