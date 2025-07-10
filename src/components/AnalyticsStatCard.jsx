
import React from "react";
import StudioPanel from './StudioPanel';
import LordIcon from './LordIcon';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedIcon from './AnimatedIcon';
import { format } from "date-fns";

const platformMeta = {
    spotify: {
        label: 'Listeners',
        icon: 'disc',
        color: 'text-green-600',
        bg: 'bg-green-100/50',
        gradient: 'from-green-500 to-emerald-600'
    },
    youtube: {
        label: 'Subscribers',
        icon: 'video',
        color: 'text-red-600',
        bg: 'bg-red-100/50',
        gradient: 'from-red-500 to-pink-600'
    },
    instagram: {
        label: 'Followers',
        icon: 'camera',
        color: 'text-pink-600',
        bg: 'bg-pink-100/50',
        gradient: 'from-pink-500 to-rose-600'
    },
    tiktok: {
        label: 'Followers',
        icon: 'music',
        color: 'text-slate-800',
        bg: 'bg-slate-200/50',
        gradient: 'from-slate-600 to-slate-800'
    },
    twitter: {
        label: 'Followers',
        icon: 'share',
        color: 'text-blue-600',
        bg: 'bg-blue-100/50',
        gradient: 'from-blue-500 to-cyan-600'
    },
    facebook: {
        label: 'Followers',
        icon: 'users',
        color: 'text-indigo-600',
        bg: 'bg-indigo-100/50',
        gradient: 'from-indigo-500 to-purple-600'
    },
    twitch: {
        label: 'Followers',
        icon: 'video',
        color: 'text-purple-600',
        bg: 'bg-purple-100/50',
        gradient: 'from-purple-500 to-violet-600'
    },
    soundcloud: {
        label: 'Followers',
        icon: 'headphones',
        color: 'text-orange-600',
        bg: 'bg-orange-100/50',
        gradient: 'from-orange-500 to-red-500'
    }
};

const AnalyticsStatCard = ({ platform, data, isLoading, onRefresh }) => {
    const meta = platformMeta[platform];
    if (!meta) return null;

    // Handle different data structures for different platforms
    const getFollowerCount = () => {
        if (platform === 'youtube') {
            return data?.followers || data?.subscriberCount || 0;
        }
        return data?.followers || 0;
    };

    const formattedValue = getFollowerCount() ? getFollowerCount().toLocaleString() : 'N/A';
    const growth = data?.growth || 0;
    const isPositive = growth >= 0;

    return (
        <StudioPanel className="p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r",
                        meta.gradient
                    )}>
                        <LordIcon icon={meta.icon} size={24} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 capitalize text-lg">{platform}</h3>
                        <p className="text-sm text-slate-500">{meta.label}</p>
                    </div>
                </div>
                
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRefresh(platform)}
                    disabled={isLoading}
                    className="opacity-60 hover:opacity-100"
                >
                    <AnimatedIcon 
                        icon={isLoading ? "loading" : "activity"} 
                        size={16} 
                        trigger={isLoading ? "spin" : "hover"} 
                    />
                </Button>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    <div className="h-8 w-24 bg-slate-200 animate-pulse rounded-md" />
                    <div className="h-4 w-16 bg-slate-100 animate-pulse rounded-md" />
                </div>
            ) : (
                <>
                    <p className="text-3xl font-bold text-slate-900 mb-2">{formattedValue}</p>
                    <div className="flex items-center justify-between">
                        <div className={cn(
                            "flex items-center gap-1 text-sm font-medium",
                            isPositive ? "text-green-600" : "text-red-600"
                        )}>
                            {isPositive ? (
                                <ArrowUp className="w-4 h-4" />
                            ) : (
                                <ArrowDown className="w-4 h-4" />
                            )}
                            <span>{Math.abs(growth)}%</span>
                        </div>
                        {data?.external_url && (
                            <a 
                                href={data.external_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                </>
            )}

            {/* YouTube-specific additional data */}
            {platform === 'youtube' && data?.totalViews && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Total Views</span>
                        <span className="font-medium">{data.totalViews.toLocaleString()}</span>
                    </div>
                </div>
            )}

            {/* Spotify-specific additional data */}
            {platform === 'spotify' && data?.top_tracks && data.top_tracks.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-600 mb-2">Top Track</p>
                    <p className="font-medium text-sm">{data.top_tracks[0].name}</p>
                </div>
            )}

            {/* Instagram-specific additional data */}
            {platform === 'instagram' && data?.postsCount && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Posts</span>
                        <span className="font-medium">{data.postsCount.toLocaleString()}</span>
                    </div>
                    {data.isVerified && (
                        <div className="flex items-center gap-1 mt-2">
                            <LordIcon icon="check" size={14} className="text-blue-500" />
                            <span className="text-xs text-blue-600 font-medium">Verified</span>
                        </div>
                    )}
                </div>
            )}

            {/* TikTok-specific additional data */}
            {platform === 'tiktok' && data?.videoCount && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600">Videos</span>
                        <span className="font-medium">{data.videoCount.toLocaleString()}</span>
                    </div>
                    {data.heartCount && (
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Hearts</span>
                            <span className="font-medium">{data.heartCount.toLocaleString()}</span>
                        </div>
                    )}
                    {data.isVerified && (
                        <div className="flex items-center gap-1 mt-2">
                            <LordIcon icon="check" size={14} className="text-blue-500" />
                            <span className="text-xs text-blue-600 font-medium">Verified</span>
                        </div>
                    )}
                </div>
            )}

            {/* Facebook-specific additional data */}
            {platform === 'facebook' && (data?.likes || data?.ratingCount || data?.category) && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                    {data.likes && (
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600">Likes</span>
                            <span className="font-medium">{data.likes.toLocaleString()}</span>
                        </div>
                    )}
                    {data.ratingCount && (
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600">Reviews</span>
                            <span className="font-medium">{data.ratingCount.toLocaleString()}</span>
                        </div>
                    )}
                    {data.category && (
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Category</span>
                            <span className="font-medium text-xs">{data.category}</span>
                        </div>
                    )}
                </div>
            )}
        </StudioPanel>
    );
};

export default AnalyticsStatCard;
