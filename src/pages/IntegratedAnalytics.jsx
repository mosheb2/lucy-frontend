
import React, { useState, useEffect } from 'react';
import { InvokeLLM } from "@/api/integrations";
import { Track, Release } from '@/api/entities';
import { useAuth } from '@/contexts/AuthContext';
import GlassCard from "../components/GlassCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO, subDays } from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Music,
  Youtube,
  BarChart3,
  RefreshCw,
  Calendar,
  Globe,
  ArrowUpRight,
  Link as LinkIcon, // Renamed to avoid conflict
  Users,
  Loader2,
  AlertTriangle,
  Instagram,
  Facebook,
  ArrowUp,
  ArrowDown,
  HelpCircle,
  Info,
  Sparkles, // For AI Tips
  MousePointerClick // For website traffic
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

// Simulated platform icons
const platformIcons = {
  spotify: <Music className="h-4 w-4" />, 
  youtube: <Youtube className="h-4 w-4" />,
  instagram: <Instagram className="h-4 w-4" />,
  facebook: <Facebook className="h-4 w-4" />,
  apple: <Music className="h-4 w-4" />,
  google: <Globe className="h-4 w-4" /> // For Google Analytics
};

const COLORS = ['#1ED760', '#FF0000', '#E1306C', '#4267B2', '#FF9500', '#4285F4']; // Added Google Blue

// PlatformIntegrationStatus component for showing integration status
const PlatformIntegrationStatus = ({ platform, connected, onClick }) => {
  return (
    <div 
      className={`flex items-center justify-between p-3 rounded-lg ${connected 
        ? 'bg-green-500/20 border border-green-500/30' 
        : 'bg-white/10 border border-white/20'}`}
      onClick={onClick}
      role="button"
      aria-pressed={connected}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${connected ? 'bg-green-500/20' : 'bg-white/10'}`}>
          {platformIcons[platform.toLowerCase()] || <Globe className="h-4 w-4" />}
        </div>
        <div>
          <p className="text-white font-medium">{platform}</p>
          <p className="text-xs text-white/60">
            {connected ? 'Connected' : 'Not connected'}
          </p>
        </div>
      </div>
      <Badge variant={connected ? "success" : "outline"} className={connected 
        ? "bg-green-500/20 text-green-300 border-green-500/40" 
        : "bg-white/10 text-white/60 border-white/20"}>
        {connected ? 'Active' : 'Connect'}
      </Badge>
    </div>
  );
};

// StatsCard component for displaying key metrics
const StatsCard = ({ title, value, platform, change, loading }) => {
  return (
    <GlassCard className="p-5">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-sm font-medium text-white/70">{title}</h3>
        <div className="p-2 rounded-full bg-white/10">
          {platformIcons[platform.toLowerCase()] || <BarChart3 className="h-4 w-4" />}
        </div>
      </div>
      
      {loading ? (
        <Skeleton className="h-8 w-24 bg-white/10" />
      ) : (
        <>
          <p className="text-2xl font-bold text-white mb-2">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              <span>{Math.abs(change)}%</span>
              <span className="text-white/50 text-xs">vs last period</span>
            </div>
          )}
        </>
      )}
    </GlassCard>
  );
};

// ConnectPlatformDialog component for showing integration dialog
const ConnectPlatformDialog = ({ platform, isOpen, onClose, onConnect }) => {
  const [connecting, setConnecting] = useState(false);
  
  const handleConnect = async () => {
    setConnecting(true);
    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 1500));
    setConnecting(false);
    onConnect(platform);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="backdrop-blur-xl bg-black/70 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle>Connect to {platform}</DialogTitle>
          <DialogDescription className="text-white/70">
            Connect your {platform} account to import analytics data automatically.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex flex-col items-center justify-center p-6 gap-4">
            <div className="p-4 rounded-full bg-white/10">
              {platformIcons[platform.toLowerCase()] || <Globe className="h-8 w-8" />}
            </div>
            <p className="text-white/70 text-center">
              In a real implementation, this would redirect to the {platform} OAuth flow for authorization.
            </p>
          </div>
          
          <div className="bg-white/10 p-3 rounded-md">
            <h4 className="font-medium text-white flex items-center gap-2">
              <Info className="h-4 w-4" /> Permissions requested
            </h4>
            <ul className="text-white/70 text-sm mt-2 space-y-1 ml-6 list-disc">
              <li>Read your analytics data</li>
              <li>View your public profile</li>
              <li>View your audience demographics</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="backdrop-blur-sm bg-white/5 hover:bg-white/10 border-white/20 text-white/80 hover:text-white">
            Cancel
          </Button>
          <Button onClick={handleConnect} disabled={connecting}>
            {connecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Connecting...
              </>
            ) : (
              <>
                <LinkIcon className="h-4 w-4 mr-2" /> Connect Account
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// AI Tips Component
const AiTipsSection = ({ tips, isLoading }) => {
  if (isLoading) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center mb-3">
          <Sparkles className="h-6 w-6 text-purple-400 mr-3 animate-pulse" />
          <h2 className="text-xl font-semibold text-white">Generating AI-Powered Tips...</h2>
        </div>
        <div className="space-y-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-8 w-full bg-white/10" />)}
        </div>
      </GlassCard>
    );
  }

  if (!tips || tips.length === 0) {
    return (
      <GlassCard className="p-6 text-center">
        <Sparkles className="h-10 w-10 text-white/30 mx-auto mb-3" />
        <p className="text-white/70">No tips available at the moment. Connect more platforms or check back later.</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6" glowColor="rgba(168, 85, 247, 0.15)">
      <div className="flex items-center mb-4">
        <Sparkles className="h-7 w-7 text-purple-400 mr-3" />
        <h2 className="text-xl font-semibold text-white">AI-Powered Growth Tips</h2>
      </div>
      <ul className="space-y-3">
        {tips.map((tip, index) => (
          <li key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="mt-1 p-1.5 bg-purple-500/20 rounded-full">
                <Sparkles className="h-4 w-4 text-purple-300" />
            </div>
            <p className="text-white/90 text-sm">{tip}</p>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
};


export default function IntegratedAnalyticsPage() {
  const { user } = useAuth();
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [timePeriod, setTimePeriod] = useState('30days');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [aiTips, setAiTips] = useState([]);
  const [isLoadingTips, setIsLoadingTips] = useState(false);
  const [error, setError] = useState(null);
  
  const [connectedPlatforms, setConnectedPlatforms] = useState({
    spotify: true,
    youtube: false,
    instagram: false,
    facebook: false,
    apple: true,
    google: true // Added Google Analytics
  });
  
  const [connectingPlatform, setConnectingPlatform] = useState(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      try {
        const userTracks = await Track.filter({ artist_id: user.id });
        setTracks(userTracks);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to fetch user data. Please try again.");
      }
    };
    
    fetchUserData();
  }, [user]);
  
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!user || !Object.values(connectedPlatforms).some(connected => connected)) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      
      try {
        const activePlatforms = Object.entries(connectedPlatforms)
          .filter(([_, connected]) => connected)
          .map(([platform]) => platform)
          .join(', ');

        const result = await InvokeLLM({
          prompt: `Generate simulated music artist analytics data for the last ${timePeriod}.
            Include data for these platforms: ${activePlatforms}.
            Focus on: streaming counts, listener demographics, geographic distribution, playlist adds, follower growth.
            If 'google' is in platforms, also include website analytics: total visitors, new vs returning, traffic sources (organic, direct, social, referral), top landing pages, bounce rate.
            Structure the response as a JSON object.`,
          response_json_schema: {
            type: "object",
            properties: {
              overview: {
                type: "object",
                properties: {
                  total_streams: { type: "number" },
                  total_listeners: { type: "number" },
                  revenue_estimate: { type: "number" },
                  stream_change: { type: "number" }, // percentage
                  listener_change: { type: "number" } // percentage
                }
              },
              platforms: {
                type: "object",
                properties: {
                  spotify: {
                    type: "object",
                    properties: {
                      streams: { type: "number" },
                      listeners: { type: "number" },
                      playlist_adds: { type: "number" },
                      saves: { type: "number" },
                      follower_growth: { type: "number" }
                    }
                  },
                  apple: {
                    type: "object",
                    properties: {
                      streams: { type: "number" },
                      listeners: { type: "number" },
                      playlist_adds: { type: "number" }
                    }
                  },
                  youtube: {
                    type: "object",
                    properties: {
                      views: { type: "number" },
                      watch_time: { type: "number" },
                      subscribers: { type: "number" }
                    }
                  }
                }
              },
              daily_streams: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    date: { type: "string" },
                    spotify: { type: "number" },
                    apple: { type: "number" },
                    youtube: { type: "number" }
                  }
                }
              },
              demographics: {
                type: "object",
                properties: {
                  age_groups: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        group: { type: "string" },
                        percentage: { type: "number" }
                      }
                    }
                  },
                  gender: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        group: { type: "string" },
                        percentage: { type: "number" }
                      }
                    }
                  }
                }
              },
              top_countries: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    country: { type: "string" },
                    streams: { type: "number" },
                    change: { type: "number" }
                  }
                }
              },
              top_playlists: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    platform: { type: "string" },
                    followers: { type: "number" },
                    streams: { type: "number" }
                  }
                }
              },
              google_analytics: { // New section for Google Analytics
                type: "object",
                properties: {
                  total_visitors: { type: "number" },
                  new_visitors_pct: { type: "number" }, // percentage
                  returning_visitors_pct: { type: "number" }, // percentage
                  avg_session_duration_min: { type: "number" },
                  bounce_rate_pct: { type: "number" },
                  traffic_sources: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: { name: { type: "string" }, value: { type: "number" } } // value is percentage
                    }
                  },
                  top_landing_pages: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: { page: { type: "string" }, views: { type: "number" } }
                    }
                  }
                }
              }
            }
          }
        });
        
        setAnalyticsData(result);
        if (result) generateTips(result); // Generate tips after data is fetched

      } catch (error) {
        console.error("Error fetching analytics data:", error);
        setError("Failed to fetch analytics data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [user, selectedTrack, timePeriod, connectedPlatforms]);

  const generateTips = async (currentData) => {
    if (!currentData) return;
    setIsLoadingTips(true);
    setAiTips([]);
    try {
      const tipsResult = await InvokeLLM({
        prompt: `You are an expert music marketing advisor. Based on the following artist analytics data, provide 2-4 concise, actionable tips to help the artist grow their audience, engagement, or revenue. Format tips as a simple array of strings.
        Data: ${JSON.stringify(currentData)}`,
        response_json_schema: {
          type: "object",
          properties: {
            tips: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });
      setAiTips(tipsResult?.tips || []);
    } catch (error) {
      console.error("Error generating AI tips:", error);
      setAiTips(["Could not generate tips at this time. Please try refreshing."]);
    } finally {
      setIsLoadingTips(false);
    }
  };
  
  const handleRefreshData = async () => {
    setIsRefreshing(true);
    // Re-trigger useEffect for fetching data
    const currentConnected = {...connectedPlatforms};
    setConnectedPlatforms({}); // Briefly change to trigger re-fetch, then restore
    setTimeout(() => setConnectedPlatforms(currentConnected), 0);
    setIsRefreshing(false);
  };
  
  const handleConnectPlatform = (platform) => {
    setConnectingPlatform(platform);
  };
  
  const handlePlatformConnected = (platform) => {
    setConnectedPlatforms({
      ...connectedPlatforms,
      [platform.toLowerCase()]: true
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-4">Please log in</h2>
          <p className="text-white/70">You need to be logged in to view integrated analytics.</p>
        </div>
      </div>
    );
  }

  const googleAnalyticsData = analyticsData?.google_analytics;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Integrated Analytics</h1>
          <p className="text-lg text-white/70 mt-1">Understand your performance across all platforms</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefreshData}
            disabled={isRefreshing || isLoading}
            className="backdrop-blur-md bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button className="backdrop-blur-md bg-purple-600/80 hover:bg-purple-600/90 text-white">
                <Globe className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Connect Platforms</span>
                <span className="sm:hidden">Connect</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 backdrop-blur-xl bg-black/70 border-white/20 text-white p-3">
              <h3 className="text-sm font-medium text-white mb-3">Platform Integrations</h3>
              <div className="space-y-2">
                {Object.entries(connectedPlatforms).map(([platform, connected]) => (
                  <PlatformIntegrationStatus
                    key={platform}
                    platform={platform}
                    connected={connected}
                    onClick={() => !connected && handleConnectPlatform(platform)}
                  />
                ))}
              </div>
              <p className="text-xs text-white/50 mt-3">
                Connect platforms to automatically import analytics data
              </p>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* Filters */}
      <GlassCard className="p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-sm text-white/70 mb-1">Time Period</p>
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-36 backdrop-blur-md bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-md bg-black/50 border-white/20">
                <SelectItem value="7days" className="text-white hover:bg-white/20">Last 7 Days</SelectItem>
                <SelectItem value="30days" className="text-white hover:bg-white/20">Last 30 Days</SelectItem>
                <SelectItem value="90days" className="text-white hover:bg-white/20">Last 90 Days</SelectItem>
                <SelectItem value="year" className="text-white hover:bg-white/20">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <p className="text-sm text-white/70 mb-1">Track</p>
            <Select value={selectedTrack} onValueChange={setSelectedTrack}>
              <SelectTrigger className="w-48 backdrop-blur-md bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Select track" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-md bg-black/50 border-white/20">
                <SelectItem value="all" className="text-white hover:bg-white/20">All Tracks</SelectItem>
                {tracks.map(track => (
                  <SelectItem 
                    key={track.id} 
                    value={track.id}
                    className="text-white hover:bg-white/20"
                  >
                    {track.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </GlassCard>
      
      {error && (
        <GlassCard className="p-4 border-red-500/50 bg-red-500/10">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <p className="text-white/90">{error}</p>
          </div>
        </GlassCard>
      )}
      
      {!error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatsCard
              title="Total Streams"
              value={analyticsData?.overview.total_streams.toLocaleString() || "0"}
              platform="spotify"
              change={analyticsData?.overview.stream_change}
              loading={isLoading}
            />
            <StatsCard
              title="Total Listeners"
              value={analyticsData?.overview.total_listeners.toLocaleString() || "0"}
              platform="spotify"
              change={analyticsData?.overview.listener_change}
              loading={isLoading}
            />
            <StatsCard
              title="Estimated Revenue"
              value={`$${(analyticsData?.overview.revenue_estimate || 0).toFixed(2)}`}
              platform="apple"
              change={7.3}
              loading={isLoading}
            />
          </div>
          
          {/* AI Tips Section */}
          <AiTipsSection tips={aiTips} isLoading={isLoadingTips || isLoading} />

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <GlassCard className="p-5">
                <h2 className="text-xl font-semibold text-white mb-4">Streaming Activity Over Time</h2>
                <div className="h-80">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <Loader2 className="h-10 w-10 animate-spin text-purple-400" />
                    </div>
                  ) : analyticsData?.daily_streams?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData.daily_streams}>
                        <defs>
                          {Object.entries(connectedPlatforms)
                            .filter(([_, connected]) => connected)
                            .map(([platform], index) => (
                              <linearGradient 
                                key={platform} 
                                id={`gradient-${platform}`} 
                                x1="0" y1="0" x2="0" y2="1"
                              >
                                <stop 
                                  offset="5%" 
                                  stopColor={COLORS[index % COLORS.length]} 
                                  stopOpacity={0.8}
                                />
                                <stop 
                                  offset="95%" 
                                  stopColor={COLORS[index % COLORS.length]} 
                                  stopOpacity={0.2}
                                />
                              </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fill: 'rgba(255,255,255,0.7)' }}
                          tickFormatter={(date) => format(parseISO(date), 'MMM d')}
                        />
                        <YAxis tick={{ fill: 'rgba(255,255,255,0.7)' }} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            backdropFilter: 'blur(8px)',
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            color: 'white'
                          }}
                          formatter={(value) => [`${value.toLocaleString()} streams`, '']}
                          labelFormatter={(date) => format(parseISO(date), 'MMMM d, yyyy')}
                        />
                        {Object.entries(connectedPlatforms)
                          .filter(([_, connected]) => connected)
                          .map(([platform], index) => (
                            <Area 
                              key={platform}
                              type="monotone" 
                              dataKey={platform} 
                              name={platform.charAt(0).toUpperCase() + platform.slice(1)} 
                              stroke={COLORS[index % COLORS.length]} 
                              fillOpacity={1}
                              fill={`url(#gradient-${platform})`}
                            />
                          ))}
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-white/50">
                      No streaming data available
                    </div>
                  )}
                </div>
              </GlassCard>
              
              {/* Google Analytics Section - Example */}
              {connectedPlatforms.google && googleAnalyticsData && (
                <GlassCard className="p-5">
                  <div className="flex items-center mb-4">
                    <MousePointerClick className="h-6 w-6 text-blue-400 mr-3" />
                    <h2 className="text-xl font-semibold text-white">Website Traffic Overview (Simulated Google Analytics)</h2>
                  </div>
                  {isLoading ? (
                     <div className="h-60 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-purple-400" /></div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-medium text-white/90 mb-2">Key Metrics</h3>
                            <div className="space-y-2 text-sm">
                                <p className="flex justify-between text-white/80"><span>Total Visitors:</span> <span className="font-semibold text-white">{googleAnalyticsData.total_visitors?.toLocaleString() || 'N/A'}</span></p>
                                <p className="flex justify-between text-white/80"><span>New Visitors:</span> <span className="font-semibold text-white">{googleAnalyticsData.new_visitors_pct?.toFixed(1) || 'N/A'}%</span></p>
                                <p className="flex justify-between text-white/80"><span>Returning Visitors:</span> <span className="font-semibold text-white">{googleAnalyticsData.returning_visitors_pct?.toFixed(1) || 'N/A'}%</span></p>
                                <p className="flex justify-between text-white/80"><span>Avg. Session:</span> <span className="font-semibold text-white">{googleAnalyticsData.avg_session_duration_min?.toFixed(1) || 'N/A'} min</span></p>
                                <p className="flex justify-between text-white/80"><span>Bounce Rate:</span> <span className="font-semibold text-white">{googleAnalyticsData.bounce_rate_pct?.toFixed(1) || 'N/A'}%</span></p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-white/90 mb-3">Traffic Sources</h3>
                            {googleAnalyticsData.traffic_sources?.length > 0 ? (
                                <ResponsiveContainer width="100%" height={150}>
                                    <PieChart>
                                        <Pie data={googleAnalyticsData.traffic_sources} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="#8884d8" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                            {googleAnalyticsData.traffic_sources.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : <p className="text-white/60 text-sm">No traffic source data.</p>}
                        </div>
                         <div className="md:col-span-2">
                            <h3 className="text-lg font-medium text-white/90 mb-2">Top Landing Pages</h3>
                            {googleAnalyticsData.top_landing_pages?.length > 0 ? (
                                <ul className="space-y-1 text-sm">
                                {googleAnalyticsData.top_landing_pages.slice(0,3).map(page => (
                                    <li key={page.page} className="flex justify-between p-2 bg-white/5 rounded">
                                    <span className="text-white/80 truncate max-w-[70%]">{page.page}</span>
                                    <span className="font-semibold text-white">{page.views?.toLocaleString()} views</span>
                                    </li>
                                ))}
                                </ul>
                            ) : <p className="text-white/60 text-sm">No landing page data.</p>}
                        </div>
                    </div>
                  )}
                </GlassCard>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <GlassCard className="p-5">
                  <h2 className="text-xl font-semibold text-white mb-4">Top Countries</h2>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex justify-between items-center">
                          <Skeleton className="h-6 w-20 bg-white/10" />
                          <Skeleton className="h-6 w-24 bg-white/10" />
                        </div>
                      ))}
                    </div>
                  ) : analyticsData?.top_countries?.length > 0 ? (
                    <div>
                      <div className="space-y-3">
                        {analyticsData.top_countries.map((country, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="text-lg font-semibold text-white/90">
                                {index + 1}.
                              </div>
                              <span className="text-white">{country.country}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-white">{country.streams.toLocaleString()}</span>
                              <span className={`text-xs ${country.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {country.change >= 0 ? '+' : ''}{country.change}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-40 flex items-center justify-center text-white/50">
                      No geographic data available
                    </div>
                  )}
                </GlassCard>
                
                <GlassCard className="p-5">
                  <h2 className="text-xl font-semibold text-white mb-4">Audience Demographics</h2>
                  {isLoading ? (
                    <div className="h-60 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                    </div>
                  ) : analyticsData?.demographics?.age_groups?.length > 0 ? (
                    <div className="h-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analyticsData.demographics.age_groups}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="percentage"
                            nameKey="group"
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {analyticsData.demographics.age_groups.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Listeners']}
                            contentStyle={{
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                              backdropFilter: 'blur(8px)',
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                              borderRadius: '8px',
                              color: 'white'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-60 flex items-center justify-center text-white/50">
                      No demographic data available
                    </div>
                  )}
                </GlassCard>
              </div>
            </div>
            
            <div className="space-y-6">
              <GlassCard className="p-5">
                <h2 className="text-xl font-semibold text-white mb-4">Platform Breakdown</h2>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full bg-white/10" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(connectedPlatforms)
                      .filter(([_, connected]) => connected)
                      .map(([platform]) => (
                        analyticsData?.platforms[platform] ? (
                          <div key={platform} className="border border-white/10 rounded-lg p-4 bg-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-white/10">
                                  {platformIcons[platform] || <Globe className="h-4 w-4" />}
                                </div>
                                <h3 className="font-medium text-white capitalize">{platform}</h3>
                              </div>
                              <ArrowUpRight className="h-4 w-4 text-white/50" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              {platform === 'spotify' && (
                                <>
                                  <div>
                                    <p className="text-xs text-white/60">Streams</p>
                                    <p className="text-white font-semibold">{analyticsData.platforms.spotify.streams.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-white/60">Listeners</p>
                                    <p className="text-white font-semibold">{analyticsData.platforms.spotify.listeners.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-white/60">Playlist Adds</p>
                                    <p className="text-white font-semibold">{analyticsData.platforms.spotify.playlist_adds}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-white/60">Saves</p>
                                    <p className="text-white font-semibold">{analyticsData.platforms.spotify.saves}</p>
                                  </div>
                                </>
                              )}
                              
                              {platform === 'apple' && (
                                <>
                                  <div>
                                    <p className="text-xs text-white/60">Streams</p>
                                    <p className="text-white font-semibold">{analyticsData.platforms.apple.streams.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-white/60">Listeners</p>
                                    <p className="text-white font-semibold">{analyticsData.platforms.apple.listeners.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-white/60">Playlist Adds</p>
                                    <p className="text-white font-semibold">{analyticsData.platforms.apple.playlist_adds}</p>
                                  </div>
                                </>
                              )}
                              
                              {platform === 'youtube' && (
                                <>
                                  <div>
                                    <p className="text-xs text-white/60">Views</p>
                                    <p className="text-white font-semibold">{analyticsData.platforms.youtube.views.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-white/60">Watch Time (hrs)</p>
                                    <p className="text-white font-semibold">{analyticsData.platforms.youtube.watch_time}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-white/60">Subscribers</p>
                                    <p className="text-white font-semibold">{analyticsData.platforms.youtube.subscribers.toLocaleString()}</p>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ) : null
                      ))}
                  </div>
                )}
              </GlassCard>
              
              <GlassCard className="p-5">
                <h2 className="text-xl font-semibold text-white mb-4">Top Playlists</h2>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-12 w-full bg-white/10" />
                    ))}
                  </div>
                ) : analyticsData?.top_playlists?.length > 0 ? (
                  <div className="space-y-3">
                    {analyticsData.top_playlists.map((playlist, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-white/10">
                            {platformIcons[playlist.platform.toLowerCase()] || <Music className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-white font-medium">{playlist.name}</p>
                            <p className="text-xs text-white/60">{playlist.followers.toLocaleString()} followers</p>
                          </div>
                        </div>
                        <p className="text-white font-medium">{playlist.streams.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-36 flex items-center justify-center text-white/50">
                    No playlist data available
                  </div>
                )}
              </GlassCard>
            </div>
          </div>
        </>
      )}
      
      
      {connectingPlatform && (
        <ConnectPlatformDialog
          platform={connectingPlatform}
          isOpen={!!connectingPlatform}
          onClose={() => setConnectingPlatform(null)}
          onConnect={handlePlatformConnected}
        />
      )}
    </div>
  );
}
