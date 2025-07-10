import React, { useState, useEffect } from "react";
import { User, Follow } from '@/api/entities';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AnimatedIcon from '../AnimatedIcon';

const UserRow = ({ user }) => {
    const getInitials = (name) => {
        if (!name) return "?";
        const names = name.split(' ');
        return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : names[0][0];
    };

    return (
        <div className="flex items-center gap-3">
            <Link to={createPageUrl(`Artist?id=${user.id}`)}>
                <Avatar className="h-10 w-10">
                    <AvatarImage src={user.profile_image_url} />
                    <AvatarFallback>{getInitials(user.artist_name || user.full_name)}</AvatarFallback>
                </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
                <Link to={createPageUrl(`Artist?id=${user.id}`)} className="font-semibold text-sm truncate hover:underline text-slate-900">
                    {user.artist_name || user.full_name}
                </Link>
                <p className="text-xs text-slate-500 truncate">{user.genre || "Artist"}</p>
            </div>
            <Button size="sm" variant="secondary" className="text-xs font-semibold">Follow</Button>
        </div>
    );
};

export default function FeedSidebar({ currentUser }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadSuggestions();
    }
  }, [currentUser]);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const [allUsers, currentFollows] = await Promise.all([
        User.list('-created_date', 20).catch(() => []),
        Follow.filter({ follower_id: currentUser.id }).catch(() => [])
      ]);

      const followingIds = currentFollows.map(f => f.following_id);
      const suggestedUsers = allUsers
        .filter(user => user.id !== currentUser.id && !followingIds.includes(user.id))
        .slice(0, 5);
      setSuggestions(suggestedUsers);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getInitials = (name) => {
    if (!name) return "?";
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : names[0][0];
  };

  return (
    <div className="space-y-6 sticky top-24">
        {currentUser && (
            <div className="flex items-center gap-4">
                 <Link to={createPageUrl(`Artist?id=${currentUser.id}`)}>
                    <Avatar className="h-14 w-14">
                        <AvatarImage src={currentUser.profile_image_url} />
                        <AvatarFallback>{getInitials(currentUser.artist_name || currentUser.full_name)}</AvatarFallback>
                    </Avatar>
                 </Link>
                 <div className="flex-1 min-w-0">
                    <Link to={createPageUrl(`Artist?id=${currentUser.id}`)} className="font-semibold text-sm truncate hover:underline text-slate-900">
                        {currentUser.artist_name || currentUser.full_name}
                    </Link>
                    <p className="text-sm text-slate-500 truncate">{currentUser.email}</p>
                 </div>
            </div>
        )}

        <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-sm text-slate-600">Suggested for you</h3>
                <Link to={createPageUrl('Explore')}>
                    <Button variant="link" size="sm" className="text-xs font-semibold">See All</Button>
                </Link>
            </div>
            {loading ? <p className="text-sm text-slate-500">Loading suggestions...</p> : (
              <div className="space-y-4">
                {suggestions.map(user => (
                  <UserRow key={user.id} user={user} />
                ))}
              </div>
            )}
        </div>
        
        <footer className="text-xs text-slate-400 space-x-2">
            <Link to="#" className="hover:underline">About</Link>
            <span>&middot;</span>
            <Link to="#" className="hover:underline">Help</Link>
            <span>&middot;</span>
            <Link to="#" className="hover:underline">Privacy</Link>
            <span>&middot;</span>
            <Link to="#" className="hover:underline">Terms</Link>
            <p className="mt-2">&copy; {new Date().getFullYear()} LUCY Platform</p>
        </footer>
    </div>
  );
}