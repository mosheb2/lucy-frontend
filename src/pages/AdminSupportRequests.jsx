import React, { useState, useEffect } from 'react';
import { SupportRequest, User } from '@/api/entities';
import StudioPanel from '../components/StudioPanel';
import { Loader2, Calendar, Phone, Mail, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function AdminSupportRequests() {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadRequests = async () => {
        setIsLoading(true);
        try {
            const data = await SupportRequest.list('-created_date');
            setRequests(data);
        } catch (error) {
            console.error("Failed to load support requests:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        loadRequests();
    }, []);
    
    const handleStatusChange = async (requestId, newStatus) => {
        try {
            await SupportRequest.update(requestId, { status: newStatus });
            loadRequests();
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">Support & Consultation Requests</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.map(req => (
                    <StudioPanel key={req.id} className="p-6">
                        <div className="flex justify-between items-start">
                            <Badge variant={req.status === 'pending' ? 'destructive' : 'default'} className="capitalize">{req.status}</Badge>
                            <p className="text-sm text-slate-500">{format(new Date(req.created_date), 'MMM d, yyyy')}</p>
                        </div>
                        <h3 className="text-lg font-semibold my-2">{req.name}</h3>
                        <div className="space-y-2 text-sm text-slate-600">
                            <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> <span>{req.email}</span></div>
                            <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> <span>{req.phone}</span></div>
                            {req.mentor_name && (
                                <div className="flex items-center gap-2 pt-2 text-purple-700 font-medium">
                                    <UserIcon className="w-4 h-4" /> 
                                    <span>Mentor: {req.mentor_name}</span>
                                </div>
                            )}
                        </div>
                        <p className="mt-4 text-sm bg-slate-50 p-3 rounded-lg border">{req.message}</p>
                        <div className="mt-4">
                            <Select value={req.status} onValueChange={(value) => handleStatusChange(req.id, value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Update status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </StudioPanel>
                ))}
            </div>
        </div>
    );
}