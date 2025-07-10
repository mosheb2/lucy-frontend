
import React from 'react';
import { cn } from '@/lib/utils';
import {
  Home, Compass, Music, Users, MessageCircle, BarChart3,
  Share2, Globe, Shield, Settings, Plus, Play, Pause, Edit,
  Trash2, Heart, Eye, Search, Bell, Menu, X, Camera, Image,
  Upload, Download, ArrowUp, ArrowDown, TrendingUp, Activity,
  CheckCircle, AlertTriangle, Info, Loader2, Star, Zap, Target,
  Clock, Send, Flag, Save, Megaphone, UserPlus, UserCheck,
  LogOut, ChevronLeft, ChevronRight, Calendar, Video, Disc3,
  Headphones, Mic, Copy, MoreVertical, MoreHorizontal, DollarSign
} from 'lucide-react';

// Simple, reliable icon mapping using Lucide icons
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
  dollar: DollarSign,
  more: MoreVertical,
  moreHorizontal: MoreHorizontal,
};

export default function LordIcon({ 
  icon, 
  size = 24, 
  className,
  colors,
  trigger,
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
        "transition-all duration-200 hover:scale-110",
        // Context-aware colors
        icon === 'heart' && "text-red-500 hover:text-red-600",
        icon === 'trash' && "text-red-500 hover:text-red-600",
        icon === 'logout' && "text-red-500 hover:text-red-600",
        icon === 'check' && "text-green-500 hover:text-green-600",
        icon === 'save' && "text-green-500 hover:text-green-600",
        icon === 'warning' && "text-orange-500 hover:text-orange-600",
        icon === 'dollar' && "text-green-600 hover:text-green-700",
        // Default colors for most icons
        !['heart', 'trash', 'logout', 'check', 'save', 'warning', 'dollar'].includes(icon) && "text-slate-600 hover:text-purple-600",
        className
      )}
      size={size}
      {...props}
    />
  );
}
