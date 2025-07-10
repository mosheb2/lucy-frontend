import React, { useState, useEffect } from 'react';
import { Story } from '@/api/entities';
import StudioPanel from '../StudioPanel';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CreateStoryModal from '../social/CreateStoryModal';
import StoryViewer from '../social/StoryViewer';

export default function StoriesSection({ user }) {
    const [stories, setStories] = useState([]);
    const [isCreateStoryModalOpen, setCreateStoryModalOpen] = useState(false);
    const [viewingStory, setViewingStory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadStories();
        }
    }, [user]);

    const loadStories = async () => {
        setLoading(true);
        try {
            console.log('Loading stories for user:', user.id);
            
            // Get all stories first
            const allStories = await Story.list('-created_date', 50);
            console.log('All stories from database:', allStories);
            
            // Filter stories that are less than 24 hours old
            const now = new Date();
            const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
            
            const activeStories = allStories.filter(story => {
                const storyDate = new Date(story.created_date);
                const isActive = storyDate > twentyFourHoursAgo;
                console.log(`Story ${story.id} created at ${story.created_date}, is active: ${isActive}`);
                return isActive;
            });
            
            console.log('Active stories after filtering:', activeStories);
            setStories(activeStories);
        } catch (error) {
            console.error("Error loading stories:", error);
            setStories([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStoryCreated = (newStory) => {
        console.log('New story created:', newStory);
        // Add the new story to the current list immediately
        setStories(prev => [newStory, ...prev]);
        // Also refresh the full list to ensure consistency
        setTimeout(() => loadStories(), 1000);
    };

    const handleViewStory = (stories, startIndex) => {
        setViewingStory({ stories, startIndex });
    };

    const getInitials = (name) => {
        if (!name) return "?";
        const names = name.split(' ');
        return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : names[0][0];
    };

    const userStory = stories.find(s => s.author_id === user.id);
    const otherStories = stories.filter(s => s.author_id !== user.id).slice(0, 5);

    console.log('Current user:', user.id, 'User story:', userStory, 'Other stories:', otherStories.length);

    return (
        <>
            <div>
                <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-xl font-bold text-slate-900">Stories</h2>
                    <Link to={createPageUrl('SocialFeed')}>
                        <Button variant="ghost" size="sm" className="text-purple-600">
                            View All
                        </Button>
                    </Link>
                </div>

                <StudioPanel className="p-4">
                    <div className="flex items-center gap-4 overflow-x-auto pb-2">
                        {/* Add Story Button */}
                        <div className="flex flex-col items-center gap-2 flex-shrink-0">
                            <button
                                onClick={() => setCreateStoryModalOpen(true)}
                                className="relative w-16 h-16 rounded-full flex items-center justify-center bg-slate-100 border-2 border-dashed border-slate-300 hover:border-purple-500 hover:bg-purple-50 transition-all"
                            >
                                <Plus className="w-6 h-6 text-slate-500" />
                            </button>
                            <p className="text-xs font-medium text-slate-700">Add Story</p>
                        </div>

                        {/* User's own story (if exists) */}
                        {userStory && (
                            <div 
                                className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer"
                                onClick={() => handleViewStory(stories, stories.findIndex(s => s.id === userStory.id))}
                            >
                                <div className="relative w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500">
                                    <Avatar className="w-full h-full border-2 border-white">
                                        <AvatarImage src={userStory.author_avatar_url} />
                                        <AvatarFallback>{getInitials(userStory.author_name)}</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-1 -right-1 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full text-xs font-medium text-slate-700 shadow">
                                        <Eye className="w-3 h-3"/>
                                        <span>{userStory.viewers?.length || 0}</span>
                                    </div>
                                </div>
                                <p className="text-xs font-medium text-slate-800">Your Story</p>
                            </div>
                        )}

                        {/* Other stories */}
                        {otherStories.map((story, index) => (
                            <div 
                                key={story.id} 
                                className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer"
                                onClick={() => handleViewStory(stories, stories.findIndex(s => s.id === story.id))}
                            >
                                <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500">
                                    <Avatar className="w-full h-full border-2 border-white">
                                        <AvatarImage src={story.author_avatar_url} />
                                        <AvatarFallback>{getInitials(story.author_name)}</AvatarFallback>
                                    </Avatar>
                                </div>
                                <p className="text-xs font-medium text-slate-800">{story.author_name}</p>
                            </div>
                        ))}

                        {!loading && stories.length === 0 && (
                            <div className="text-center py-6 text-slate-500 w-full">
                                <p className="text-sm">No active stories</p>
                                <p className="text-xs">Be the first to share!</p>
                            </div>
                        )}
                    </div>
                </StudioPanel>
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