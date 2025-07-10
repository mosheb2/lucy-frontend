
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from 'lucide-react';

export default function StoriesBar({ stories, currentUser, onAddStory, onViewStory }) {
  const getInitials = (name) => {
    if (!name) return "?";
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : names[0][0];
  };

  const userStory = stories.find(s => s.author_id === currentUser.id);
  const otherStories = stories.filter(s => s.author_id !== currentUser.id);

  return (
    <div className="w-full">
        <div className="flex items-center gap-4 py-4 overflow-x-auto">
          {/* Add Story Button */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <button
              onClick={onAddStory}
              className="relative w-16 h-16 rounded-full flex items-center justify-center bg-slate-100 border-2 border-dashed border-slate-300 hover:border-purple-500 hover:bg-purple-50 transition-all"
            >
              <Plus className="w-6 h-6 text-slate-500 group-hover:text-purple-600" />
            </button>
            <p className="text-xs font-medium text-slate-700">Add Story</p>
          </div>

          {/* User's own story (if exists) */}
          {userStory && (
            <div 
              key={userStory.id} 
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
              onClick={() => onViewStory(stories, stories.findIndex(s => s.id === userStory.id))}
            >
              <div className="relative w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500">
                <Avatar className="w-full h-full border-2 border-white">
                  <AvatarImage src={userStory.author_avatar_url} />
                  <AvatarFallback>{getInitials(userStory.author_name)}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 flex items-center gap-1 bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded-full text-xs font-medium text-slate-700 shadow">
                    <Eye className="w-3 h-3"/>
                    <span>{userStory.viewers?.length || 0}</span>
                </div>
              </div>
              <p className="text-xs font-medium text-slate-800 group-hover:text-purple-600 transition-colors">Your Story</p>
            </div>
          )}

          {/* Other stories */}
          {otherStories.map((story, index) => (
            <div 
              key={story.id} 
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
              onClick={() => onViewStory(stories, stories.findIndex(s => s.id === story.id))}
            >
              <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500">
                <Avatar className="w-full h-full border-2 border-white">
                  <AvatarImage src={story.author_avatar_url} />
                  <AvatarFallback>{getInitials(story.author_name)}</AvatarFallback>
                </Avatar>
              </div>
              <p className="text-xs font-medium text-slate-800 group-hover:text-purple-600 transition-colors">{story.author_name}</p>
            </div>
          ))}
        </div>
    </div>
  );
}
