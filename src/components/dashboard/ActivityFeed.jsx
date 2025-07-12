import React, { useState, useEffect } from 'react';
import StudioPanel from '../StudioPanel';
import AnimatedIcon from '../AnimatedIcon';
import { Post, Like, Comment, Follow, User } from '@/api/entities';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import PostCard from '../social/PostCard';

const QuickPostCreator = ({ user, onPost, isExpanded, setIsExpanded }) => {
  const [postText, setPostText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const getInitials = (name) => {
    if (!name) return "?";
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : names[0][0];
  };

  const handlePost = async () => {
    if (!postText.trim() || isPosting || !user || !user.id) return;
    
    setIsPosting(true);
    try {
      const newPost = await Post.create({
        author_id: user.id,
        author_name: user.artist_name || user.full_name || 'Anonymous',
        author_avatar_url: user.profile_image_url || '',
        content: postText.trim(),
      });
      
      onPost(newPost);
      setPostText('');
      setIsExpanded(false);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsPosting(false);
    }
  };

  // Disable the component if no user is provided
  if (!user) {
    return null;
  }

  return (
    <motion.div
      initial={false}
      animate={{ height: isExpanded ? 'auto' : 60 }}
      className="bg-slate-50 rounded-xl p-3 mb-4 overflow-hidden"
    >
      <div className="flex items-start gap-3">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={user?.profile_image_url} />
          <AvatarFallback className="bg-purple-600 text-white text-xs">
            {getInitials(user?.artist_name || user?.full_name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          {!isExpanded ? (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full text-left text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Share an update...
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <Textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="What's happening in your music world?"
                className="min-h-[60px] resize-none border-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent rounded-lg text-sm"
                autoFocus
              />
              
              <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="text-slate-500"
                >
                  Cancel
                </Button>
                
                <Button 
                  size="sm" 
                  onClick={handlePost}
                  disabled={!postText.trim() || isPosting}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isPosting ? (
                    <AnimatedIcon icon="loading" size={14} trigger="spin" />
                  ) : (
                    'Post'
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function ActivityFeed({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPostCreatorExpanded, setIsPostCreatorExpanded] = useState(false);

  useEffect(() => {
    if (user) {
      loadRecentPosts();
    } else {
      // If no user is provided, just set loading to false
      setLoading(false);
    }
  }, [user]);

  const loadRecentPosts = async () => {
    if (!user || !user.id) {
      setLoading(false);
      setPosts([]);
      return;
    }
    
    setLoading(true);
    try {
      // Get recent posts from people user follows + own posts
      const follows = await Follow.filter({ follower_id: user.id });
      const followedUserIds = Array.isArray(follows) ? follows.map(f => f.following_id) : [];
      const allUserIds = [user.id, ...followedUserIds];

      const recentPosts = await Post.list('-created_date', 6);
      
      // Safety check to ensure recentPosts is an array
      if (!Array.isArray(recentPosts)) {
        setPosts([]);
        return;
      }
      
      const relevantPosts = recentPosts.filter(post => 
        allUserIds.includes(post.author_id) || Math.random() > 0.7 // Include some random posts for discovery
      );

      setPosts(relevantPosts.slice(0, 4)); // Show max 4 posts
    } catch (error) {
      console.error('Error loading recent posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPost = (newPost) => {
    setPosts(prev => [newPost, ...prev.slice(0, 3)]); // Keep only 4 posts max
  };

  if (loading) {
    return (
      <StudioPanel className="p-4 md:p-6">
        <div className="flex items-center justify-center py-8">
          <AnimatedIcon icon="loading" size={32} className="text-purple-600" trigger="spin" />
        </div>
      </StudioPanel>
    );
  }

  return (
    <StudioPanel className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <h2 className="text-xl font-bold text-slate-900">Community Feed</h2>
        <Link to={createPageUrl('SocialFeed')}>
          <Button variant="ghost" size="sm" className="text-purple-600 w-full sm:w-auto">
            View All
            <AnimatedIcon icon="chevronRight" size={16} className="ml-1" />
          </Button>
        </Link>
      </div>

      <QuickPostCreator 
        user={user} 
        onPost={handleNewPost}
        isExpanded={isPostCreatorExpanded}
        setIsExpanded={setIsPostCreatorExpanded}
      />
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="scale-95 origin-top">
                <PostCard
                  post={post}
                  currentUser={user}
                />
              </div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <AnimatedIcon icon="compass" size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-600 text-sm">No recent activity</p>
              <p className="text-xs text-slate-500 mb-4">Follow other artists to see their updates</p>
              <Link to={createPageUrl('SocialFeed')}>
                <Button variant="outline" size="sm">
                  Discover Artists
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </StudioPanel>
  );
}