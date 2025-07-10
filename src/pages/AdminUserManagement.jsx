import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/api/admin';
import StudioPanel from '../components/StudioPanel';
import { Loader2, Search, UserCheck, UserX, Shield, ShieldCheck, ShieldX, MoreVertical, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AdminUserManagement() {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [updatingRole, setUpdatingRole] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);

    const loadUsers = async (page = 1) => {
        try {
            setIsLoading(true);
            
            // Get total count first
            const totalCount = await adminAPI.getTotalUserCount();
            setTotalUsers(totalCount || 0);
            setTotalPages(Math.ceil((totalCount || 0) / 20));
            
            const users = await adminAPI.getUsers(page, 20);

            setUsers(users || []);
            setFilteredUsers(users || []);
            setCurrentPage(page);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast({
                title: "Error",
                description: "Failed to load users. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const checkAdminAndLoadUsers = async () => {
            if (!currentUser) return;
            setIsLoading(true);
            try {
                const adminStatus = await adminAPI.isAdmin();
                setIsAdmin(adminStatus);
                
                if (adminStatus) {
                    await loadUsers();
                }
            } catch (error) {
                console.error("Error checking admin status:", error);
                setIsAdmin(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAdminAndLoadUsers();
    }, [currentUser]);

    useEffect(() => {
        const results = users.filter(user =>
            (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (user.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(results);
    }, [searchTerm, users]);
    
    const getInitials = (name) => {
        if (!name) return "?";
        const names = name.split(' ');
        if (names.length === 1) return names[0][0];
        return `${names[0][0]}${names[names.length - 1][0]}`;
    };

    const updateUserRole = async (userId, newRole) => {
        try {
            setUpdatingRole(userId);
            
            await adminAPI.updateUserRole(userId, newRole);

            // Update the user in the local state
            setUsers(prevUsers => 
                prevUsers.map(user => 
                    user.id === userId 
                        ? { ...user, role: newRole }
                        : user
                )
            );

            toast({
                title: "Success",
                description: `User role updated to ${newRole}`,
            });

            // Log the admin action
            await adminAPI.logAction('update_user_role', 'user', userId, { new_role: newRole });

        } catch (error) {
            console.error('Error updating user role:', error);
            toast({
                title: "Error",
                description: "Failed to update user role. Please try again.",
                variant: "destructive"
            });
        } finally {
            setUpdatingRole(null);
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            setDeletingUser(userId);
            
            await adminAPI.deleteUser(userId);

            // Remove user from local state
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            setFilteredUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            setTotalUsers(prev => prev - 1);

            toast({
                title: "Success",
                description: "User deleted successfully",
            });

            // Log the admin action
            await adminAPI.logAction('delete_user', 'user', userId, { action: 'deleted' });

        } catch (error) {
            console.error('Error deleting user:', error);
            toast({
                title: "Error",
                description: "Failed to delete user. Please try again.",
                variant: "destructive"
            });
        } finally {
            setDeletingUser(null);
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin':
                return <ShieldCheck className="w-4 h-4 text-red-600" />;
            case 'moderator':
                return <Shield className="w-4 h-4 text-blue-600" />;
            default:
                return <UserCheck className="w-4 h-4 text-green-600" />;
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin':
                return <Badge variant="destructive" className="text-xs">Admin</Badge>;
            case 'moderator':
                return <Badge variant="secondary" className="text-xs">Moderator</Badge>;
            default:
                return <Badge variant="outline" className="text-xs">User</Badge>;
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>;
    }

    if (!isAdmin) {
        return (
            <div className="max-w-2xl mx-auto">
                <StudioPanel className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                        <Shield className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">Access Denied</h2>
                    <p className="text-slate-600 mb-6">You don't have admin privileges to access user management.</p>
                    <button 
                        onClick={() => navigate(createPageUrl('Dashboard'))}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Return to Dashboard
                    </button>
                </StudioPanel>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
                <div className="text-sm text-slate-500">
                    {totalUsers} users total
                </div>
            </div>

            <StudioPanel>
                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input 
                            placeholder="Search by name, username, or email..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="divide-y divide-slate-100">
                    {filteredUsers.map(user => (
                        <div key={user.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={user.avatar_url} />
                                    <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-slate-800">{user.full_name || user.username}</p>
                                        {getRoleIcon(user.role)}
                                    </div>
                                    <p className="text-sm text-slate-500">{user.email}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {getRoleBadge(user.role)}
                                        {user.is_verified && (
                                            <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                                                Verified
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm text-slate-600">
                                        Joined: {format(new Date(user.created_at), 'MMM d, yyyy')}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Last updated: {format(new Date(user.updated_at), 'MMM d, yyyy')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Select
                                        value={user.role}
                                        onValueChange={(newRole) => updateUserRole(user.id, newRole)}
                                        disabled={updatingRole === user.id}
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
                                    {updatingRole === user.id && (
                                        <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteUser(user.id)}
                                        disabled={deletingUser === user.id}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                        {deletingUser === user.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredUsers.length === 0 && !isLoading && (
                    <div className="p-8 text-center text-slate-500">
                        <UserX className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                        <p>No users found matching your search criteria.</p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t flex justify-between items-center">
                        <Button
                            variant="outline"
                            onClick={() => loadUsers(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-slate-600">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            onClick={() => loadUsers(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </StudioPanel>
        </div>
    );
}