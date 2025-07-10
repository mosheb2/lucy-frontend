import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/api/admin';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import StudioPanel from './StudioPanel';
import ActionButton from './ActionButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Users,
  BarChart3,
  Settings,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
  UserCheck,
  UserX,
  Trash2,
  Edit,
  Eye,
  MessageSquare,
  Bell,
  Database,
  Server,
  Globe,
  Lock,
  Unlock,
  Loader2,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Minus,
  Calendar,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Copy,
  MoreHorizontal
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import AnimatedIcon from './AnimatedIcon';
import LordIcon from './LordIcon';

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [showCreateAdminDialog, setShowCreateAdminDialog] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    email: '',
    fullName: '',
    username: ''
  });

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const adminStatus = await adminAPI.isAdmin();
      setIsAdmin(adminStatus);
      
      if (adminStatus) {
        loadAdminData();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdminData = async () => {
    try {
      const [dashboardStats, adminNotifications, activity] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getNotifications(10),
        adminAPI.getRecentActivity()
      ]);

      setStats(dashboardStats);
      setNotifications(adminNotifications);
      setRecentActivity(activity);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const handleCreateAdmin = async () => {
    try {
      // This would typically be done through a secure admin creation process
      // For now, we'll show a success message
      alert('Admin user creation would be implemented here with proper security measures');
      setShowCreateAdminDialog(false);
      setNewAdminData({ email: '', fullName: '', username: '' });
    } catch (error) {
      console.error('Error creating admin:', error);
      alert('Failed to create admin user');
    }
  };

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await adminAPI.markNotificationRead(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto">
        <StudioPanel className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-6">You don't have admin privileges to access this panel.</p>
          <ActionButton onClick={() => navigate(createPageUrl('Dashboard'))}>
            Return to Dashboard
          </ActionButton>
        </StudioPanel>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-slate-600">Manage your platform and users</p>
        </div>
        <div className="flex gap-2">
          <ActionButton 
            onClick={() => setShowCreateAdminDialog(true)}
            icon="plus"
            variant="secondary"
          >
            Create Admin
          </ActionButton>
          <ActionButton 
            onClick={loadAdminData}
            icon="refresh"
            variant="secondary"
          >
            Refresh
          </ActionButton>
        </div>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.new_users_7_days} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Content</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_tracks + stats.total_releases}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total_tracks} tracks, {stats.total_releases} releases
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Support Requests</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.open_support_requests}</div>
              <p className="text-xs text-muted-foreground">
                {stats.in_progress_support_requests} in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending_releases}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting admin review
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notifications */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    notification.is_read ? 'bg-slate-50' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      notification.type === 'support_request' ? 'bg-orange-500' :
                      notification.type === 'user_registration' ? 'bg-green-500' :
                      'bg-blue-500'
                    }`} />
                    <div>
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-xs text-slate-600">{notification.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      {format(parseISO(notification.created_at), 'MMM d, HH:mm')}
                    </span>
                    {!notification.is_read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMarkNotificationRead(notification.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Admin Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <DashboardTab recentActivity={recentActivity} />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UsersTab />
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <ContentTab />
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <SupportTab />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsTab />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <SettingsTab />
        </TabsContent>
      </Tabs>

      {/* Create Admin Dialog */}
      <Dialog open={showCreateAdminDialog} onOpenChange={setShowCreateAdminDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Admin User</DialogTitle>
            <DialogDescription>
              Create a new admin user with full platform access.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={newAdminData.email}
                onChange={(e) => setNewAdminData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <Label htmlFor="admin-fullname">Full Name</Label>
              <Input
                id="admin-fullname"
                value={newAdminData.fullName}
                onChange={(e) => setNewAdminData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Admin User"
              />
            </div>
            <div>
              <Label htmlFor="admin-username">Username</Label>
              <Input
                id="admin-username"
                value={newAdminData.username}
                onChange={(e) => setNewAdminData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="admin"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateAdminDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAdmin}>
              Create Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Dashboard Tab Component
const DashboardTab = ({ recentActivity }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentActivity.slice(0, 10).map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
              <div className={`w-2 h-2 rounded-full ${
                activity.activity_type === 'user_registration' ? 'bg-green-500' : 'bg-blue-500'
              }`} />
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.user_name}</p>
                <p className="text-xs text-slate-600">{activity.description}</p>
              </div>
              <span className="text-xs text-slate-500">
                {format(parseISO(activity.activity_date), 'MMM d, HH:mm')}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Users Tab Component
const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const userData = await adminAPI.getUsers();
      setUsers(userData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      await loadUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return <div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">Users</SelectItem>
            <SelectItem value="moderator">Moderators</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>{user.full_name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-sm text-slate-600">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'moderator' ? 'secondary' : 'default'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_verified ? 'default' : 'secondary'}>
                      {user.is_verified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(parseISO(user.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(newRole) => handleRoleUpdate(user.id, newRole)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// Content Tab Component
const ContentTab = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Content Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <ActionButton 
              onClick={() => navigate(createPageUrl('AdminContentManagement'))}
              className="w-full"
              icon="file-text"
            >
              Manage Content
            </ActionButton>
            <ActionButton 
              onClick={() => navigate(createPageUrl('AdminSubmissions'))}
              className="w-full"
              icon="upload"
              variant="secondary"
            >
              Review Submissions
            </ActionButton>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Moderation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <ActionButton 
              onClick={() => navigate(createPageUrl('AdminContentManagement'))}
              className="w-full"
              icon="shield"
            >
              Content Moderation
            </ActionButton>
            <ActionButton 
              onClick={() => navigate(createPageUrl('AdminUserManagement'))}
              className="w-full"
              icon="users"
              variant="secondary"
            >
              User Management
            </ActionButton>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Platform Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <ActionButton 
              onClick={() => navigate(createPageUrl('AdminPlatformSettings'))}
              className="w-full"
              icon="settings"
            >
              Platform Settings
            </ActionButton>
            <ActionButton 
              onClick={() => navigate(createPageUrl('AdminPlatformAnalytics'))}
              className="w-full"
              icon="bar-chart"
              variant="secondary"
            >
              Platform Analytics
            </ActionButton>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Support Tab Component
const SupportTab = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Support Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <ActionButton 
            onClick={() => navigate(createPageUrl('AdminSupportRequests'))}
            className="w-full"
            icon="message-square"
          >
            Support Requests
          </ActionButton>
          <ActionButton 
            onClick={() => navigate(createPageUrl('AdminMentorManagement'))}
            className="w-full"
            icon="users"
            variant="secondary"
          >
            Mentor Management
          </ActionButton>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Analytics Tab Component
const AnalyticsTab = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Analytics & Reports
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <ActionButton 
            onClick={() => navigate(createPageUrl('AdminPlatformAnalytics'))}
            className="w-full"
            icon="bar-chart"
          >
            Platform Analytics
          </ActionButton>
          <ActionButton 
            onClick={() => navigate(createPageUrl('IntegratedAnalytics'))}
            className="w-full"
            icon="trending-up"
            variant="secondary"
          >
            User Analytics
          </ActionButton>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Settings Tab Component
const SettingsTab = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          System Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <ActionButton 
            onClick={() => navigate(createPageUrl('AdminPlatformSettings'))}
            className="w-full"
            icon="settings"
          >
            Platform Settings
          </ActionButton>
          <ActionButton 
            onClick={() => navigate(createPageUrl('AdminDashboard'))}
            className="w-full"
            icon="dashboard"
            variant="secondary"
          >
            System Dashboard
          </ActionButton>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default AdminPanel; 