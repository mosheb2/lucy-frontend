import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Home, Users, Compass, Music, BarChart3, ShieldCheck, MessageCircle, Settings, LogOut, Search, Bell, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import GlobalCreateModal from "@/components/GlobalCreateModal";
import NotificationDropdown from "@/components/NotificationDropdown";
import SearchModal from "@/components/SearchModal";

const sidebarNav = [
  { name: "Dashboard", icon: Home, page: "Dashboard" },
  { name: "Feed", icon: Users, page: "SocialFeed" },
  { name: "Explore", icon: Compass, page: "Explore" },
  { name: "Studio", icon: Music, page: "Studio" },
  { name: "Analytics", icon: BarChart3, page: "Analytics" },
];

const sidebarBottom = [
  { name: "Admin Panel", icon: ShieldCheck, page: "AdminDashboard" },
  { name: "Messenger", icon: MessageCircle, page: "Messenger" },
];

const Layout = ({ children, currentPageName = "Dashboard" }) => {
  const [globalCreateOpen, setGlobalCreateOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await signOut();
      navigate('/login');
    }
  };

  const NavItem = ({ item, isActive }) => {
    const Icon = item.icon;
    return (
      <Link
        to={createPageUrl(item.page)}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
          isActive 
            ? "bg-purple-50 text-purple-700 font-semibold" 
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
          collapsed && "justify-center px-2"
        )}
      >
        <Icon className="w-5 h-5" />
        {!collapsed && <span className="font-medium">{item.name}</span>}
      </Link>
    );
  };

  if (!user) {
    return <>{children}</>;
  }
  return (
    <div className="flex h-screen bg-[#f7f8fa]">
      {/* Sidebar */}
      <aside className={cn("flex flex-col justify-between bg-white border-r border-slate-100 py-6 shadow-sm transition-all duration-200", collapsed ? "w-20 px-1" : "w-64 px-3") }>
        {/* Top: Logo and Collapse Button */}
        <div>
          <div className={cn("flex items-center mb-8", collapsed ? "justify-center" : "gap-2 px-2 justify-between") }>
            <span className="text-lg font-extrabold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent tracking-tight">LUCY</span>
            <Button variant="ghost" size="icon" className="ml-1" onClick={() => setCollapsed(c => !c)}>
              {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </Button>
          </div>
          <nav className="flex flex-col gap-1">
            {sidebarNav.map(item => (
              <NavItem key={item.name} item={item} isActive={currentPageName === item.page} />
            ))}
          </nav>
        </div>
        {/* Bottom: Admin, Messenger, User, Settings, Logout */}
        <div className="flex flex-col gap-2 mt-8">
          <nav className="flex flex-col gap-1 mb-2">
            {sidebarBottom.map(item => (
              <NavItem key={item.name} item={item} isActive={currentPageName === item.page} />
            ))}
          </nav>
          {user && (
            <Link to={createPageUrl(`Artist?id=${user.id}`)} className={cn("flex items-center gap-3 bg-[#f7f8fa] rounded-xl p-3 mb-2 hover:bg-slate-100 transition", collapsed && "justify-center p-2") }>
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.profile_image_url} />
                <AvatarFallback>
                  {user.artist_name?.charAt(0) || user.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              {!collapsed && <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{user.artist_name || user.full_name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>}
            </Link>
          )}
          <div className={cn("flex items-center gap-2 px-2", collapsed && "flex-col gap-1 px-0") }>
            <Button variant="ghost" size="sm" className={cn("flex-1 justify-start px-2", collapsed && "justify-center px-0")} onClick={() => navigate(createPageUrl('Settings'))}>
              <Settings className="w-4 h-4 mr-2" />
              {!collapsed && "Settings"}
            </Button>
            <Button variant="ghost" size="sm" className={cn("flex-1 justify-start px-2 text-red-500", collapsed && "justify-center px-0")} onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              {!collapsed && "Logout"}
            </Button>
          </div>
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="flex items-center justify-end w-full h-20 px-8 bg-white border-b border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setSearchOpen(true)}>
              <Search className="w-5 h-5" />
            </Button>
            <Button
              className="bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-semibold rounded-xl px-6 py-2 shadow-md hover:from-purple-700 hover:to-indigo-600"
              onClick={() => setGlobalCreateOpen(true)}
            >
              <Plus className="w-5 h-5 mr-2" /> Create
            </Button>
            <NotificationDropdown />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
      {/* Modals */}
      <GlobalCreateModal
        open={globalCreateOpen}
        onOpenChange={setGlobalCreateOpen}
        onSelectType={() => setGlobalCreateOpen(false)}
      />
      <SearchModal
        open={searchOpen}
        onOpenChange={setSearchOpen}
      />
    </div>
  );
};

export default Layout;