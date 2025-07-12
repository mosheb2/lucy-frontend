import Layout from "./Layout.jsx";
import Dashboard from "./Dashboard";
import Settings from "./Settings";
import Promotion from "./Promotion";
import Collaborate from "./Collaborate";
import Artist from "./Artist";
import IntegratedAnalytics from "./IntegratedAnalytics";
import SocialFeed from "./SocialFeed";
import Analytics from "./Analytics";
import AdminDashboard from "./AdminDashboard";
import AdminUserManagement from "./AdminUserManagement";
import AdminContentManagement from "./AdminContentManagement";
import AdminPlatformAnalytics from "./AdminPlatformAnalytics";
import AdminPlatformSettings from "./AdminPlatformSettings";
import Explore from "./Explore";
import Menu from "./Menu";
import AdminSubmissions from "./AdminSubmissions";
import YouTubeTool from "./YouTubeTool";
import Studio from "./Studio";
import LandingPage from "./LandingPage";
import AdminSupportRequests from "./AdminSupportRequests";
import Messenger from "./Messenger";
import AdminMentorManagement from "./AdminMentorManagement";
import MusicLibrary from "./MusicLibrary";
import Distribution from "./Distribution";
import SongRegistration from "./SongRegistration";
import Support from "./Support";
import AuthCallback from "./AuthCallback";
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import ConnectWallet from './ConnectWallet';
import RequireAuth from './RequireAuth';
import { useAuth } from '@/contexts/AuthContext';

const PAGES = {
    Dashboard: Dashboard,
    Settings: Settings,
    Promotion: Promotion,
    Collaborate: Collaborate,
    Artist: Artist,
    IntegratedAnalytics: IntegratedAnalytics,
    SocialFeed: SocialFeed,
    Analytics: Analytics,
    AdminDashboard: AdminDashboard,
    AdminUserManagement: AdminUserManagement,
    AdminContentManagement: AdminContentManagement,
    AdminPlatformAnalytics: AdminPlatformAnalytics,
    AdminPlatformSettings: AdminPlatformSettings,
    Explore: Explore,
    Menu: Menu,
    AdminSubmissions: AdminSubmissions,
    Layout: Layout,
    YouTubeTool: YouTubeTool,
    Studio: Studio,
    LandingPage: LandingPage,
    AdminSupportRequests: AdminSupportRequests,
    Messenger: Messenger,
    AdminMentorManagement: AdminMentorManagement,
    MusicLibrary: MusicLibrary,
    Distribution: Distribution,
    SongRegistration: SongRegistration,
    Support: Support,
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                <Route path="/" element={<Dashboard />} />
                <Route path="/Dashboard" element={<Dashboard />} />
                <Route path="/Settings" element={<Settings />} />
                <Route path="/Promotion" element={<Promotion />} />
                <Route path="/Collaborate" element={<Collaborate />} />
                <Route path="/Artist" element={<Artist />} />
                <Route path="/IntegratedAnalytics" element={<IntegratedAnalytics />} />
                <Route path="/SocialFeed" element={<SocialFeed />} />
                <Route path="/Analytics" element={<Analytics />} />
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                <Route path="/AdminUserManagement" element={<AdminUserManagement />} />
                <Route path="/AdminContentManagement" element={<AdminContentManagement />} />
                <Route path="/AdminPlatformAnalytics" element={<AdminPlatformAnalytics />} />
                <Route path="/AdminPlatformSettings" element={<AdminPlatformSettings />} />
                <Route path="/Explore" element={<Explore />} />
                <Route path="/Menu" element={<Menu />} />
                <Route path="/AdminSubmissions" element={<AdminSubmissions />} />
                <Route path="/Layout" element={<Layout />} />
                <Route path="/YouTubeTool" element={<YouTubeTool />} />
                <Route path="/Studio" element={<Studio />} />
                <Route path="/LandingPage" element={<LandingPage />} />
                <Route path="/AdminSupportRequests" element={<AdminSupportRequests />} />
                <Route path="/Messenger" element={<Messenger />} />
                <Route path="/AdminMentorManagement" element={<AdminMentorManagement />} />
                <Route path="/MusicLibrary" element={<MusicLibrary />} />
                <Route path="/Distribution" element={<Distribution />} />
                <Route path="/SongRegistration" element={<SongRegistration />} />
                <Route path="/Support" element={<Support />} />
                
                {/* Catch-all route for 404s */}
                <Route path="*" element={<Navigate to="/Dashboard" replace />} />
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/connect-wallet" element={<ConnectWallet />} />
                <Route path="*" element={
                  <RequireAuth>
                    <PagesContent />
                  </RequireAuth>
                } />
            </Routes>
        </Router>
    );
}
