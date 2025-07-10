import React, { useState } from 'react';
import StudioPanel from '../components/StudioPanel';
import ActionButton from '../components/ActionButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getYouTubeChannel } from '@/api/functions';
import { AlertCircle, ArrowUp, Link as LinkIcon, Users, Video } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import AnimatedIcon from '../components/AnimatedIcon';
import LordIcon from '../components/LordIcon';

const StatPill = ({ icon, label, value }) => (
    <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg">
        <LordIcon icon={icon} size={20} className="text-purple-600 flex-shrink-0" />
        <div>
            <p className="text-sm font-medium text-slate-800">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
        </div>
    </div>
);

const ChannelResultCard = ({ data }) => (
    <StudioPanel className="mt-6 p-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="w-24 h-24 sm:w-28 sm:h-28 border-4 border-white shadow-lg">
                <AvatarImage src={data.avatar?.image?.sources?.[2]?.url} />
                <AvatarFallback className="text-4xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                    {data.name?.[0] || 'Y'}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <a href={data.channel} target="_blank" rel="noopener noreferrer" className="group">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 group-hover:text-purple-700 transition-colors">{data.name}</h2>
                </a>
                <p className="text-slate-600 mt-1">{data.subscriberCountText}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                    <StatPill icon="users" label="Subscribers" value={data.subscriberCount.toLocaleString()} />
                    <StatPill icon="video" label="Videos" value={data.videoCountText} />
                    <StatPill icon="chart" label="Total Views" value={data.viewCountText} />
                </div>
            </div>
        </div>
        
        {data.description && (
            <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-slate-800 mb-2">Description</h3>
                <p className="text-sm text-slate-700 whitespace-pre-line">{data.description}</p>
            </div>
        )}

        {data.tags && (
             <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-slate-800 mb-2">Channel Tags</h3>
                <div className="flex flex-wrap gap-2">
                    {data.tags.split(', ').slice(0, 10).map(tag => (
                        <Badge key={tag} variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200 cursor-default">
                            {tag}
                        </Badge>
                    ))}
                </div>
            </div>
        )}
    </StudioPanel>
);

export default function YouTubeToolPage() {
    const [identifier, setIdentifier] = useState('@ThePatMcAfeeShow');
    const [channelData, setChannelData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFetchData = async () => {
        if (!identifier.trim()) {
            setError('Please enter a YouTube Channel URL, ID, or handle.');
            return;
        }
        setIsLoading(true);
        setError('');
        setChannelData(null);

        try {
            const result = await getYouTubeChannel({ identifier: identifier.trim() });
            if (result.error) {
                 setError(result.error);
            } else {
                 setChannelData(result.data);
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err?.response?.data?.error || err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900">YouTube Channel Analyzer</h1>
                <p className="text-lg text-slate-700 mt-1">Get instant insights for any YouTube channel.</p>
            </div>
            
            <StudioPanel className="p-6">
                <div className="space-y-2">
                    <Label htmlFor="youtube-identifier" className="font-semibold text-slate-800">
                        YouTube Channel URL, ID, or Handle
                    </Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                            id="youtube-identifier"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="e.g., @MrBeast or a full channel URL"
                            className="flex-grow"
                        />
                        <ActionButton
                            onClick={handleFetchData}
                            disabled={isLoading}
                            icon={isLoading ? "loading" : "search"}
                            className="w-full sm:w-auto"
                        >
                            {isLoading ? 'Analyzing...' : 'Analyze Channel'}
                        </ActionButton>
                    </div>
                </div>
            </StudioPanel>
            
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <div>
                        <p className="text-red-700 font-medium">Error</p>
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                </div>
            )}
            
            {isLoading && (
                 <div className="text-center py-10">
                    <LordIcon icon="loading" size={48} trigger="loop" className="mx-auto mb-4 text-purple-600" />
                    <p className="text-slate-600">Fetching channel data...</p>
                </div>
            )}

            {channelData && <ChannelResultCard data={channelData} />}
        </div>
    );
}