import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { X, Send, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Story } from '@/api/entities';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const EMOJI_REACTIONS = ['❤️', '🔥', '😂', '😮', '😢', '👏'];

export default function StoryViewer({ stories, startIndex, onClose, currentUser }) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const story = stories[currentIndex];

  const timeoutRef = useRef(null);

  const goToNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose(); // Close if it's the last story
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  useEffect(() => {
    // Mark story as viewed
    const markAsViewed = async () => {
      if (story && currentUser && !story.viewers?.includes(currentUser.id)) {
        try {
          await Story.update(story.id, {
            viewers: [...(story.viewers || []), currentUser.id]
          });
        } catch (error) {
          console.error("Failed to mark story as viewed:", error);
        }
      }
    };
    markAsViewed();

    // Auto-advance to next story
    if (story?.content_type === 'image') {
      timeoutRef.current = setTimeout(goToNext, 5000); // 5 seconds for images
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, stories]);

  const handleVideoEnd = () => {
    goToNext();
  };

  const handleReaction = async (emoji) => {
    try {
      await Story.update(story.id, {
        reactions: [
          ...(story.reactions || []),
          { user_id: currentUser.id, user_name: currentUser.artist_name || currentUser.full_name, emoji }
        ]
      });
      // maybe show a quick animation
    } catch (error) {
      console.error("Failed to add reaction:", error);
    }
  };
  
  const getInitials = (name) => {
    if (!name) return "?";
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : names[0][0];
  };

  if (!story) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Navigation */}
        {currentIndex > 0 && (
          <button onClick={(e) => { e.stopPropagation(); goToPrev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 rounded-full p-2">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}
        {currentIndex < stories.length - 1 && (
          <button onClick={(e) => { e.stopPropagation(); goToNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 rounded-full p-2">
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}
        
        <div className="relative w-full max-w-md aspect-[9/16] bg-black rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
          {/* Progress Bars */}
          <div className="absolute top-2 left-2 right-2 flex items-center gap-1">
            {stories.map((s, index) => (
              <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                {index < currentIndex && <div className="h-full w-full bg-white"></div>}
                {index === currentIndex && (
                  <motion.div
                    className="h-full bg-white"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 5, ease: "linear" }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Story Content */}
          {story.content_type === 'image' ? (
            <img src={story.content_url} className="w-full h-full object-cover" />
          ) : (
            <video src={story.content_url} autoPlay onEnded={handleVideoEnd} className="w-full h-full object-cover" />
          )}

          {/* Header */}
          <div className="absolute top-6 left-4 flex items-center gap-2">
             <Link to={createPageUrl(`Artist?id=${story.author_id}`)}>
              <Avatar>
                <AvatarImage src={story.author_avatar_url} />
                <AvatarFallback>{getInitials(story.author_name)}</AvatarFallback>
              </Avatar>
            </Link>
            <p className="text-white font-semibold text-sm shadow-black/50 [text-shadow:_0_1px_2px_var(--tw-shadow-color)]">{story.author_name}</p>
          </div>
          
          <button onClick={onClose} className="absolute top-4 right-4 z-10 text-white">
            <X className="w-6 h-6"/>
          </button>

          {/* Footer & Actions */}
          {currentUser.id === story.author_id ? (
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full">
                <Eye className="w-5 h-5 text-white"/>
                <span className="text-white font-semibold text-sm">{story.viewers?.length || 0}</span>
            </div>
          ) : (
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2">
                {EMOJI_REACTIONS.map(emoji => (
                  <motion.button 
                    key={emoji}
                    whileHover={{ scale: 1.3, rotate: Math.random() * 20 - 10 }}
                    onClick={() => handleReaction(emoji)}
                    className="text-2xl"
                  >
                    {emoji}
                  </motion.button>
                ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}