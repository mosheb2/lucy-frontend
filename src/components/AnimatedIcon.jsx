import React from 'react';
import { cn } from '@/lib/utils';
import {
  Home, Compass, Music, Users, MessageCircle, BarChart3,
  Share2, Globe, Shield, Settings, Plus, Play, Pause, Edit,
  Trash2, Heart, Eye, Search, Bell, Menu, X, Camera, Image,
  Upload, Download, ArrowUp, ArrowDown, TrendingUp, Activity,
  CheckCircle, AlertTriangle, Info, Loader2, Star, Zap, Target,
  Clock, Send, Flag, Save, Megaphone, UserPlus, UserCheck,
  LogOut, LogIn, ChevronLeft, ChevronRight, Calendar, Video, Disc3,
  Headphones, Mic, Copy, MoreVertical, MoreHorizontal
} from 'lucide-react';

const ICON_MAP = {
  // Navigation & Core
  home: Home,
  compass: Compass,
  search: Search,
  menu: Menu,
  close: X,
  settings: Settings,
  
  // Music & Audio
  music: Music,
  play: Play,
  pause: Pause,
  headphones: Headphones,
  disc: Disc3,
  mic: Mic,
  
  // Social & Communication
  heart: Heart,
  users: Users,
  message: MessageCircle,
  bell: Bell,
  share: Share2,
  comment: MessageCircle,
  
  // Actions & Controls
  plus: Plus,
  edit: Edit,
  trash: Trash2,
  upload: Upload,
  download: Download,
  copy: Copy,
  save: Save,
  
  // Status & Feedback
  check: CheckCircle,
  star: Star,
  loading: Loader2,
  warning: AlertTriangle,
  info: Info,
  
  // Analytics & Data
  chart: BarChart3,
  trending: TrendingUp,
  activity: Activity,
  eye: Eye,
  analytics: BarChart3,
  
  // Navigation & Arrows
  arrowUp: ArrowUp,
  arrowDown: ArrowDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  
  // Content & Media
  camera: Camera,
  image: Image,
  calendar: Calendar,
  clock: Clock,
  globe: Globe,
  video: Video,
  
  // User & Auth
  userPlus: UserPlus,
  userCheck: UserCheck,
  logout: LogOut,
  login: LogIn,
  shield: Shield,
  
  // Platform Specific
  collaborate: Users,
  promote: Megaphone,
  distribute: Globe,
  copyright: Shield,
  lightning: Zap,
  target: Target,
  send: Send,
  flag: Flag,
  more: MoreVertical,
  moreHorizontal: MoreHorizontal,
};

export default function AnimatedIcon({ 
  icon, 
  size = 24, 
  className,
  trigger = 'hover',
  ...props 
}) {
  const IconComponent = ICON_MAP[icon];
  
  if (!IconComponent) {
    console.warn(`Icon "${icon}" not found, using Star as fallback`);
    return <Star className={cn("text-purple-600", className)} size={size} {...props} />;
  }

  return (
    <IconComponent
      className={cn(
        "transition-all duration-300 ease-out",
        // Hover animations
        trigger === 'hover' && "hover:scale-110 hover:rotate-3",
        trigger === 'pulse' && "animate-pulse",
        trigger === 'bounce' && "hover:animate-bounce",
        trigger === 'spin' && "hover:animate-spin",
        // Context-aware colors with hover states
        icon === 'heart' && "text-red-500 hover:text-red-600 hover:scale-125",
        icon === 'trash' && "text-red-500 hover:text-red-600",
        icon === 'logout' && "text-red-500 hover:text-red-600",
        icon === 'check' && "text-green-500 hover:text-green-600 hover:scale-110",
        icon === 'save' && "text-green-500 hover:text-green-600",
        icon === 'warning' && "text-orange-500 hover:text-orange-600 hover:scale-110",
        icon === 'loading' && "animate-spin",
        // Default colors for most icons
        !['heart', 'trash', 'logout', 'check', 'save', 'warning', 'loading'].includes(icon) && "text-slate-600 hover:text-purple-600",
        className
      )}
      size={size}
      {...props}
    />
  );
}