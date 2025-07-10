import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import ChatInterface from './ChatInterface';
import { useLocation } from 'react-router-dom';

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  return matches;
}

export default function FloatingChat({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialChatRoom, setInitialChatRoom] = useState(null);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const location = useLocation();

  const handleOpenChatEvent = (event) => {
    setInitialChatRoom(event.detail);
    setIsOpen(true);
  };
  
  useEffect(() => {
    window.addEventListener('open-chat', handleOpenChatEvent);
    return () => {
      window.removeEventListener('open-chat', handleOpenChatEvent);
    };
  }, []);

  // Hide floating chat if user is on mobile or on the Messenger page
  if (!currentUser || !isDesktop || location.pathname.includes('Messenger')) {
    return null;
  }

  return (
    <>
      {/* The floating pop-up messenger window */}
      {isOpen && (
        <div className="fixed bottom-4 right-24 z-50 w-[780px] h-[600px] bg-white rounded-2xl shadow-2xl border flex flex-col transition-all duration-300">
            <div className="flex items-center justify-between p-2 border-b bg-slate-50 rounded-t-2xl">
                <p className="font-bold ml-3 text-slate-800">Messenger</p>
                <div className="flex items-center">
                     <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                        <Minus className="w-4 h-4 text-slate-600" />
                     </Button>
                     <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                        <X className="w-4 h-4 text-slate-600" />
                     </Button>
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                <ChatInterface currentUser={currentUser} initialChatRoomId={initialChatRoom?.id} />
            </div>
        </div>
      )}
      
      {/* The main chat bubble to open the messenger */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full w-16 h-16 shadow-lg flex items-center justify-center z-50"
      >
        <MessageSquare className="w-7 h-7" />
      </Button>
    </>
  );
}