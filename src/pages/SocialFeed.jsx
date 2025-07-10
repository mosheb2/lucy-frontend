import React, { useState, useEffect } from 'react';
import { Post, Story, SavedPost } from '@/api/entities';
import { useAuth } from '@/contexts/AuthContext';
import PostCard from '../components/social/PostCard';
import AnimatedIcon from '../components/AnimatedIcon';
import StoriesBar from '../components/social/StoriesBar';
import CreateStoryModal from '../components/social/CreateStoryModal';
import StudioPanel from '../components/StudioPanel';
import StoryViewer from '../components/social/StoryViewer';

export default function SocialFeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateStoryModalOpen, setCreateStoryModalOpen] = useState(false);
  const [viewingStory, setViewingStory] = useState(null);

  useEffect(() => {
    loadPageData();
  }, [user]);

  const loadPageData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await loadStories();
      const allPosts = await Post.list('-created_date', 50).catch(() => []);
      setPosts(allPosts);
    } catch (error) {
      console.error("Error loading social feed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStories = async () => {
    try {
        // Get all stories first
        const allStories = await Story.list('-created_date', 50);
        
        // Filter stories that are less than 24 hours old
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        
        const activeStories = allStories.filter(story => {
            const storyDate = new Date(story.created_date);
            return storyDate > twentyFourHoursAgo;
        });
        
        setStories(activeStories);
    } catch (error) {
        console.error("Error loading stories:", error);
    }
  };

  const handleStoryCreated = () => {
    // Re-fetch stories to ensure the new one is included
    loadStories();
  };

  const handleViewStory = (stories, startIndex) => {
    setViewingStory({ stories, startIndex });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <AnimatedIcon icon="loading" size={48} trigger="spin" />
      </div>
    );
  }

  if (!user) {
    return <div className="text-center p-8">Please log in to view the community feed.</div>;
  }

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <StudioPanel className="p-4">
            <StoriesBar 
              stories={stories} 
              currentUser={user} 
              onAddStory={() => setCreateStoryModalOpen(true)}
              onViewStory={handleViewStory}
            />
          </StudioPanel>
          
          <div className="space-y-6">
              {posts.length > 0 ? (
                  posts.map(post => <PostCard key={post.id} post={post} currentUser={user} />)
              ) : (
                  <StudioPanel className="text-center py-16">
                  <AnimatedIcon icon="compass" size={64} className="mx-auto text-slate-300 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">The feed is quiet...</h3>
                  <p className="text-slate-600">Follow more artists to see their posts here!</p>
                  </StudioPanel>
              )}
          </div>
        </div>
      </div>
      
      <CreateStoryModal
        open={isCreateStoryModalOpen}
        onOpenChange={setCreateStoryModalOpen}
        currentUser={user}
        onStoryCreated={handleStoryCreated}
      />

      {viewingStory && (
        <StoryViewer
          stories={viewingStory.stories}
          startIndex={viewingStory.startIndex}
          onClose={() => setViewingStory(null)}
          currentUser={user}
        />
      )}
    </>
  );
}