
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle, Plus, ArrowRight, Music, Youtube, Instagram, Twitter, 
  Facebook, RefreshCw, Loader2, Zap, Brain, Lightbulb, Target,
  ArrowUp, ArrowDown, ExternalLink, AlertCircle, Shield,
  MessageSquare, Users, TrendingUp, BarChart3
} from 'lucide-react';
import StudioPanel from '../components/StudioPanel';
import ActionButton from '../components/ActionButton';
import { 
    getCreatorAnalytics, 
    spotifyForArtists, 
    getYouTubeProfile, 
    getInstagramProfile, 
    getTikTokProfile, 
    getTwitterProfile, 
    getFacebookProfile, 
    getThreadsProfile,
    getPlatformAnalytics
} from '@/api/functions';
import AnimatedIcon from '../components/AnimatedIcon';
import LordIcon from '../components/LordIcon';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, Sector, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { InvokeLLM } from "@/api/integrations";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AnalyticsStatCard from '@/components/AnalyticsStatCard';
import AudienceCharts from '@/components/analytics/AudienceCharts';
import { formatDistanceToNow } from 'date-fns';
import { formatNumber } from '@/lib/utils';

const TikTokIcon = ({ size = 24, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.04-.1z"/>
    </svg>
);

const ThreadsIcon = ({ size = 24, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M13.492 10.155c-.29-.058-.58-.087-.87-.087s-.58.029-.87.087C10.021 10.5 8.877 11.2 8.877 12s1.144 1.5 2.875 1.5h1.272c1.73 0 2.875-.8 2.875-1.5s-1.145-1.5-2.875-1.5h-1.27c-.29 0-.58-.03-.87-.087C10.02 9.5 8.877 8.8 8.877 8s1.144-1.5 2.875-1.5h1.272c1.73 0 2.875.8 2.875 1.5s-1.145 1.5-2.875 1.5h-1.27c-.29 0-.58.03-.87.087zm-2.07-3.69C7.42 6.8 5.688 8.16 5.688 12s1.732 5.2 5.724 5.533c3.992.333 6.9-1.933 6.9-5.533s-2.908-5.866-6.9-5.533zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/>
    </svg>
);

const platformMeta = {
    spotify: {
        label: 'Listeners',
        icon: Music,
        color: 'text-green-600',
        bg: 'bg-green-100/50',
        gradient: 'from-green-500 to-emerald-600'
    },
    youtube: {
        label: 'Subscribers',
        icon: Youtube,
        color: 'text-red-600',
        bg: 'bg-red-100/50',
        gradient: 'from-red-500 to-pink-600'
    },
    instagram: {
        label: 'Followers',
        icon: Instagram,
        color: 'text-pink-600',
        bg: 'bg-pink-100/50',
        gradient: 'from-pink-500 to-rose-600'
    },
    tiktok: {
        label: 'Followers',
        icon: TikTokIcon, // Using custom SVG component
        color: 'text-slate-800',
        bg: 'bg-slate-200/50',
        gradient: 'from-slate-600 to-slate-800'
    },
    twitter: {
        label: 'Followers',
        icon: Twitter,
        color: 'text-blue-600',
        bg: 'bg-blue-100/50',
        gradient: 'from-blue-500 to-cyan-600'
    },
    facebook: {
        label: 'Followers',
        icon: Facebook,
        color: 'text-indigo-600',
        bg: 'bg-indigo-100/50',
        gradient: 'from-indigo-500 to-purple-600'
    },
    threads: {
        label: 'Followers',
        icon: ThreadsIcon, // Using custom SVG component
        color: 'text-slate-800',
        bg: 'bg-slate-200/50',
        gradient: 'from-gray-700 to-black'
    }
};

// Replace the duplicate AnalyticsStatCard component with a different name
const PlatformStatCard = ({ platform, data, isLoading, onRefresh }) => {
    const meta = platformMeta[platform];
    if (!meta) return null;

    const { name, icon: IconComponent, color } = meta;
    const followers = data.followers || 0;
    const growth = data.growth || 0;
    const isPositiveGrowth = growth >= 0;

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className={`w-full h-2 ${color}`} />
            <div className="p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center`}>
                            <IconComponent size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">{name}</h3>
                            <p className="text-xs text-slate-500">
                                {data.last_updated ? `Updated ${formatDistanceToNow(new Date(data.last_updated), { addSuffix: true })}` : 'Not updated yet'}
                            </p>
                        </div>
                    </div>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onRefresh(platform)}
                        disabled={isLoading}
                        className="text-slate-400 hover:text-slate-600"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    </Button>
                </div>

                <div className="mt-4 flex items-end justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase">Followers</p>
                        <p className="text-2xl font-bold text-slate-900">{formatNumber(followers)}</p>
                    </div>
                    <div className={`flex items-center px-2 py-1 rounded-md ${
                        isPositiveGrowth ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                        {isPositiveGrowth ? (
                            <ArrowUp className="h-3 w-3 mr-1" />
                        ) : (
                            <ArrowDown className="h-3 w-3 mr-1" />
                        )}
                        <span className="text-xs font-medium">{Math.abs(growth)}%</span>
                    </div>
                </div>

                {data.external_url && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <a
                            href={data.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs flex items-center text-blue-600 hover:text-blue-800"
                        >
                            View on {name} <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

const AIInsightsCard = ({ analytics }) => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(false);

    const generateInsights = async () => {
        setLoading(true);
        try {
            const totalFollowers = Object.values(analytics).reduce((sum, data) => sum + (data.followers || 0), 0);
            const platformCount = Object.keys(analytics).length;
            const topPlatform = Object.entries(analytics).reduce((prev, current) =>
                (analytics[prev[0]]?.followers || 0) > (analytics[current[0]]?.followers || 0) ? prev : current
            )?.[0] || 'none';

            const prompt = `Analyze these social media analytics and provide actionable insights:

Total Followers: ${totalFollowers}
Connected Platforms: ${platformCount}
Top Platform: ${topPlatform}

Platform breakdown:
${Object.entries(analytics).map(([platform, data]) =>
    `${platform}: ${data.followers || 0} followers, ${data.growth || 0}% growth`
).join('\n')}

Provide 3 specific, actionable recommendations for growth and engagement.`;

            const response = await InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        insights: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    priority: { type: "string", enum: ["high", "medium", "low"] }
                                },
                                required: ["title", "description", "priority"]
                            }
                        },
                        overall_score: { type: "number", description: "A score from 0-100 representing current growth potential." },
                        next_milestone: { type: "string", description: "A clear, achievable next goal for the artist." }
                    },
                    required: ["insights", "overall_score", "next_milestone"]
                }
            });

            setInsights(response);
        } catch (error) {
            console.error('Failed to generate AI insights:', error);
            setInsights({
                insights: [
                    {
                        title: "Focus on Content Consistency",
                        description: "Post regularly across your top-performing platforms to maintain engagement momentum. Consider a content calendar.",
                        priority: "high"
                    },
                    {
                        title: "Cross-Platform Promotion",
                        description: "Leverage your strongest platform to drive traffic and build audience on others where you have fewer followers.",
                        priority: "medium"
                    },
                    {
                        title: "Engage with Your Community",
                        description: "Actively respond to comments, messages, and mentions to foster a loyal and engaged audience.",
                        priority: "medium"
                    }
                ],
                overall_score: 75,
                next_milestone: "Reach 10,000 total followers across all platforms"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (Object.keys(analytics).length > 0 && !insights && !loading) {
            generateInsights();
        }
    }, [analytics, insights, loading]);

    const getPriorityColor = (priority) => {
        switch(priority) {
            case 'high': return 'text-red-600 bg-red-100';
            case 'medium': return 'text-orange-600 bg-orange-100';
            case 'low': return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <StudioPanel className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                        <Brain size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">AI Growth Insights</h3>
                        <p className="text-sm text-slate-600">Personalized recommendations based on your data</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={generateInsights} disabled={loading}>
                    {loading ? <AnimatedIcon icon="loading" size={16} trigger="spin" /> : <Zap size={16} />}
                    {loading ? 'Analyzing...' : 'Refresh'}
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                        <AnimatedIcon icon="loading" size={32} trigger="spin" className="text-purple-500 mx-auto mb-2" />
                        <p className="text-slate-600">AI is analyzing your analytics...</p>
                    </div>
                </div>
            ) : insights && insights.insights ? (
                <div className="space-y-4">
                    {insights.overall_score !== undefined && (
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-700">Growth Score</span>
                                <span className="text-2xl font-bold text-purple-600">{insights.overall_score}/100</span>
                            </div>
                            {insights.next_milestone && (
                                <p className="text-sm text-slate-600 mt-2">
                                    <Target size={14} className="inline mr-1" />
                                    Next milestone: {insights.next_milestone}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="space-y-3">
                        {insights.insights.map((insight, index) => (
                            <div key={index} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-3">
                                    <Lightbulb size={18} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-semibold text-slate-900">{insight.title}</h4>
                                            <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getPriorityColor(insight.priority))}>
                                                {insight.priority}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600">{insight.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-slate-500">
                    No insights available. Connect your platforms to get personalized recommendations!
                </div>
            )}
        </StudioPanel>
    );
};


const AnalyticsOverview = ({ analytics }) => {
    const totalFollowers = Object.values(analytics).reduce((sum, data) => sum + (data.followers || 0), 0);

    // Prepare data for charts
    const platformData = Object.entries(analytics).map(([platform, data]) => ({
        name: platform.charAt(0).toUpperCase() + platform.slice(1),
        followers: data.followers || 0,
        growth: data.growth || 0,
        color: platformMeta[platform]?.gradient || 'from-gray-500 to-gray-600'
    })).filter(item => item.followers > 0);

    const COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#f97316', '#6366f1'];

    const [activeIndex, setActiveIndex] = useState(0);
    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    const renderActiveShape = (props) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

        return (
            <g>
                <text x={cx} y={cy - 8} textAnchor="middle" fill="#1e293b" className="text-base font-bold">
                    {payload.name}
                </text>
                <text x={cx} y={cy + 12} textAnchor="middle" fill="#64748b" className="text-sm">
                    {`${value.toLocaleString()} (${(percent * 100).toFixed(1)}%)`}
                </text>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                    stroke="#fff"
                    strokeWidth={2}
                />
            </g>
        );
    };

    // Placeholder data for growth trend
    const GrowthTrendData = [
        { month: 'Jan', followers: Math.floor(totalFollowers * 0.7) },
        { month: 'Feb', followers: Math.floor(totalFollowers * 0.75) },
        { month: 'Mar', followers: Math.floor(totalFollowers * 0.82) },
        { month: 'Apr', followers: Math.floor(totalFollowers * 0.88) },
        { month: 'May', followers: Math.floor(totalFollowers * 0.94) },
        { month: 'Jun', followers: totalFollowers }
    ];

    return (
        <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StudioPanel className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
                        <Users size={24} className="text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-2">{totalFollowers.toLocaleString()}</h3>
                    <p className="text-slate-600">Total Followers</p>
                </StudioPanel>

                <StudioPanel className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
                        <TrendingUp size={24} className="text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-2">{platformData.length}</h3>
                    <p className="text-slate-600">Connected Platforms</p>
                </StudioPanel>

                <StudioPanel className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center mx-auto mb-4">
                        <BarChart3 size={24} className="text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-2">
                        {platformData.length > 0 ? Math.round(platformData.reduce((sum, p) => sum + p.growth, 0) / platformData.length) : 0}%
                    </h3>
                    <p className="text-slate-600">Avg Growth Rate</p>
                </StudioPanel>
            </div>

            {/* AI Insights */}
            <AIInsightsCard analytics={analytics} />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Platform Distribution Pie Chart */}
                <StudioPanel className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Platform Distribution</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        borderColor: '#e2e8f0',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        padding: '8px 12px'
                                    }}
                                    formatter={(value, name) => [`${value.toLocaleString()} followers`, name]}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Pie
                                    activeIndex={activeIndex}
                                    activeShape={renderActiveShape}
                                    data={platformData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    dataKey="followers"
                                    onMouseEnter={onPieEnter}
                                    paddingAngle={2}
                                >
                                    {platformData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Legend
                                    iconType="circle"
                                    wrapperStyle={{ paddingTop: '20px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </StudioPanel>

                {/* Growth Comparison Bar Chart */}
                <StudioPanel className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Growth Rate by Platform</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={platformData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => [`${value}%`, 'Growth Rate']} />
                                <Bar dataKey="growth" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </StudioPanel>

                {/* Follower Count Comparison */}
                <StudioPanel className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Followers by Platform</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={platformData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={80} />
                                <Tooltip formatter={(value) => [value.toLocaleString(), 'Followers']} />
                                <Bar dataKey="followers" fill="#06b6d4" radius={[0, 8, 8, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </StudioPanel>

                {/* Growth Trend Line Chart */}
                <StudioPanel className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Growth Trend (6 Months)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={GrowthTrendData}>
                                <defs>
                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value) => [value.toLocaleString(), 'Total Followers']} />
                                <Area
                                    type="monotone"
                                    dataKey="followers"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    fill="url(#colorGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </StudioPanel>
            </div>

            {/* Platform Performance Summary */}
            <StudioPanel className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Platform Performance Summary</h3>

                {/* Mobile Card Layout */}
                <div className="block md:hidden space-y-4">
                    {platformData.map((platform, index) => {
                        const IconComponent = platformMeta[platform.name.toLowerCase()]?.icon || Users;
                        return (
                        <div key={platform.name} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", platformMeta[platform.name.toLowerCase()]?.bg)}>
                                        <IconComponent size={18} className={platformMeta[platform.name.toLowerCase()]?.color} />
                                    </div>
                                    <span className="font-semibold text-slate-900">{platform.name}</span>
                                </div>
                                <span className={cn("font-medium text-sm", platform.growth > 0 ? "text-green-600" : "text-slate-600")}>
                                    {platform.growth > 0 ? '+' : ''}{platform.growth}%
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-500 text-xs uppercase tracking-wide">Followers</p>
                                    <p className="font-mono text-slate-900 font-semibold">{platform.followers.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs uppercase tracking-wide">Share</p>
                                    <p className="text-slate-600 font-semibold">
                                        {totalFollowers > 0 ? ((platform.followers / totalFollowers) * 100).toFixed(1) : 0}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    );})}
                </div>

                {/* Desktop Table Layout */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left py-4 px-4 font-semibold text-slate-900">Platform</th>
                                <th className="text-right py-4 px-4 font-semibold text-slate-900">Followers</th>
                                <th className="text-right py-4 px-4 font-semibold text-slate-900">Growth Rate</th>
                                <th className="text-right py-4 px-4 font-semibold text-slate-900">Share</th>
                            </tr>
                        </thead>
                        <tbody>
                            {platformData.map((platform, index) => {
                                const IconComponent = platformMeta[platform.name.toLowerCase()]?.icon || Users;
                                return (
                                <tr key={platform.name} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", platformMeta[platform.name.toLowerCase()]?.bg)}>
                                                <IconComponent size={16} className={platformMeta[platform.name.toLowerCase()]?.color} />
                                            </div>
                                            <span className="font-medium text-slate-900">{platform.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-right font-mono text-slate-900">{platform.followers.toLocaleString()}</td>
                                    <td className="py-4 px-4 text-right">
                                        <span className={cn("font-medium", platform.growth > 0 ? "text-green-600" : "text-slate-600")}>
                                            {platform.growth > 0 ? '+' : ''}{platform.growth}%
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-right text-slate-600">
                                        {totalFollowers > 0 ? ((platform.followers / totalFollowers) * 100).toFixed(1) : 0}%
                                    </td>
                                </tr>
                            );})}
                        </tbody>
                    </table>
                </div>
            </StudioPanel>
        </div>
    );
};

const PlatformConnectionCard = ({ onConnect, isConnecting }) => (
    <StudioPanel className="p-6 border-2 border-dashed border-slate-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all duration-300 cursor-pointer group" onClick={onConnect}>
        <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-purple-100 flex items-center justify-center mx-auto mb-3 transition-colors">
                <LordIcon icon="plus" size={24} className="text-slate-500 group-hover:text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-700 group-hover:text-purple-700 mb-1">Connect Platform</h3>
            <p className="text-sm text-slate-500">Add your social or music profile</p>
        </div>
    </StudioPanel>
);

const PlatformConnectionGrid = ({ onConnect, isConnecting, user, onSpotifyAuth }) => {
    const availablePlatforms = [
        {
            id: 'spotify',
            name: 'Spotify',
            icon: Music,
            placeholder: 'https://open.spotify.com/artist/...',
            color: 'from-green-500 to-emerald-600',
            hasAuth: true
        },
        {
            id: 'youtube',
            name: 'YouTube',
            icon: Youtube,
            placeholder: 'https://youtube.com/@username or https://youtube.com/channel/UC...',
            color: 'from-red-500 to-pink-600'
        },
        {
            id: 'instagram',
            name: 'Instagram',
            icon: Instagram,
            placeholder: 'https://instagram.com/username',
            color: 'from-pink-500 to-rose-600'
        },
        {
            id: 'tiktok',
            name: 'TikTok',
            icon: TikTokIcon,
            placeholder: 'https://tiktok.com/@username',
            color: 'from-slate-600 to-slate-800'
        },
        {
            id: 'twitter',
            name: 'Twitter/X',
            icon: Twitter,
            placeholder: 'https://twitter.com/username',
            color: 'from-blue-500 to-cyan-600'
        },
        {
            id: 'facebook',
            name: 'Facebook',
            icon: Facebook,
            placeholder: 'https://facebook.com/username or page ID',
            color: 'from-indigo-500 to-purple-600'
        },
        {
            id: 'threads',
            name: 'Threads',
            icon: ThreadsIcon,
            placeholder: 'https://threads.net/@username',
            color: 'from-gray-700 to-black'
        }
    ];

    const [selectedPlatform, setSelectedPlatform] = useState(null);
    const [platformUrl, setPlatformUrl] = useState('');

    const handleConnect = async (e) => {
        e.preventDefault();
        if (selectedPlatform?.id === 'spotify' && selectedPlatform.hasAuth) {
            // Handle Spotify for Artists authentication
            await onSpotifyAuth();
        } else if (platformUrl.trim()) {
            let finalUrl = platformUrl.trim();

            // If user enters a handle/username instead of a full URL, construct it.
            if (!finalUrl.startsWith('http') && !finalUrl.startsWith('www.') && !(/^\d+$/.test(finalUrl) && selectedPlatform.id === 'facebook')) {
                switch (selectedPlatform.id) {
                    case 'youtube':
                        finalUrl = `https://youtube.com/@${finalUrl}`;
                        break;
                    case 'instagram':
                        finalUrl = `https://instagram.com/${finalUrl}`;
                        break;
                    case 'tiktok':
                        finalUrl = `https://tiktok.com/@${finalUrl}`;
                        break;
                    case 'twitter':
                        finalUrl = `https://twitter.com/${finalUrl}`;
                        break;
                    case 'facebook':
                        // If it's a number, assume it's a page ID, otherwise a username
                        finalUrl = /^\d+$/.test(finalUrl) ? `https://facebook.com/${finalUrl}` : `https://facebook.com/${finalUrl}`;
                        break;
                    case 'threads':
                        finalUrl = `https://threads.net/@${finalUrl}`;
                        break;
                    default:
                        // Let detectPlatform handle the raw input if platform is unknown
                        break;
                }
            }
            // Handle regular URL-based connections
            onConnect(finalUrl);
        }
        setPlatformUrl('');
        setSelectedPlatform(null);
    };

    const handlePlatformSelect = (platform) => {
        setSelectedPlatform(platform);
        if (platform.id === 'spotify' && platform.hasAuth) {
            // For Spotify, we don't need URL input, just show auth option
            setPlatformUrl('spotify-auth'); // Set a dummy value to indicate auth flow
        } else {
            setPlatformUrl(''); // Clear for other platforms
        }
    };

    // Determine if a platform is connected based on user object's stored URLs or spotify_for_artists_connected
    const isPlatformConnected = (platformId) => {
        if (!user) return false;
        if (platformId === 'spotify') {
            return user.spotify_for_artists_connected;
        }
        // Check for existence of platform-specific URL on the user object
        const urlProperty = `${platformId}_url`;
        return !!user[urlProperty];
    };

    return (
        <StudioPanel className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                    <Plus size={20} className="text-white" />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-900">Connect Platforms</h3>
                    <p className="text-sm text-slate-600">Add your social and music profiles for analytics</p>
                </div>
            </div>

            {!selectedPlatform ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availablePlatforms.map(platform => {
                        const isConnected = isPlatformConnected(platform.id);
                        const IconComponent = platform.icon;

                        return (
                            <button
                                key={platform.id}
                                onClick={() => handlePlatformSelect(platform)}
                                className={`p-4 rounded-xl border transition-all duration-200 group relative ${
                                    isConnected
                                        ? 'border-green-300 bg-green-50'
                                        : 'border-slate-200 hover:border-purple-300 hover:shadow-md'
                                }`}
                            >
                                {isConnected && (
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                        <CheckCircle size={14} className="text-white" />
                                    </div>
                                )}

                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${platform.color} flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                                    <IconComponent size={20} className="text-white" />
                                </div>
                                <p className="font-medium text-slate-800 text-sm">{platform.name}</p>
                                {isConnected && (
                                    <p className="text-xs text-green-600 mt-1">Connected</p>
                                )}
                                {platform.hasAuth && !isConnected && (
                                    <p className="text-xs text-purple-600 mt-1">Auth Required</p>
                                )}
                            </button>
                        );
                    })}
                </div>
            ) : (
                <form onSubmit={handleConnect} className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${selectedPlatform.color} flex items-center justify-center`}>
                            {React.createElement(selectedPlatform.icon, { size: 20, className: "text-white" })}
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-900">Connect {selectedPlatform.name}</h4>
                            <p className="text-sm text-slate-600">
                                {selectedPlatform.hasAuth
                                    ? 'Authenticate with your account for detailed analytics'
                                    : 'Enter your profile URL'
                                }
                            </p>
                        </div>
                    </div>

                    {!selectedPlatform.hasAuth && (
                        <div>
                            <Label htmlFor="platform-url" className="text-sm font-medium text-slate-700">
                                {selectedPlatform.name} Profile URL
                            </Label>
                            <Input
                                id="platform-url"
                                value={platformUrl}
                                onChange={(e) => setPlatformUrl(e.target.value)}
                                placeholder={selectedPlatform.placeholder}
                                className="mt-1"
                                autoFocus
                            />
                        </div>
                    )}

                    {selectedPlatform.hasAuth && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield size={16} className="text-green-600" />
                                <p className="text-sm font-medium text-green-800">Secure Authentication</p>
                            </div>
                            <p className="text-sm text-green-700">
                                Connect your {selectedPlatform.name} for Artists account to access detailed streaming analytics,
                                top tracks, and audience insights.
                            </p>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setSelectedPlatform(null);
                                setPlatformUrl('');
                            }}
                        >
                            Back
                        </Button>
                        <ActionButton
                            type="submit"
                            disabled={(!platformUrl.trim() && !selectedPlatform.hasAuth) || isConnecting}
                            icon={isConnecting ? "loading" : selectedPlatform.hasAuth ? "userPlus" : "plus"}
                            className="flex-1"
                        >
                            {isConnecting ? 'Connecting...' :
                                selectedPlatform.hasAuth ? 'Authenticate' : 'Connect Platform'}
                        </ActionButton>
                    </div>
                </form>
            )}
        </StudioPanel>
    );
};

export default function AnalyticsPage() {
    const { user, updateUser } = useAuth();
    const [analytics, setAnalytics] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [fetchingPlatforms, setFetchingPlatforms] = useState(new Set());
    const [error, setError] = useState(null);

    useEffect(() => {
        const initialize = async () => {
            if (!user) return;
            
            try {
                // Handle Spotify callback
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('spotify_connected') === 'true') {
                    // Note: In a real implementation, you might want to re-fetch user data here
                    // For now, we'll assume the user data is up to date
                    if (user?.spotify_for_artists_connected) {
                        await handleSpotifyAnalyticsFetch(); // Fetch analytics right away
                    }
                    window.history.replaceState({}, '', window.location.pathname);
                } else if (urlParams.get('spotify_error')) {
                    setError(`Spotify connection failed: ${urlParams.get('spotify_error')}`);
                    window.history.replaceState({}, '', window.location.pathname);
                }

                // Fetch analytics for already connected platforms
                const platformsToFetchPromises = [];

                // List of potential platform URLs on the user object (excluding spotify, which has its own flow)
                const knownUrlFields = {
                    youtube: user.youtube_url,
                    instagram: user.instagram_url,
                    tiktok: user.tiktok_url,
                    twitter: user.twitter_url,
                    facebook: user.facebook_url,
                    threads: user.threads_url,
                };

                for (const platformId in knownUrlFields) {
                    const url = knownUrlFields[platformId];
                    if (url) {
                        platformsToFetchPromises.push(handlePlatformAnalyticsFetch(url));
                    }
                }

                // Handle Spotify for Artists specifically
                if (user.spotify_for_artists_connected) {
                    platformsToFetchPromises.push(handleSpotifyAnalyticsFetch());
                }

                // Await all initial fetches, but allow them to complete independently
                await Promise.allSettled(platformsToFetchPromises);

            } catch (err) {
                console.warn('User not logged in or failed to fetch initial analytics:', err);
            } finally {
                setIsLoading(false);
            }
        };
        initialize();
    }, [user, updateUser]);

    const handlePlatformAnalyticsFetch = async (platformUrl) => {
        const platform = detectPlatform(platformUrl);
        if (!platform || platform === 'unknown') {
            setError('Unsupported platform URL');
            return;
        }

        setFetchingPlatforms(prev => new Set([...prev, platform]));
        setError(null);

        try {
            let result;

            if (platform === 'spotify') {
                // Spotify uses its own authentication flow
                result = await spotifyForArtists({ action: 'analytics' });
            } else {
                // Use the appropriate platform-specific function based on the detected platform
                switch (platform) {
                    case 'youtube':
                        result = await getYouTubeProfile({ url: platformUrl });
                        break;
                    case 'instagram':
                        result = await getInstagramProfile({ url: platformUrl });
                        break;
                    case 'tiktok':
                        result = await getTikTokProfile({ url: platformUrl });
                        break;
                    case 'twitter':
                        result = await getTwitterProfile({ url: platformUrl });
                        break;
                    case 'facebook':
                        result = await getFacebookProfile({ url: platformUrl });
                        break;
                    case 'threads':
                        result = await getThreadsProfile({ url: platformUrl });
                        break;
                    default:
                        // Fallback to generic platform analytics
                        result = await getPlatformAnalytics(platformUrl);
                }
            }

            console.log(`Analytics result for ${platform}:`, result);

            if (result.data) {
                // Update the analytics state with the new platform data
                setAnalytics(prev => ({
                    ...prev,
                    [platform]: {
                        ...result.data,
                        last_updated: new Date().toISOString()
                    }
                }));

                // If this was a new connection, update the user's profile with the URL
                if (!isPlatformConnected(platform)) {
                    const urlField = `${platform}_url`;
                    const userData = { [urlField]: platformUrl };
                    await updateUser(userData);
                }
            } else {
                throw new Error('No data returned from analytics API');
            }
        } catch (error) {
            console.error(`${platform} analytics error:`, error);
            setError(`Failed to fetch ${platform} analytics: ${error.message}`);
        } finally {
            setFetchingPlatforms(prev => {
                const newSet = new Set(prev);
                newSet.delete(platform);
                return newSet;
            });
        }
    };

    // Helper function to parse view/subscriber counts
    const parseViewCount = (countText) => {
        if (!countText) return 0;
        const match = countText.match(/[\d,]+/);
        if (match) {
            return parseInt(match[0].replace(/,/g, ''), 10);
        }
        return 0;
    };

    const handleRefreshPlatform = async (platform) => {
        const platformData = analytics[platform];
        if (platform === 'spotify' && user?.spotify_for_artists_connected) {
            await handleSpotifyAnalyticsFetch();
        } else {
            let urlToRefresh = platformData?.external_url;
            if (!urlToRefresh && user) {
                const urlProperty = `${platform}_url`;
                urlToRefresh = user[urlProperty];
            }

            if (urlToRefresh) {
                await handlePlatformAnalyticsFetch(urlToRefresh);
            } else {
                console.warn(`Cannot refresh ${platform}: No URL found.`);
                setError(`Cannot refresh ${platform}: No URL found. Please reconnect this platform.`);
            }
        }
    };

    const handleSpotifyAuth = async () => {
        setFetchingPlatforms(prev => new Set([...prev, 'spotify']));
        setError(null);
        try {
            const response = await spotifyForArtists({ action: 'connect' });
            if (response.data?.auth_url) {
                window.location.href = response.data.auth_url;
            } else {
                throw new Error("No Spotify auth URL provided.");
            }
        } catch (error) {
            console.error('Spotify connect error:', error);
            setError('Failed to connect to Spotify. Please try again.');
        } finally {
            setFetchingPlatforms(prev => {
                const newSet = new Set(prev);
                newSet.delete('spotify');
                return newSet;
            });
        }
    };

    const handleSpotifyAnalyticsFetch = async () => {
        setFetchingPlatforms(prev => new Set([...prev, 'spotify']));
        setError(null);
        try {
            const response = await spotifyForArtists({ action: 'analytics' });
            if (response.data) {
                setAnalytics(prev => ({
                    ...prev,
                    spotify: {
                        ...response.data,
                        followers: response.data.profile?.followers || 0,
                        external_url: `https://artists.spotify.com/`,
                        last_updated: new Date().toISOString()
                    }
                }));
            } else {
                console.warn("Spotify analytics fetch returned no data.");
                setError("No Spotify analytics data available. Please ensure your account has sufficient data.");
            }
        } catch (error) {
            console.error('Spotify analytics error:', error);
            setError('Failed to fetch Spotify analytics. Please try reconnecting your account.');
        } finally {
            setFetchingPlatforms(prev => {
                const newSet = new Set(prev);
                newSet.delete('spotify');
                return newSet;
            });
        }
    };

    const detectPlatform = (url) => {
        if (!url) return 'unknown';
        const cleanUrl = url.toLowerCase();
        if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) return 'youtube';
        if (cleanUrl.includes('spotify.com')) return 'spotify';
        if (cleanUrl.includes('instagram.com')) return 'instagram';
        if (cleanUrl.includes('tiktok.com')) return 'tiktok';
        if (cleanUrl.includes('twitter.com') || cleanUrl.includes('x.com')) return 'twitter';
        if (cleanUrl.includes('facebook.com')) return 'facebook';
        if (cleanUrl.includes('threads.net')) return 'threads';
        return 'unknown';
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <AnimatedIcon icon="loading" size={48} className="text-purple-600" trigger="spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-20">
                <p className="text-slate-600 mb-4">Please log in to access analytics.</p>
                <ActionButton onClick={() => User.login()}>Log In</ActionButton>
            </div>
        );
    }

    const determineConnectedPlatforms = () => {
        const connectedPlatformsSet = new Set();

        // Add platforms for which we have analytics data
        Object.keys(analytics).forEach(p => connectedPlatformsSet.add(p));

        // Add platforms connected via stored URLs or auth
        if (user) {
            if (user.spotify_for_artists_connected) {
                connectedPlatformsSet.add('spotify');
            }

            const platformUrls = ['youtube_url', 'instagram_url', 'tiktok_url', 'twitter_url', 'facebook_url', 'threads_url'];
            platformUrls.forEach(urlField => {
                if (user[urlField]) {
                    const platform = urlField.replace('_url', '');
                    connectedPlatformsSet.add(platform);
                }
            });
        }

        return Array.from(connectedPlatformsSet).sort();
    };

    const connectedPlatforms = determineConnectedPlatforms();
    const hasAnalytics = connectedPlatforms.length > 0;

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Analytics</h1>
                    <p className="text-lg text-slate-700 mt-1">Track your growth across all platforms</p>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <StudioPanel className="p-4 bg-red-50 border-red-200">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        <div>
                            <p className="text-red-700 font-medium">Connection Error</p>
                            <p className="text-red-600 text-sm">{error}</p>
                            <button
                                onClick={() => setError(null)}
                                className="text-red-500 underline text-sm mt-1 hover:text-red-700"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </StudioPanel>
            )}

            {/* Analytics Tabs */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview">Analytics Overview</TabsTrigger>
                    <TabsTrigger value="platforms">Platform Management</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-8">
                    {hasAnalytics ? (
                        <AnalyticsOverview analytics={analytics} />
                    ) : (
                        <StudioPanel className="text-center p-12 border-dashed">
                            <LordIcon icon="chart" size={64} className="mx-auto text-slate-300 mb-4" />
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Analytics Data Yet</h3>
                            <p className="text-slate-600 mb-6 max-w-md mx-auto">
                                Connect your platforms in the Platform Management tab to start seeing detailed analytics and insights.
                            </p>
                        </StudioPanel>
                    )}
                </TabsContent>

                <TabsContent value="platforms" className="mt-8">
                    {/* Platform Connection Grid */}
                    <PlatformConnectionGrid
                        onConnect={handlePlatformAnalyticsFetch}
                        isConnecting={fetchingPlatforms.size > 0}
                        user={user}
                        onSpotifyAuth={handleSpotifyAuth}
                    />

                    {/* Connected Platforms */}
                    {hasAnalytics && (
                        <div className="mt-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Connected Platforms</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {connectedPlatforms.map(platform => (
                                    <PlatformStatCard
                                        key={platform}
                                        platform={platform}
                                        data={analytics[platform] || { followers: 0, growth: 0 }}
                                        isLoading={fetchingPlatforms.has(platform)}
                                        onRefresh={handleRefreshPlatform}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
