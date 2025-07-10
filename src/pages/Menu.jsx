import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/api/admin';
import {
  Home, Compass, Music, Users, MessageCircle, BarChart3,
  Share2, Globe, FileMusic, Settings, ShieldCheck, LifeBuoy
} from 'lucide-react';

const menuItems = [
  { name: "Home", icon: Home, page: "Dashboard" },
  { name: "Discover", icon: Compass, page: "Explore" },
  { name: "Music Library", icon: Music, page: "MusicLibrary" },
  { name: "Collaborate", icon: Users, page: "Collaborate" },
  { name: "Messages", icon: MessageCircle, page: "LiveChat" },
  { name: "Analytics", icon: BarChart3, page: "Analytics" },
  { name: "Marketing", icon: Share2, page: "Promotion" },
  { name: "Distribution", icon: Globe, page: "Distribution" },
  { name: "Copyright", icon: FileMusic, page: "SongRegistration" },
  { name: "Settings", icon: Settings, page: "Settings" },
  { name: "Admin", icon: ShieldCheck, page: "AdminDashboard", adminOnly: true },
  { name: "Help & Support", icon: LifeBuoy, page: "Support" }
];

const MenuItem = ({ item, user }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      try {
        const adminStatus = await adminAPI.isAdmin();
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, [user]);
  
  if (item.adminOnly && !isAdmin) {
    return null;
  }

  const Icon = item.icon;
  return (
    <Link
      to={createPageUrl(item.page)}
      className="flex items-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <Icon className="w-6 h-6 mr-4 text-purple-600" />
      <span className="font-semibold text-slate-800">{item.name}</span>
    </Link>
  );
};

export default function MenuPage() {
    const { user } = useAuth();

    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold text-slate-900">Menu</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems.map(item => (
                    <MenuItem key={item.name} item={item} user={user} />
                ))}
            </div>
        </div>
    );
}