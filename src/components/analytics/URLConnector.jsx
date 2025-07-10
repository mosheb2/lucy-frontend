
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import GlassCard from "../GlassCard";
import GlassInput from "../GlassInput";
import { Label } from "@/components/ui/label";
import { Music, Save, Loader2, Instagram, Youtube } from 'lucide-react';


const availablePlatforms = [
  { id: 'spotify_url', name: 'Spotify', icon: <Music title="Spotify" className="h-5 w-5 text-[#1DB954]" />, placeholder: "https://open.spotify.com/artist/..." },
  { id: 'apple_music_url', name: 'Apple Music', icon: <Music title="Apple Music" className="h-5 w-5 text-white" />, placeholder: "https://music.apple.com/us/artist/..." },
  { id: 'youtube_url', name: 'YouTube', icon: <Youtube title="YouTube" className="h-5 w-5 text-[#FF0000]" />, placeholder: "https://youtube.com/channel/..." },
  { id: 'instagram_url', name: 'Instagram', icon: <Instagram title="Instagram" className="h-5 w-5 text-white" />, placeholder: "https://instagram.com/..." },
];

export default function URLConnector({ initialUrls, onSave, isSaving }) {
  const [urls, setUrls] = useState({});

  useEffect(() => {
    setUrls(initialUrls || {});
  }, [initialUrls]);

  const handleChange = (id, value) => {
    setUrls(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = () => {
    onSave(urls);
  };
  
  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Connect Public Profiles</h2>
      <p className="text-white/70 mb-6">Provide links to your public profiles. Our AI will analyze publicly available data to generate insights.</p>
      
      <div className="space-y-4">
        {availablePlatforms.map(platform => (
          <div key={platform.id}>
            <Label htmlFor={platform.id} className="text-white/80 flex items-center gap-2 mb-1">
              {platform.icon} {platform.name}
            </Label>
            <GlassInput 
              id={platform.id}
              value={urls[platform.id] || ''}
              onChange={(e) => handleChange(platform.id, e.target.value)}
              placeholder={platform.placeholder}
            />
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="bg-purple-600 hover:bg-purple-700">
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save and Analyze
        </Button>
      </div>
    </GlassCard>
  );
}
