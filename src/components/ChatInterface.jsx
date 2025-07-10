import React, { useState, useEffect, useRef } from 'react';
import { User, Collaboration, ChatRoom, Message } from '@/api/entities';
import ActionButton from './ActionButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Send, MessageSquare, Search, ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, formatDistanceToNow, isToday } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from '@/lib/utils';
import { sendMessage } from '@/api/functions';

const ChatWindow = ({ chatRoom, currentUser, onBack, isMobile }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);
    const pollIntervalRef = useRef(null);
    
    const getInitials = (name) => {
        if (!name) return "?";
        const names = name.split(' ');
        return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : names[0][0];
    };

    const otherParticipant = chatRoom?.participants_details?.find(p => p.id !== currentUser.id);

    const fetchMessages = async () => {
        if (!chatRoom) return;
        try {
            const fetchedMessages = await Message.filter({ chat_room_id: chatRoom.id }, 'created_date');
            setMessages(fetchedMessages);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    useEffect(() => {
        fetchMessages();
        pollIntervalRef.current = setInterval(fetchMessages, 5000);
        return () => clearInterval(pollIntervalRef.current);
    }, [chatRoom]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;
        
        setIsSending(true);
        try {
            const savedMessage = await sendMessage({
                room_id: chatRoom.id,
                content: newMessage.trim(),
            });
            setMessages(prev => [...prev, savedMessage]);
            setNewMessage('');
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSending(false);
        }
    };

    if (!chatRoom) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center h-full bg-slate-50 text-center p-4">
                <MessageSquare className="w-16 h-16 text-slate-300 mb-4" />
                <h2 className="text-xl font-bold text-slate-800">Select a conversation</h2>
                <p className="text-slate-500">Choose from your existing conversations or start a new one.</p>
            </div>
        );
    }
    
    const ChatMessage = ({ msg }) => (
        <div className={`flex items-end gap-2 mb-4 ${msg.sender_id === currentUser.id ? 'justify-end' : ''}`}>
            {msg.sender_id !== currentUser.id && (
                 <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={otherParticipant?.profile_image_url} />
                    <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                        {getInitials(otherParticipant?.artist_name)}
                    </AvatarFallback>
                </Avatar>
            )}
            <div className={cn(
                "max-w-[75%] px-4 py-2 rounded-2xl text-sm",
                msg.sender_id === currentUser.id 
                  ? "bg-purple-600 text-white rounded-br-md" 
                  : "bg-gray-100 text-gray-900 rounded-bl-md"
              )}>
                <p>{msg.content}</p>
                <p className={cn(
                    "text-xs mt-1 opacity-70",
                    msg.sender_id === currentUser.id ? "text-purple-100" : "text-gray-500"
                )}>
                    {format(new Date(msg.created_date), 'h:mm a')}
                </p>
            </div>
        </div>
    );

    return (
        <div className="flex-1 flex flex-col h-full bg-white">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
                <div className="flex items-center gap-3">
                    {isMobile && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={onBack}
                            className="lg:hidden"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    )}
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={otherParticipant?.profile_image_url} />
                        <AvatarFallback className="bg-purple-100 text-purple-700">
                            {getInitials(otherParticipant?.artist_name)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold text-slate-900">{otherParticipant?.artist_name || chatRoom.name}</h3>
                        <p className="text-xs text-slate-500">
                            {chatRoom.type === 'direct' ? 'Active now' : 'Collaboration Project'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-slate-600">
                        <Phone className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-600">
                        <Video className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-600">
                        <MoreVertical className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <Avatar className="w-16 h-16 mb-4">
                            <AvatarImage src={otherParticipant?.profile_image_url} />
                            <AvatarFallback className="bg-purple-100 text-purple-700 text-xl">
                                {getInitials(otherParticipant?.artist_name)}
                            </AvatarFallback>
                        </Avatar>
                        <h3 className="font-semibold text-slate-900 mb-1">
                            {otherParticipant?.artist_name || chatRoom.name}
                        </h3>
                        <p className="text-slate-500 text-sm mb-4">
                            Start a conversation with {otherParticipant?.artist_name}
                        </p>
                    </div>
                ) : (
                    messages.map(msg => <ChatMessage key={msg.id} msg={msg} />)
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Message..."
                        className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2 focus:bg-white focus:ring-2 focus:ring-purple-500"
                        autoComplete="off"
                    />
                    <Button 
                        type="submit" 
                        size="icon" 
                        disabled={!newMessage.trim() || isSending} 
                        className="bg-purple-600 hover:bg-purple-700 rounded-full w-10 h-10 flex-shrink-0"
                    >
                        {isSending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default function ChatInterface({ currentUser, initialChatRoomId }) {
    const [chatRooms, setChatRooms] = useState([]);
    const [activeChatRoom, setActiveChatRoom] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showChatList, setShowChatList] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Check if we're on mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const getInitials = (name) => {
        if (!name) return "?";
        const names = name.split(' ');
        return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : names[0][0];
    };
    
    const enrichChatRooms = async (rooms) => {
        try {
            return Promise.all(
                rooms.map(async (chat) => {
                    try {
                        const participantDetails = await Promise.all(
                            chat.participants.map(async id => {
                                try {
                                    return await User.get(id);
                                } catch (err) {
                                    console.error(`Failed to fetch user ${id}:`, err);
                                    // Return a placeholder user object instead of null
                                    return {
                                        id,
                                        full_name: "Unknown User",
                                        username: "unknown",
                                        avatar_url: null
                                    };
                                }
                            })
                        );
                        return {
                            ...chat,
                            participants_details: participantDetails,
                        };
                    } catch (err) {
                        console.error(`Failed to enrich chat room ${chat.id}:`, err);
                        return chat; // Return the original chat without participant details
                    }
                })
            );
        } catch (error) {
            console.error("Error enriching chat rooms:", error);
            return rooms; // Return original rooms if enrichment fails
        }
    };

    useEffect(() => {
        const loadData = async () => {
            if (!currentUser) return;
            setIsLoading(true);
            try {
                const userChatRooms = await ChatRoom.filter({ participants: { $in: [currentUser.id] } }, '-last_message_at');
                const enrichedRooms = await enrichChatRooms(userChatRooms);
                setChatRooms(enrichedRooms);

                if (initialChatRoomId) {
                    const initialRoom = enrichedRooms.find(r => r.id === initialChatRoomId);
                    if (initialRoom) {
                        setActiveChatRoom(initialRoom);
                        if (isMobile) {
                            setShowChatList(false);
                        }
                    }
                } else if (enrichedRooms.length > 0 && !isMobile) {
                    setActiveChatRoom(enrichedRooms[0]);
                }
            } catch (error) {
                console.error("Error loading chat data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [currentUser, initialChatRoomId, isMobile]);

    const filteredChatRooms = chatRooms.filter(room => {
        const otherParticipant = room.participants_details?.find(p => p.id !== currentUser.id);
        const nameToSearch = otherParticipant?.artist_name || otherParticipant?.full_name || room.name;
        return nameToSearch.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    const handleChatSelect = (chat) => {
        setActiveChatRoom(chat);
        if (isMobile) {
            setShowChatList(false);
        }
    };

    const handleBackToList = () => {
        if (isMobile) {
            setShowChatList(true);
            setActiveChatRoom(null);
        }
    };
    
    const ConversationItem = ({ chat }) => {
        const otherParticipant = chat.participants_details?.find(p => p.id !== currentUser.id);
        const lastMessageDate = chat.last_message_at ? new Date(chat.last_message_at) : null;
        const formattedTime = lastMessageDate
            ? isToday(lastMessageDate)
                ? format(lastMessageDate, 'p')
                : format(lastMessageDate, 'MMM d')
            : '';

        return (
            <button
                onClick={() => handleChatSelect(chat)}
                className={cn(
                    "w-full p-4 hover:bg-slate-50 flex items-center gap-3 text-left border-b border-slate-100 transition-colors",
                    activeChatRoom?.id === chat.id && "bg-purple-50 border-purple-200"
                )}
            >
                <div className="relative">
                    <Avatar className="w-12 h-12 flex-shrink-0">
                        <AvatarImage src={otherParticipant?.profile_image_url} />
                        <AvatarFallback className="bg-purple-100 text-purple-700">
                            {getInitials(otherParticipant?.artist_name)}
                        </AvatarFallback>
                    </Avatar>
                    {/* Online indicator */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                        <p className="font-semibold text-slate-900 truncate">
                            {otherParticipant?.artist_name || chat.name}
                        </p>
                        <p className="text-xs text-slate-500 flex-shrink-0 ml-2">{formattedTime}</p>
                    </div>
                    <p className="text-sm text-slate-600 truncate">
                        {chat.last_message || 'Start a conversation...'}
                    </p>
                </div>
            </button>
        );
    };

    const ChatList = () => (
        <div className={cn(
            "bg-white border-r border-slate-200 flex flex-col",
            isMobile ? "w-full" : "w-80"
        )}>
            <div className="p-4 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Messages</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search conversations..."
                        className="pl-10 bg-slate-100 border-0 rounded-full"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                    </div>
                ) : filteredChatRooms.length > 0 ? (
                    filteredChatRooms.map(room => (
                        <ConversationItem key={room.id} chat={room} />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-center p-4">
                        <MessageSquare className="w-12 h-12 text-slate-300 mb-2" />
                        <p className="text-slate-500">No conversations yet</p>
                        <p className="text-sm text-slate-400">Start messaging other artists!</p>
                    </div>
                )}
            </div>
        </div>
    );

    if (isMobile) {
        return (
            <div className="h-full flex flex-col">
                {showChatList ? (
                    <ChatList />
                ) : (
                    <ChatWindow 
                        chatRoom={activeChatRoom} 
                        currentUser={currentUser}
                        onBack={handleBackToList}
                        isMobile={true}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="h-full flex">
            <ChatList />
            <ChatWindow 
                chatRoom={activeChatRoom} 
                currentUser={currentUser}
                onBack={handleBackToList}
                isMobile={false}
            />
        </div>
    );
}