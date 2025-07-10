import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ChatInterface from '../components/ChatInterface';
import { useLocation } from 'react-router-dom';

export default function MessengerPage() {
    const { user: currentUser } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    
    const params = new URLSearchParams(location.search);
    const initialChatRoomId = params.get('id');

    useEffect(() => {
        setIsLoading(false);
    }, [currentUser]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center p-6">
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">Access Required</h2>
                    <p className="text-slate-600">Please log in to view your messages.</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="h-screen flex flex-col md:h-[calc(100vh-120px)]">
            <div className="flex-1 overflow-hidden">
                <ChatInterface currentUser={currentUser} initialChatRoomId={initialChatRoomId} />
            </div>
        </div>
    );
}