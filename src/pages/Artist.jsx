
import React, { useState, useEffect } from 'react';
import { User, Follow, Post, Release, Notification, SavedPost } from '@/api/entities';
import { useAuth } from '@/contexts/AuthContext';
import StudioPanel from '../components/StudioPanel';
import ActionButton from '../components/ActionButton';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid3X3, Music, Settings, Save } from "lucide-react";
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AnimatedIcon from '../components/AnimatedIcon';
import PostCard from '../components/social/PostCard';
import CreateCollaborationModal from '@/components/CreateCollaborationModal';
import { messageSystem } from '@/api/functions';

export default function ArtistProfilePage() {
  const { user: currentUser } = useAuth();
  const [artist, setArtist] = useState(null);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [releases, setReleases] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followRecord, setFollowRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateCollabModalOpen, setCreateCollabModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchArtistData = async () => {
      if (!currentUser) {
        setError("Please log in to view artist profiles.");
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams(location.search);
      let artistId = params.get('id');

      try {
        if (!artistId) {
          artistId = currentUser.id;
        }

        // Validate that the artist ID exists before trying to fetch
        let artistData;
        try {
          artistData = await User.get(artistId);
          if (!artistData) {
            throw new Error("Artist not found");
          }
        } catch (userError) {
          console.error("User not found:", userError);
          if (userError.message === "Access token required" || userError.message === "Invalid token") {
            setError("Please log in to view artist profiles.");
          } else {
            setError("Artist not found. This profile may have been deleted or the link is invalid.");
          }
          setIsLoading(false);
          return;
        }

        const promises = [
          Post.filter({ author_id: artistId }, "-created_date"),
          Release.filter({ artist_id: artistId }, "-release_date"),
        ];

        if (currentUser && artistId !== currentUser.id) {
          promises.push(Follow.filter({ follower_id: currentUser.id, following_id: artistId }));
        } else {
          promises.push(Promise.resolve([])); // Placeholder for follow status
        }

        if (currentUser && artistId === currentUser.id) {
          promises.push(SavedPost.filter({ user_id: currentUser.id }));
        }

        const [artistPosts, artistReleases, followStatus, savedPostRecords] = await Promise.all(promises);
        
        setArtist(artistData);
        setPosts(artistPosts);
        setReleases(artistReleases);
        
        if (followStatus && followStatus.length > 0) {
          setIsFollowing(true);
          setFollowRecord(followStatus[0]);
        } else {
          setIsFollowing(false);
          setFollowRecord(null);
        }

        if (savedPostRecords && savedPostRecords.length > 0) {
          const postIds = savedPostRecords.map(sp => sp.post_id);
          const fullSavedPosts = await Promise.all(
            postIds.map(id => Post.get(id).catch(err => {
                console.error(`Failed to fetch saved post with id ${id}`, err);
                return null;
            }))
          );
          setSavedPosts(fullSavedPosts.filter(Boolean)); // Filter out any nulls from failed fetches
        }


      } catch (error) {
        console.error("Error fetching artist data:", error);
        if (error.message === "Access token required" || error.message === "Invalid token") {
          setError("Please log in to view artist profiles.");
        } else {
          setError("Failed to load artist profile. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchArtistData();
  }, [location.search, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser || !artist || currentUser.id === artist.id) return;
    
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);

    try {
      if (wasFollowing && followRecord) {
        await Follow.delete(followRecord.id);
        setFollowRecord(null);
      } else if (!wasFollowing) {
        const newFollow = await Follow.create({
          follower_id: currentUser.id,
          following_id: artist.id
        });
        setFollowRecord(newFollow);
        
        await Notification.create({
          user_id: artist.id,
          type: 'follow',
          message: 'started following you.',
          from_user_id: currentUser.id,
          from_user_name: currentUser.artist_name || currentUser.full_name,
          from_user_avatar: currentUser.profile_image_url,
          target_id: currentUser.id,
          action_url: createPageUrl(`Artist?id=${currentUser.id}`)
        });
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      setIsFollowing(wasFollowing);
    }
  };

  const handleStartMessage = async () => {
    if (!currentUser || !artist || currentUser.id === artist.id) return;
    
    try {
      const response = await messageSystem({
        action: 'create_direct_chat',
        targetUserId: artist.id
      });
      
      if (response.data.success && response.data.chat_room) {
        const event = new CustomEvent('open-chat', { detail: response.data.chat_room });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Error creating direct chat:', error);
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };

  const handleCollaborationCreated = () => {
    setCreateCollabModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <AnimatedIcon icon="loading" size={48} className="text-purple-600" trigger="spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <StudioPanel className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <AnimatedIcon icon="warning" size={32} className="text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Profile Not Found</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <ActionButton onClick={() => window.history.back()} variant="secondary">
              Go Back
            </ActionButton>
            <Link to={createPageUrl("Explore")}>
              <ActionButton>Discover Artists</ActionButton>
            </Link>
          </div>
        </StudioPanel>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="max-w-2xl mx-auto">
        <StudioPanel className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
            <AnimatedIcon icon="users" size={32} className="text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Artist Not Found</h2>
          <p className="text-slate-600 mb-6">The artist profile you're looking for doesn't exist or has been removed.</p>
          <div className="flex gap-3 justify-center">
            <ActionButton onClick={() => window.history.back()} variant="secondary">
              Go Back
            </ActionButton>
            <Link to={createPageUrl("Explore")}>
              <ActionButton>Discover Artists</ActionButton>
            </Link>
          </div>
        </StudioPanel>
      </div>
    );
  }
  
  const isOwnProfile = currentUser?.id === artist.id;

  return (
    <>
      <div className="max-w-5xl mx-auto">
        <StudioPanel className="p-0 overflow-hidden">
          <div className="relative h-48 md:h-64 bg-slate-200">
            <img src={artist.cover_image_url || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1500&q=80'} alt="Cover" className="w-full h-full object-cover" />
          </div>
          <div className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row gap-6 -mt-16 sm:-mt-20 items-start">
              <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-white flex-shrink-0 shadow-lg bg-white">
                <AvatarImage src={artist.profile_image_url} />
                <AvatarFallback className="text-5xl bg-purple-100 text-purple-700">{getInitials(artist.artist_name || artist.full_name)}</AvatarFallback>
              </Avatar>
              <div className="w-full pt-16 sm:pt-20">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{artist.artist_name || artist.full_name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-slate-600">@{artist.email.split('@')[0]}</p>
                      {artist.verified && <Badge className="bg-blue-500 hover:bg-blue-600">Verified</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {isOwnProfile ? (
                       <Link to={createPageUrl("Settings")} className="w-full">
                          <ActionButton variant="secondary" icon="settings" className="w-full">Edit Profile</ActionButton>
                       </Link>
                    ) : (
                      <>
                        <ActionButton 
                          onClick={handleFollowToggle}
                          variant={isFollowing ? 'secondary' : 'primary'}
                          icon={isFollowing ? 'check' : 'userPlus'}
                          className="flex-1"
                        >
                          {isFollowing ? 'Following' : 'Follow'}
                        </ActionButton>
                        <ActionButton 
                          onClick={handleStartMessage}
                          variant="secondary" 
                          className="flex-1" 
                          icon="message"
                        >
                          Message
                        </ActionButton>
                        <ActionButton 
                          onClick={() => setCreateCollabModalOpen(true)}
                          variant="secondary" 
                          className="flex-1" 
                          icon="collaborate"
                        >
                          Collaborate
                        </ActionButton>
                         {artist.tip_jar_url && (
                            <a href={artist.tip_jar_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                                <ActionButton 
                                    variant="primary" 
                                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600" 
                                    icon="dollar"
                                >
                                    Tip Jar
                                </ActionButton>
                            </a>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-slate-700 whitespace-pre-line">{artist.bio || "No bio yet."}</p>
              {artist.website && (
                <a href={artist.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline mt-2 block font-medium">
                  {artist.website}
                </a>
              )}
            </div>

            <div className="flex items-center gap-6 mt-6 border-t pt-4">
              <div className="text-center">
                <p className="font-bold text-lg text-slate-900">{posts.length}</p>
                <p className="text-sm text-slate-500">Posts</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg text-slate-900">{artist.followers_count || 0}</p>
                <p className="text-sm text-slate-500">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg text-slate-900">{artist.following_count || 0}</p>
                <p className="text-sm text-slate-500">Following</p>
              </div>
            </div>
          </div>
        </StudioPanel>

        <div className="mt-6">
          <Tabs defaultValue="posts">
            <TabsList className={`grid w-full ${isOwnProfile ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <TabsTrigger value="posts"><Grid3X3 className="w-4 h-4 mr-2"/>Posts</TabsTrigger>
              <TabsTrigger value="releases"><Music className="w-4 h-4 mr-2"/>Music</TabsTrigger>
              {isOwnProfile && <TabsTrigger value="saved"><Save className="w-4 h-4 mr-2"/>Saved</TabsTrigger>}
            </TabsList>
            <TabsContent value="posts" className="mt-6">
              <div className="space-y-6">
                {posts.map(post => (
                   <PostCard key={post.id} post={post} currentUser={currentUser} />
                ))}
              </div>
              {posts.length === 0 && <p className="text-center py-12 text-slate-500">No posts yet.</p>}
            </TabsContent>
            <TabsContent value="releases" className="mt-6">
               <div className="space-y-4">
                {releases.map(release => (
                  <StudioPanel key={release.id} className="p-4 flex items-center gap-4">
                    <img src={release.cover_art_url} alt={release.title} className="w-20 h-20 rounded-lg object-cover"/>
                    <div>
                      <h3 className="font-semibold text-slate-900">{release.title}</h3>
                      <p className="text-sm text-slate-500 capitalize">{release.release_type} • {new Date(release.release_date).getFullYear()}</p>
                    </div>
                  </StudioPanel>
                ))}
              </div>
              {releases.length === 0 && <p className="text-center py-12 text-slate-500">No music released yet.</p>}
            </TabsContent>
            {isOwnProfile && (
              <TabsContent value="saved" className="mt-6">
                <div className="space-y-6">
                  {savedPosts.map(post => (
                    <PostCard key={post.id} post={post} currentUser={currentUser} />
                  ))}
                </div>
                {savedPosts.length === 0 && <p className="text-center py-12 text-slate-500">You haven't saved any posts yet.</p>}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
      {currentUser && !isOwnProfile && (
        <CreateCollaborationModal 
          isOpen={isCreateCollabModalOpen}
          onClose={() => setCreateCollabModalOpen(false)}
          currentUser={currentUser}
          onSuccess={handleCollaborationCreated}
          initialCollaborator={artist}
        />
      )}
    </>
  );
}
