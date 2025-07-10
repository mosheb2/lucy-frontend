
import React, { useState, useEffect } from 'react';
import { User, Track, Release, Post } from '@/api/entities';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import LordIcon from './LordIcon'; // Changed from AnimatedIcon to LordIcon

export default function SearchModal({ open, onOpenChange }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ users: [], tracks: [], releases: [], posts: [] });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (query.length > 2) {
      performSearch();
    } else {
      setResults({ users: [], tracks: [], releases: [], posts: [] });
    }
  }, [query]);

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const [users, tracks, releases, posts] = await Promise.all([
        User.list(),
        Track.list(),
        Release.list(),
        Post.list('-created_date', 20)
      ]);

      const searchTerm = query.toLowerCase();
      
      const filteredUsers = users.filter(user => 
        (user.artist_name || user.full_name || '').toLowerCase().includes(searchTerm) ||
        (user.genre || '').toLowerCase().includes(searchTerm)
      ).slice(0, 5);

      const filteredTracks = tracks.filter(track =>
        track.title.toLowerCase().includes(searchTerm) ||
        (track.genre || '').toLowerCase().includes(searchTerm) ||
        (track.artist_name || '').toLowerCase().includes(searchTerm)
      ).slice(0, 5);

      const filteredReleases = releases.filter(release =>
        release.title.toLowerCase().includes(searchTerm) ||
        (release.genre || '').toLowerCase().includes(searchTerm) ||
        (release.artist_name || '').toLowerCase().includes(searchTerm)
      ).slice(0, 5);

      const filteredPosts = posts.filter(post =>
        post.content.toLowerCase().includes(searchTerm) ||
        (post.author_name || '').toLowerCase().includes(searchTerm)
      ).slice(0, 5);

      setResults({
        users: filteredUsers,
        tracks: filteredTracks,
        releases: filteredReleases,
        posts: filteredPosts
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = () => {
    onOpenChange(false);
    setQuery('');
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : names[0][0];
  };

  const totalResults = results.users.length + results.tracks.length + results.releases.length + results.posts.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 w-[95vw] max-w-2xl max-h-[85vh] sm:max-h-[80vh] flex flex-col rounded-3xl border-0 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-100 shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onOpenChange(false)}
            className="sm:hidden -ml-2 h-8 w-8"
          >
            <LordIcon icon="chevronLeft" size={20} />
          </Button>
          
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <LordIcon 
                icon="search" 
                size={16}
                />
            </div>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search artists, tracks, releases..."
              className="pl-10 pr-4 border-0 bg-slate-50 focus-visible:ring-0 focus-visible:ring-offset-0 h-11 rounded-xl"
              autoFocus
            />
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onOpenChange(false)}
            className="hidden sm:flex h-8 w-8"
          >
            <LordIcon icon="close" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {query.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <LordIcon icon="search" size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Search the LUCY Platform</h3>
              <p className="text-slate-600">Find artists, tracks, and releases.</p>
            </div>
          ) : query.length <= 2 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-slate-500">Type at least 3 characters to search...</p>
            </div>
          ) : isSearching ? (
            <div className="flex items-center justify-center py-12">
              <LordIcon icon="loading" size={24} trigger="loop" />
            </div>
          ) : totalResults === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <LordIcon icon="search" size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No results found</h3>
              <p className="text-slate-600">Try different keywords or check spelling.</p>
            </div>
          ) : (
            <div className="p-4 space-y-6">
              {/* Artists */}
              {results.users.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <LordIcon icon="users" size={16} className="text-slate-600" />
                    <h3 className="font-semibold text-slate-900">Artists</h3>
                  </div>
                  <div className="space-y-2">
                    {results.users.map(user => (
                      <Link
                        key={user.id}
                        to={createPageUrl(`Artist?id=${user.id}`)}
                        onClick={handleResultClick}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.profile_image_url} />
                          <AvatarFallback className="bg-purple-100 text-purple-700">
                            {getInitials(user.artist_name || user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">
                            {user.artist_name || user.full_name}
                          </p>
                          {user.genre && (
                            <p className="text-sm text-slate-500 truncate">{user.genre}</p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Tracks */}
              {results.tracks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <LordIcon icon="music" size={16} className="text-slate-600" />
                    <h3 className="font-semibold text-slate-900">Tracks</h3>
                  </div>
                  <div className="space-y-2">
                    {results.tracks.map(track => (
                      <Link
                        key={track.id}
                        to={createPageUrl(`Artist?id=${track.artist_id}`)}
                        onClick={handleResultClick}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <LordIcon icon="music" size={20} colors="primary:#ffffff" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{track.title}</p>
                          <p className="text-sm text-slate-500 truncate">by {track.artist_name}</p>
                        </div>
                        {track.genre && (
                          <Badge variant="secondary" className="text-xs">{track.genre}</Badge>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
