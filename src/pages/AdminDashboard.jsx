
import React, { useState, useEffect, useCallback } from 'react';
import { User, Track, Release, SupportRequest, Mentor } from '@/api/entities';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/api/admin';
import StudioPanel from '../components/StudioPanel';
import { Loader2, Users, Music, Disc3, FileText, ArrowRight, Headphones, UserCheck, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, linkTo }) => (
    <Link to={linkTo}>
        <StudioPanel className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <p className="text-3xl font-bold text-slate-900">{value}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                    <Icon className="w-6 h-6 text-purple-600" />
                </div>
            </div>
        </StudioPanel>
    </Link>
);

const RecentSubmissionRow = ({ submission }) => (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-slate-50">
        <div>
            <p className="font-semibold text-slate-800">{submission.title}</p>
            <p className="text-sm text-slate-500">
                By {submission.artist_name || 'N/A'} on {format(new Date(submission.updated_date), 'MMM d, yyyy')}
            </p>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-sm capitalize font-medium px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">{submission.status.replace('_', ' ')}</span>
            <Link to={createPageUrl(`AdminSubmissions`)} className="text-purple-600 hover:text-purple-800">
                <ArrowRight className="w-5 h-5" />
            </Link>
        </div>
    </div>
);

// Simple Badge component for styling, assuming common UI patterns (e.g., Shadcn UI inspired)
const Badge = ({ children, variant = 'default' }) => {
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-800';

    if (variant === 'destructive') {
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
    } else if (variant === 'success') {
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
    } else if (variant === 'info') {
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
            {children}
        </span>
    );
};

// Simple ActionButton component that wraps a react-router-dom Link with button styling
const ActionButton = ({ children, icon: Icon, iconPosition = 'left', to, ...props }) => (
    <Link
        to={to}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-10 px-4 py-2 bg-purple-600 text-white hover:bg-purple-700"
        {...props}
    >
        {iconPosition === 'left' && Icon && <Icon className="mr-2 h-4 w-4" />}
        {children}
        {iconPosition === 'right' && Icon && <Icon className="ml-2 h-4 w-4" />}
    </Link>
);


export default function AdminDashboard() {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [stats, setStats] = useState({
        users: 0,
        tracks: 0,
        releases: 0,
        pendingSubmissions: 0,
        supportRequests: 0,
        mentors: 0,
    });
    const [recentSubmissions, setRecentSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAdminAndFetchData = async () => {
            if (!currentUser) return;
            setIsLoading(true);
            try {
                const adminStatus = await adminAPI.isAdmin();
                setIsAdmin(adminStatus);
                
                if (adminStatus) {
                    const [allUsers, allTracks, allReleases, allSupportRequests, allMentors] = await Promise.all([
                        User.list(),
                        Track.list(),
                        Release.list('-updated_date'),
                        SupportRequest.list(),
                        Mentor.list(),
                    ]);

                    const pendingReleases = allReleases.filter(r =>
                        ['pending_review', 'under_review'].includes(r.status)
                    );

                    const pendingReleasesWithArtistNames = pendingReleases.map(rel => {
                        const artistId = rel.artist_id || (Array.isArray(rel.artist_ids) && rel.artist_ids.length > 0 ? rel.artist_ids[0] : null);
                        const artist = artistId ? allUsers.find(u => u.id === artistId) : null;
                        return { ...rel, artist_name: artist?.artist_name || artist?.full_name || 'N/A' };
                    });

                    setStats({
                        users: allUsers.length,
                        tracks: allTracks.length,
                        releases: allReleases.length,
                        pendingSubmissions: pendingReleases.length,
                        supportRequests: allSupportRequests.filter(r => r.status === 'pending').length,
                        mentors: allMentors.length,
                    });
                    setRecentSubmissions(pendingReleasesWithArtistNames.slice(0, 5));
                }
            } catch (error) {
                console.error("Failed to load admin dashboard data:", error);
                setIsAdmin(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAdminAndFetchData();
    }, [currentUser]);

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
                    <p className="text-slate-600 mb-6">You don't have admin privileges to access this dashboard.</p>
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
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard title="Total Users" value={stats.users} icon={Users} linkTo={createPageUrl("AdminUserManagement")} />
                <StatCard title="Total Tracks" value={stats.tracks} icon={Music} linkTo={createPageUrl("AdminContentManagement")} />
                <StatCard title="Total Releases" value={stats.releases} icon={Disc3} linkTo={createPageUrl("AdminContentManagement")} />
                <StatCard title="Pending Submissions" value={stats.pendingSubmissions} icon={FileText} linkTo={createPageUrl("AdminSubmissions")} />
                <StatCard title="Available Mentors" value={stats.mentors} icon={UserCheck} linkTo={createPageUrl("AdminMentorManagement")} />
            </div>

            {/* New grid for combining recent submissions and support requests */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <StudioPanel className="p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Pending Submissions</h2>
                    <div className="space-y-3">
                        {recentSubmissions.length > 0 ? (
                            recentSubmissions.map(sub => <RecentSubmissionRow key={sub.id} submission={sub} />)
                        ) : (
                            <p className="text-slate-500 text-center py-4">No pending submissions.</p>
                        )}
                    </div>
                </StudioPanel>
                <StudioPanel className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-slate-900">Support Requests</h2>
                        {/* Displaying pending support requests using the Badge component */}
                        <Badge variant="destructive">{stats.supportRequests} Pending</Badge>
                    </div>
                    <p className="text-slate-600 mb-4">
                        Review and manage consultation requests from artists.
                    </p>
                    {/* Link to the dedicated support requests management page */}
                    <ActionButton icon={Headphones} iconPosition="left" to={createPageUrl("AdminSupportRequests")}>
                        Manage Support Requests
                    </ActionButton>
                </StudioPanel>
            </div>
        </div>
    );
}
