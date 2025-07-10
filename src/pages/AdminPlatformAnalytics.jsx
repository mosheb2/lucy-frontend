import React, { useState, useEffect } from "react";
import { Track, Release } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { useAuth } from "@/contexts/AuthContext";
import { adminAPI } from "@/api/admin";
import GlassCard from "../components/GlassCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShieldCheck,
  AlertTriangle,
  BarChart2,
  LineChart,
  PieChart,
  Users,
  Music,
  Disc3,
  DollarSign,
  Calendar,
  ArrowUp,
  ArrowDown,
  Globe,
  Loader2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// Key metric card
const MetricCard = ({ title, value, change, icon: Icon, color }) => {
  const isPositive = change >= 0;
  
  return (
    <GlassCard className="p-6">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-medium text-white">{title}</h3>
        <div className={`p-3 rounded-full bg-${color}-500/20`}>
          <Icon className={`w-5 h-5 text-${color}-400`} />
        </div>
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <div className="flex items-center">
        <div className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          <span className="font-medium">{Math.abs(change)}%</span>
        </div>
        <span className="text-white/60 text-sm ml-1">vs. last period</span>
      </div>
    </GlassCard>
  );
};

export default function AdminPlatformAnalyticsPage() {
  const { user: currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [timePeriod, setTimePeriod] = useState("30d");
  const [analyticsData, setAnalyticsData] = useState(null);
  
  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser) return;
      setIsLoading(true);
      try {
        const adminStatus = await adminAPI.isAdmin();
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
      setIsLoading(false);
    };

    checkAdminStatus();
  }, [currentUser]);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!isAdmin) return;
      
      setDataLoading(true);
      try {
        // In a real implementation, you'd fetch actual analytics data from your backend
        // For demo purposes, we'll use the AI to generate some realistic-looking data
        const result = await InvokeLLM({
          prompt: `Generate realistic music platform analytics data for an admin dashboard for a ${timePeriod} period.
            Include:
            1. Overall metrics: total users, tracks, releases, and revenue
            2. User metrics: new users over time, user roles distribution, user growth metrics
            3. Content metrics: tracks and releases by status, genre distribution, track upload trends
            4. Platform usage: daily active users, content engagement metrics
            5. Revenue metrics: revenue by source (streams, downloads, etc.)
            Make the data realistic with appropriate trends and patterns.
            `,
          response_json_schema: {
            type: "object",
            properties: {
              overall: {
                type: "object",
                properties: {
                  totalUsers: { type: "number" },
                  totalTracks: { type: "number" },
                  totalReleases: { type: "number" },
                  totalRevenue: { type: "number" },
                  userGrowth: { type: "number" },
                  contentGrowth: { type: "number" },
                  revenueGrowth: { type: "number" }
                }
              },
              userMetrics: {
                type: "object",
                properties: {
                  newUsersOverTime: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        date: { type: "string" },
                        value: { type: "number" }
                      }
                    }
                  },
                  userRolesDistribution: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        value: { type: "number" }
                      }
                    }
                  },
                  activeUsers: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        date: { type: "string" },
                        value: { type: "number" }
                      }
                    }
                  }
                }
              },
              contentMetrics: {
                type: "object",
                properties: {
                  tracksByStatus: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        value: { type: "number" }
                      }
                    }
                  },
                  genreDistribution: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        value: { type: "number" }
                      }
                    }
                  },
                  contentUploadsOverTime: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        date: { type: "string" },
                        tracks: { type: "number" },
                        releases: { type: "number" }
                      }
                    }
                  }
                }
              },
              revenueMetrics: {
                type: "object",
                properties: {
                  revenueBySource: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        value: { type: "number" }
                      }
                    }
                  },
                  revenueOverTime: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        date: { type: "string" },
                        value: { type: "number" }
                      }
                    }
                  }
                }
              }
            }
          }
        });
        
        setAnalyticsData(result);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        // Set some fallback data for demonstration
        setAnalyticsData({
          overall: {
            totalUsers: 2547,
            totalTracks: 15683,
            totalReleases: 1892,
            totalRevenue: 145632.87,
            userGrowth: 12.5,
            contentGrowth: 8.2,
            revenueGrowth: 15.3
          },
          // Other metrics would be populated with fallback data too...
        });
      }
      setDataLoading(false);
    };

    if (isAdmin && !isLoading) {
      fetchAnalyticsData();
    }
  }, [isAdmin, isLoading, timePeriod]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-128px)] text-white">
        <Loader2 className="w-12 h-12 animate-spin text-purple-400 mb-4" />
        <p className="text-xl">Loading Platform Analytics...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <GlassCard className="p-8 mt-10 max-w-lg mx-auto text-center" glowColor="rgba(220, 38, 38, 0.1)">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-white/70">You do not have permission to view this page.</p>
      </GlassCard>
    );
  }

  const CHART_COLORS = [
    "#8b5cf6", // purple
    "#10b981", // emerald
    "#3b82f6", // blue
    "#f59e0b", // amber
    "#ec4899", // pink
    "#6366f1"  // indigo
  ];

  return (
    <div className="space-y-6">
      <GlassCard className="p-6" glowColor="rgba(59, 130, 246, 0.1)">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <BarChart2 className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Platform Analytics</h1>
              <p className="text-white/70">Comprehensive analytics and insights</p>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent className="bg-black/70 backdrop-blur-md text-white border-white/20">
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
          </div>
        </div>
      </GlassCard>

      {dataLoading ? (
        <div className="flex flex-col items-center justify-center p-12">
          <Loader2 className="w-12 h-12 animate-spin text-blue-400 mb-4" />
          <p className="text-white">Loading analytics data...</p>
        </div>
      ) : analyticsData ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard 
              title="Total Users" 
              value={analyticsData.overall.totalUsers.toLocaleString()} 
              change={analyticsData.overall.userGrowth} 
              icon={Users}
              color="blue"
            />
            <MetricCard 
              title="Total Tracks" 
              value={analyticsData.overall.totalTracks.toLocaleString()} 
              change={analyticsData.overall.contentGrowth} 
              icon={Music}
              color="green"
            />
            <MetricCard 
              title="Total Releases" 
              value={analyticsData.overall.totalReleases.toLocaleString()} 
              change={analyticsData.overall.contentGrowth} 
              icon={Disc3}
              color="purple"
            />
            <MetricCard 
              title="Total Revenue" 
              value={`$${analyticsData.overall.totalRevenue.toLocaleString()}`} 
              change={analyticsData.overall.revenueGrowth} 
              icon={DollarSign}
              color="amber"
            />
          </div>

          {/* User Metrics Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">User Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth Chart */}
              <GlassCard className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">New User Registrations</h3>
                  <LineChart className="h-5 w-5 text-blue-400" />
                </div>
                <div className="h-80">
                  {analyticsData.userMetrics?.newUsersOverTime && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData.userMetrics.newUsersOverTime}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
                        <YAxis stroke="rgba(255,255,255,0.7)" />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            color: 'white'
                          }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#3b82f6" 
                          fillOpacity={1} 
                          fill="url(#colorUsers)" 
                          name="New Users"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </GlassCard>
              
              {/* User Roles Distribution */}
              <GlassCard className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">User Roles Distribution</h3>
                  <PieChart className="h-5 w-5 text-purple-400" />
                </div>
                <div className="h-80">
                  {analyticsData.userMetrics?.userRolesDistribution && (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={analyticsData.userMetrics.userRolesDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analyticsData.userMetrics.userRolesDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            color: 'white'
                          }} 
                        />
                        <Legend layout="vertical" verticalAlign="middle" align="right" />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Content Metrics Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Content Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Genre Distribution */}
              <GlassCard className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Genre Distribution</h3>
                  <PieChart className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="h-80">
                  {analyticsData.contentMetrics?.genreDistribution && (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={analyticsData.contentMetrics.genreDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analyticsData.contentMetrics.genreDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            color: 'white'
                          }} 
                        />
                        <Legend layout="vertical" verticalAlign="middle" align="right" />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </GlassCard>
              
              {/* Content Uploads Over Time */}
              <GlassCard className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Content Uploads</h3>
                  <BarChart2 className="h-5 w-5 text-indigo-400" />
                </div>
                <div className="h-80">
                  {analyticsData.contentMetrics?.contentUploadsOverTime && (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={analyticsData.contentMetrics.contentUploadsOverTime}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
                        <YAxis stroke="rgba(255,255,255,0.7)" />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            color: 'white'
                          }} 
                        />
                        <Legend />
                        <Bar dataKey="tracks" fill="#3b82f6" name="Tracks" />
                        <Bar dataKey="releases" fill="#8b5cf6" name="Releases" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Revenue Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Revenue Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Over Time */}
              <GlassCard className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Revenue Trends</h3>
                  <LineChart className="h-5 w-5 text-amber-400" />
                </div>
                <div className="h-80">
                  {analyticsData.revenueMetrics?.revenueOverTime && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData.revenueMetrics.revenueOverTime}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
                        <YAxis stroke="rgba(255,255,255,0.7)" />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            color: 'white'
                          }} 
                          formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#f59e0b" 
                          fillOpacity={1} 
                          fill="url(#colorRevenue)" 
                          name="Revenue"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </GlassCard>
              
              {/* Revenue By Source */}
              <GlassCard className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Revenue by Source</h3>
                  <PieChart className="h-5 w-5 text-pink-400" />
                </div>
                <div className="h-80">
                  {analyticsData.revenueMetrics?.revenueBySource && (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={analyticsData.revenueMetrics.revenueBySource}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analyticsData.revenueMetrics.revenueBySource.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            color: 'white'
                          }} 
                          formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                        />
                        <Legend layout="vertical" verticalAlign="middle" align="right" />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>
        </>
      ) : (
        <GlassCard className="p-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-400 mb-4" />
          <h3 className="text-xl font-semibold text-white">Failed to load analytics data</h3>
          <p className="text-white/70 mt-2">Please try refreshing the page.</p>
          <Button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 hover:bg-blue-700"
          >
            Refresh Page
          </Button>
        </GlassCard>
      )}
    </div>
  );
}