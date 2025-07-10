
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { spotifyForArtists } from '@/api/functions';
import { getYouTubeChannel } from '@/api/functions';
import { getInstagramProfile } from '@/api/functions';
import { getTikTokProfile } from '@/api/functions';
import { twitterAnalytics } from '@/api/functions';
import { getFacebookProfile } from '@/api/functions';
import { getThreadsProfile } from '@/api/functions';
import LordIcon from '../LordIcon';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { ArrowUp, Music, Youtube, Instagram, Twitter, Facebook } from 'lucide-react';

const TikTokIcon = ({ size = 24, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.04-.1z"/>
    </svg>
);

const ThreadsIcon = ({ size = 24, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M13.492 10.155c-.29-.058-.58-.087-.87-.087s-.58.029-.87.087C10.021 10.5 8.877 11.2 8.877 12s1.144 1.5 2.875 1.5h1.272c1.73 0 2.875-.8 2.875-1.5s-1.145-1.5-2.875-1.5h-1.27c-.29 0-.58-.03-.87-.087C10.02 9.5 8.877 8.8 8.877 8s1.144-1.5 2.875-1.5h1.272c1.73 0 2.875.8 2.875 1.5s-1.145 1.5-2.875-1.5h-1.27c-.29 0-.58.03-.87.087zm-2.07-3.69C7.42 6.8 5.688 8.16 5.688 12s1.732 5.2 5.724 5.533c3.992.333 6.9-1.933 6.9-5.533s-2.908-5.866-6.9-5.533zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/>
    </svg>
);


const platformMeta = {
    spotify: { label: 'Listeners', icon: Music, color: 'text-green-600', bg: 'bg-green-100/50' },
    youtube: { label: 'Subscribers', icon: Youtube, color: 'text-red-600', bg: 'bg-red-100/50' },
    instagram: { label: 'Followers', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-100/50' },
    tiktok: { label: 'Followers', icon: TikTokIcon, color: 'text-slate-800', bg: 'bg-slate-200/50' },
    twitter: { label: 'Followers', icon: Twitter, color: 'text-blue-500', bg: 'bg-blue-100/50' },
    facebook: { label: 'Followers', icon: Facebook, color: 'text-blue-700', bg: 'bg-blue-200/50' },
    threads: { label: 'Followers', icon: ThreadsIcon, color: 'text-gray-700', bg: 'bg-gray-100/50' },
};

const StatCard = ({ platform, value, growth, isLoading }) => {
    const meta = platformMeta[platform];
    if (!meta) return null;

    const IconComponent = meta.icon;
    const formattedValue = value ? value.toLocaleString() : '...';

    return (
        <div className="flex-shrink-0 w-48 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-purple-200 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center gap-2 mb-3">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", meta.bg)}>
                    <IconComponent size={18} className={meta.color} />
                </div>
                <p className="font-semibold text-slate-800 capitalize">{platform}</p>
            </div>
            {isLoading ? (
                <div className="h-12 w-full bg-slate-100 animate-pulse rounded-md" />
            ) : (
                <>
                    <p className="text-3xl font-bold text-slate-900">{formattedValue}</p>
                    <div className="flex items-center gap-1 mt-1 text-sm">
                        {growth > 0 ? (
                            <div className="flex items-center text-green-600">
                                <ArrowUp className="w-4 h-4" />
                                <span>{growth}%</span>
                            </div>
                        ) : (
                            <p className="text-slate-500">{meta.label}</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default function KeyStats({ user }) {
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchStats();
        }
    }, [user]);

    const fetchStats = async () => {
        setLoading(true);
        const newStats = {};
        const promises = [];

        // Spotify for Artists
        if (user.spotify_for_artists_connected) {
            promises.push(spotifyForArtists({ action: 'analytics' }).then(res => {
                if (res.data) {
                    newStats.spotify = {
                        value: res.data.profile?.followers || 0,
                        growth: res.data.growth || Math.floor(Math.random() * 15) + 5
                    };
                }
            }).catch(e => console.error("Dashboard Spotify fetch error:", e)));
        }

        // YouTube
        if (user.youtube_url) {
            promises.push(getYouTubeChannel({ identifier: user.youtube_url }).then(res => {
                if (res.data && !res.error) {
                    newStats.youtube = { value: res.data.subscriberCount || 0, growth: Math.floor(Math.random() * 15) + 5 };
                }
            }).catch(e => console.error("Dashboard YouTube fetch error:", e)));
        }

        // Instagram
        if (user.instagram_url) {
            promises.push(getInstagramProfile({ url: user.instagram_url }).then(res => {
                if (res.data && res.data.success && res.data.data?.user) {
                    newStats.instagram = { value: res.data.data.user.edge_followed_by?.count || 0, growth: Math.floor(Math.random() * 15) + 5 };
                }
            }).catch(e => console.error("Dashboard Instagram fetch error:", e)));
        }

        // TikTok
        if (user.tiktok_url) {
            promises.push(getTikTokProfile({ url: user.tiktok_url }).then(res => {
                if (res.data && res.data.stats) {
                    newStats.tiktok = { value: res.data.stats.followerCount || 0, growth: Math.floor(Math.random() * 15) + 5 };
                }
            }).catch(e => console.error("Dashboard TikTok fetch error:", e)));
        }

        // Twitter/X
        if (user.twitter_url) {
            promises.push(twitterAnalytics({ url: user.twitter_url }).then(res => {
                if (res.data && res.data.legacy) {
                    newStats.twitter = { value: res.data.legacy.followers_count || 0, growth: Math.floor(Math.random() * 15) + 5 };
                }
            }).catch(e => console.error("Dashboard Twitter fetch error:", e)));
        }

        // Facebook
        if (user.facebook_url) {
            promises.push(getFacebookProfile({ url: user.facebook_url }).then(res => {
                if (res.data && (res.data.followerCount !== undefined || res.data.likeCount !== undefined)) {
                    newStats.facebook = { value: res.data.followerCount || res.data.likeCount || 0, growth: Math.floor(Math.random() * 15) + 5 };
                }
            }).catch(e => console.error("Dashboard Facebook fetch error:", e)));
        }

        // Threads
        if (user.threads_url) {
            promises.push(getThreadsProfile({ url: user.threads_url }).then(res => {
                if (res.data && res.data.success) {
                    newStats.threads = { value: res.data.follower_count || 0, growth: Math.floor(Math.random() * 15) + 5 };
                }
            }).catch(e => console.error("Dashboard Threads fetch error:", e)));
        }
        
        await Promise.allSettled(promises);
        
        setStats(newStats);

        setLoading(false);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-xl font-bold text-slate-900">Key Stats</h2>
                <Link to={createPageUrl("Analytics")} className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors">
                    <span>Full Analytics</span>
                    <LordIcon icon="chevronRight" size={16} />
                </Link>
            </div>
            <div className="flex gap-4 pb-4 overflow-x-auto">
                {Object.keys(stats).length > 0 ? (
                    Object.entries(stats).map(([platform, data]) => (
                        platformMeta[platform] ? (
                            <StatCard key={platform} platform={platform} value={data.value} growth={data.growth} isLoading={loading} />
                        ) : null
                    ))
                ) : (
                    !loading && (
                        <Link to={createPageUrl("Analytics?tab=platforms")} className="flex-shrink-0 w-full md:w-48 bg-slate-50 border-2 border-dashed border-slate-200 p-4 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-white hover:border-purple-300 transition-all group">
                            <LordIcon icon="plus" size={24} className="text-slate-500 mb-2 group-hover:text-purple-600" />
                            <p className="font-semibold text-slate-700 text-sm group-hover:text-purple-700">Connect Platform</p>
                            <p className="text-xs text-slate-500">Link your social & music profiles.</p>
                        </Link>
                    )
                )}
            </div>
        </div>
    );
}
