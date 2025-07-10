
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AnimatedIcon from '../components/AnimatedIcon';
import ActionButton from '../components/ActionButton';
import { Music, Play, ExternalLink, Calendar, Youtube, CheckCircle, Instagram, Twitter, Facebook, Globe, Heart, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

// Pixel Scripts Component for marketing tracking
const PixelScripts = ({ pixelIds }) => {
    useEffect(() => {
        if (!pixelIds) return;

        // Facebook Pixel
        if (pixelIds.facebook_pixel_id) {
            const script = document.createElement('script');
            script.innerHTML = `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${pixelIds.facebook_pixel_id}');
                fbq('track', 'PageView');
            `;
            document.head.appendChild(script);
        }

        // Google Analytics
        if (pixelIds.google_analytics_id) {
            const script = document.createElement('script');
            script.src = `https://www.googletagmanager.com/gtag/js?id=${pixelIds.google_analytics_id}`;
            script.async = true;
            document.head.appendChild(script);

            const configScript = document.createElement('script');
            configScript.innerHTML = `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${pixelIds.google_analytics_id}');
            `;
            document.head.appendChild(configScript);
        }

        // TikTok Pixel
        if (pixelIds.tiktok_pixel_id) {
            const script = document.createElement('script');
            script.innerHTML = `
                !function (w, d, t) {
                  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++
                )ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=i+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
                  ttq.load('${pixelIds.tiktok_pixel_id}');
                  ttq.page();
                }(window, document, 'ttq');
            `;
            document.head.appendChild(script);
        }
    }, [pixelIds]);

    return null;
};

// Social Links Component
const SocialLinks = ({ socialLinks, trackClick }) => {
    if (!socialLinks || socialLinks.length === 0) return null;

    const getIcon = (platform) => {
        switch (platform) {
            case 'instagram': return Instagram;
            case 'twitter': return Twitter;
            case 'facebook': return Facebook;
            case 'youtube': return Youtube;
            case 'website': return Globe;
            default: return ExternalLink;
        }
    };

    const getPlatformColor = (platform) => {
        switch (platform) {
            case 'instagram': return 'hover:bg-pink-100 hover:text-pink-600';
            case 'twitter': return 'hover:bg-blue-100 hover:text-blue-600';
            case 'facebook': return 'hover:bg-blue-100 hover:text-blue-700';
            case 'youtube': return 'hover:bg-red-100 hover:text-red-600';
            case 'website': return 'hover:bg-gray-100 hover:text-gray-700';
            default: return 'hover:bg-purple-100 hover:text-purple-600';
        }
    };

    return (
        <div className="flex justify-center gap-4 mt-8">
            {socialLinks.map((link, index) => {
                const IconComponent = getIcon(link.platform);
                const colorClass = getPlatformColor(link.platform);
                return (
                    <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            "flex items-center justify-center w-12 h-12 rounded-full border-2 border-gray-300 text-gray-600 transition-all duration-300",
                            colorClass
                        )}
                        onClick={() => trackClick(link.platform)}
                    >
                        <IconComponent className="w-5 h-5" />
                    </a>
                );
            })}
        </div>
    );
};

// Fan Collection Component
const FanCollectionForm = ({ promotion, onSubmit }) => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onSubmit({ email, name });
            setIsSubmitted(true);
        } catch (error) {
            console.error('Error submitting fan data:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <CheckCircle className="mx-auto w-12 h-12 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">Thank you!</h3>
                <p className="text-green-700">We'll keep you updated on new releases and shows.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-lg p-6 space-y-4">
            <div className="text-center mb-4">
                <Mail className="mx-auto w-8 h-8 text-purple-600 mb-2" />
                <h3 className="text-lg font-semibold text-gray-800">Stay Connected</h3>
                <p className="text-sm text-gray-600">Get notified about new releases and exclusive content</p>
            </div>
            
            <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Name (optional)</Label>
                <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="mt-1"
                />
            </div>
            
            <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email *</Label>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="mt-1"
                    required
                />
            </div>
            
            <ActionButton
                type="submit"
                disabled={!email || isSubmitting}
                className="w-full"
                icon={isSubmitting ? "loading" : "heart"}
            >
                {isSubmitting ? 'Joining...' : 'Join the Community'}
            </ActionButton>
        </form>
    );
};

// Pre-Save Component
const PreSaveComponent = ({ promotion, onPreSave }) => {
    const [isPreSaving, setIsPreSaving] = useState(false);

    const handlePreSaveClick = () => {
        setIsPreSaving(true);
        onPreSave(); // This will handle the redirect
    };

    return (
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center">
            <div className="mb-4">
                <Calendar className="mx-auto w-12 h-12 text-purple-600 mb-2" />
                <h3 className="text-lg font-semibold text-gray-800">Pre-Save This Release</h3>
                <p className="text-sm text-gray-600">Automatically add to your Spotify when it's released</p>
            </div>
            
            <ActionButton
                onClick={handlePreSaveClick}
                disabled={isPreSaving}
                className="w-full"
                icon={isPreSaving ? "loading" : "heart"}
            >
                {isPreSaving ? 'Connecting...' : 'Pre-Save on Spotify'}
            </ActionButton>
        </div>
    );
};

// Music Links Component
const MusicLinks = ({ links, onLinkClick }) => {
    if (!links || links.length === 0) return null;

    const getPlatformColor = (platform) => {
        switch (platform.toLowerCase()) {
            case 'spotify': return 'bg-green-500 hover:bg-green-600';
            case 'apple music': return 'bg-gray-900 hover:bg-black';
            case 'youtube music': return 'bg-red-500 hover:bg-red-600';
            case 'soundcloud': return 'bg-orange-500 hover:bg-orange-600';
            default: return 'bg-purple-500 hover:bg-purple-600';
        }
    };

    return (
        <div className="space-y-3">
            {links.map((link, index) => (
                <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onLinkClick(link.platform)}
                    className={cn(
                        "flex items-center justify-between w-full p-4 rounded-lg text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg",
                        getPlatformColor(link.platform)
                    )}
                >
                    <div className="flex items-center gap-3">
                        <Play className="w-5 h-5" />
                        <span>Listen on {link.platform}</span>
                    </div>
                    <ExternalLink className="w-4 h-4" />
                </a>
            ))}
        </div>
    );
};

export default function LandingPage() {
    const [campaign, setCampaign] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();

    useEffect(() => {
        loadCampaign();
    }, [location]);

    const loadCampaign = async () => {
        const params = new URLSearchParams(location.search);
        const slug = params.get('slug');

        if (!slug) {
            setError('Campaign not found');
            setIsLoading(false);
            return;
        }

        try {
            // Use a simplified, public URL structure
            const response = await fetch(`/functions/publicCampaign?slug=${encodeURIComponent(slug)}`);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
                throw new Error(errorData.error);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            setCampaign(data);
        } catch (error) {
            console.error('Error loading campaign:', error);
            setError(error.message || 'Failed to load campaign');
        } finally {
            setIsLoading(false);
        }
    };

    const trackClick = async (platform) => {
        if (!campaign?.promotion?.id) return;
        
        try {
            // Use the simplified, public URL
            await fetch(`/functions/publicCampaign?action=click&promotionId=${campaign.promotion.id}`);
        } catch (error) {
            console.error('Error tracking click:', error);
        }
    };

    const handleFanSubmit = async (fanData) => {
        if (!campaign?.promotion?.id) return;
        
        try {
            // Use the simplified, public URL
            const response = await fetch(`/functions/publicCampaign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'collect_fan',
                    promotionId: campaign.promotion.id,
                    email: fanData.email,
                    name: fanData.name
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to submit');
            }
        } catch (error) {
            console.error('Error submitting fan data:', error);
            throw error;
        }
    };

    const handlePreSave = () => {
        if (!campaign?.promotion?.id) return;
        // Redirect to the backend function which will handle the Spotify OAuth flow
        const spotifyAuthUrl = `${window.location.origin}/functions/spotifyPreSave?promotionId=${campaign.promotion.id}`;
        window.location.href = spotifyAuthUrl;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-center">
                    <AnimatedIcon icon="loading" size={48} className="mx-auto mb-4 text-white" trigger="spin" />
                    <p className="text-white text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-center bg-white/10 backdrop-blur-lg rounded-lg p-8 max-w-md mx-4">
                    <h1 className="text-2xl font-bold text-white mb-4">Campaign Not Found</h1>
                    <p className="text-white/80 mb-6">{error}</p>
                    <p className="text-white/60 text-sm">Please check the link and try again.</p>
                </div>
            </div>
        );
    }

    const { promotion, release, artist } = campaign;

    // Determine content data (either from internal release or external release)
    const contentData = promotion.external_release_data ? {
        title: promotion.external_release_data.title,
        artist_name: promotion.external_release_data.artist_name,
        cover_art_url: promotion.external_release_data.cover_art_url,
        release_date: promotion.external_release_data.release_date
    } : {
        title: release?.title || promotion.title,
        artist_name: release?.artist_name || artist?.artist_name || artist?.full_name,
        cover_art_url: release?.cover_art_url || promotion.cover_image_url,
        release_date: release?.release_date
    };

    // Dynamic styling
    const backgroundStyle = {
        backgroundColor: promotion.styling_options?.background_color || '#1a1a2e',
        backgroundImage: promotion.styling_options?.background_image_url ? `url(${promotion.styling_options.background_image_url})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: promotion.styling_options?.background_image_url ? 'overlay' : 'normal'
    };

    const textColor = promotion.styling_options?.text_color || '#ffffff';

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={backgroundStyle}>
            <PixelScripts pixelIds={promotion.pixel_ids} />
            
            <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-8">
                    <div className="relative mb-6">
                        <img
                            src={contentData.cover_art_url || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=400&q=80'}
                            alt={contentData.title}
                            className="w-64 h-64 mx-auto rounded-xl shadow-2xl object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                    </div>
                    
                    <h1 className="text-3xl font-bold mb-2" style={{ color: textColor }}>
                        {contentData.title}
                    </h1>
                    <p className="text-xl opacity-80 mb-4" style={{ color: textColor }}>
                        {contentData.artist_name}
                    </p>
                    
                    {contentData.release_date && (
                        <p className="text-sm opacity-60 mb-6" style={{ color: textColor }}>
                            {promotion.type === 'presave' ? 'Releases' : 'Released'} {new Date(contentData.release_date).toLocaleDateString()}
                        </p>
                    )}
                </div>

                <div className="space-y-6">
                    {promotion.type === 'presave' ? (
                        <PreSaveComponent promotion={promotion} onPreSave={handlePreSave} />
                    ) : (
                        <MusicLinks links={promotion.links} onLinkClick={trackClick} />
                    )}

                    {promotion.fan_collection_enabled && (
                        <FanCollectionForm promotion={promotion} onSubmit={handleFanSubmit} />
                    )}

                    <SocialLinks socialLinks={promotion.social_links} trackClick={trackClick} />
                </div>

                <div className="text-center mt-8">
                    <p className="text-xs opacity-60" style={{ color: textColor }}>
                        Powered by LUCY
                    </p>
                </div>
            </div>
        </div>
    );
}
