
import React, { useState, useEffect, useCallback } from 'react';
import { Notification, User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import LordIcon from './LordIcon';

const NotificationIcon = ({ type }) => {
  const iconProps = {
    like: { icon: 'heart', colors: 'primary:#e11d48,secondary:#f43f5e' },
    comment: { icon: 'comment', colors: 'primary:#3b82f6,secondary:#60a5fa' }, // Changed icon from 'message' to 'comment'
    follow: { icon: 'users', colors: 'primary:#16a34a,secondary:#22c55e' },
    collaboration: { icon: 'collaborate', colors: 'primary:#7c3aed,secondary:#8b5cf6' },
    message: { icon: 'message', colors: 'primary:#06b6d4,secondary:#22d3ee' },
    default: { icon: 'bell', colors: 'primary:#64748b,secondary:#94a3b8' },
  };
  const props = iconProps[type] || iconProps.default;
  return <LordIcon icon={props.icon} size={16} colors={props.colors} />;
};

export default function NotificationDropdown() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    User.me().then(currentUser => {
      setUser(currentUser);
    }).catch(() => {});
  }, []);

  const loadNotifications = useCallback(async (userId) => {
    if (isLoading || !userId) return;
    
    setIsLoading(true);
    try {
      const userNotifications = await Notification.filter({ user_id: userId }, '-created_date', 10);
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.read).length);
      setHasLoaded(true);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Only load notifications when dropdown is opened for the first time
  // Update the notification filtering to include message notifications
  useEffect(() => {
    if (isOpen && user && !hasLoaded && !isLoading) {
      loadNotifications(user.id);
    }
  }, [isOpen, user, hasLoaded, loadNotifications, isLoading]);

  const markAsRead = async (notificationId) => {
    try {
      await Notification.update(notificationId, { read: true });
      // Update local state optimistically
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(n => Notification.update(n.id, { read: true }))
      );
      // Update local state optimistically
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="relative rounded-xl w-10 h-10 text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all duration-300 group"
        >
          <div className="relative flex items-center justify-center">
            <LordIcon 
              icon="bell"
              size={20}
              colors="primary:#64748b,secondary:#7c3aed"
              trigger="hover"
            />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-2xl p-2 shadow-xl border border-slate-200/50">
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="text-slate-700">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-purple-600 hover:text-purple-800 group"
            >
              <Check className="h-3 w-3 mr-1 group-hover:scale-125" />
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="p-8 text-center">
            <LordIcon 
              icon="loading" 
              size={32} 
              trigger="loop"
              className="mx-auto mb-3"
            />
            <p className="text-slate-600">Loading notifications...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map(notification => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                  !notification.read ? 'bg-purple-50 border-l-2 border-purple-500' : 'hover:bg-slate-50'
                }`}
                onSelect={(e) => {
                  e.preventDefault();
                  if (!notification.read) {
                    markAsRead(notification.id);
                  }
                }}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-shrink-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={notification.from_user_avatar} />
                      <AvatarFallback className="text-xs">
                        {notification.from_user_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                     <p className="text-sm text-slate-800">
                      <span className="font-semibold">{notification.from_user_name}</span> {notification.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <NotificationIcon type={notification.type} />
                      <p className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <LordIcon 
              icon="bell" 
              size={48} 
              colors="primary:#cbd5e1,secondary:#94a3b8"
              className="mx-auto mb-3"
            />
            <p className="text-slate-600">No notifications yet</p>
            <p className="text-sm text-slate-500 mt-1">
              We'll let you know when something happens
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
