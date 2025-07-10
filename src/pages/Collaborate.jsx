
import React, { useState, useEffect } from 'react';
import { Collaboration, ChatRoom } from '@/api/entities';
import { useAuth } from '@/contexts/AuthContext';
import StudioPanel from '../components/StudioPanel';
import ActionButton from '../components/ActionButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Users, FileText, MessageSquare, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function CollaboratePage() {
    const { user } = useAuth();
    const [collaborations, setCollaborations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const userCollaborations = await Collaboration.filter({
                    $or: [
                        { creator_id: user.id },
                        { collaborator_ids: { $in: [user.id] } }
                    ]
                }, '-updated_date');
                setCollaborations(userCollaborations);
            } catch (error) {
                console.error("Error loading collaborations:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [user]);
    
    const handleCollaborationCreated = (newCollaboration) => {
        setCollaborations(prev => [newCollaboration, ...prev]);
        setCreateModalOpen(false);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Collaborate</h1>
                    <p className="text-lg text-slate-700 mt-1">Work with other artists on your next big hit.</p>
                </div>
                <ActionButton onClick={() => setCreateModalOpen(true)} icon="plus">
                    New Collaboration
                </ActionButton>
            </div>

            {collaborations.length === 0 ? (
                <StudioPanel className="p-12 text-center">
                    <Users className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                    <h2 className="text-xl font-semibold text-slate-800">No Collaborations Yet</h2>
                    <p className="text-slate-500 mb-6">Start a new project to work with other artists.</p>
                    <ActionButton onClick={() => setCreateModalOpen(true)} icon="plus">
                        Start Collaborating
                    </ActionButton>
                </StudioPanel>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {collaborations.map(collab => (
                        <StudioPanel key={collab.id} className="p-6 flex flex-col">
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-slate-800">{collab.title}</h3>
                                    <Badge variant={collab.status === 'active' ? 'default' : 'secondary'} className="capitalize">{collab.status}</Badge>
                                </div>
                                <p className="text-sm text-slate-600 mb-4 h-10 overflow-hidden">{collab.description}</p>
                                <div className="text-xs text-slate-500 space-y-1">
                                    <p>Type: <span className="font-medium capitalize">{collab.type}</span></p>
                                    <p>Due: {collab.due_date ? format(new Date(collab.due_date), 'PPP') : 'Not set'}</p>
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    {/* Placeholder for collaborator avatars */}
                                    <div className="w-8 h-8 rounded-full bg-purple-200 border-2 border-white"></div>
                                    <div className="w-8 h-8 rounded-full bg-indigo-200 border-2 border-white"></div>
                                </div>
                                {collab.chat_room_id && (
                                    <Link to={createPageUrl(`Messenger?id=${collab.chat_room_id}`)}>
                                        <ActionButton variant="secondary" size="sm" icon="message">
                                            Chat
                                        </ActionButton>
                                    </Link>
                                )}
                            </div>
                        </StudioPanel>
                    ))}
                </div>
            )}
            
            <CreateCollaborationModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setCreateModalOpen(false)}
                currentUser={user}
                onSuccess={handleCollaborationCreated}
            />
        </div>
    );
}

const CreateCollaborationModal = ({ isOpen, onClose, currentUser, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'track',
        due_date: '',
        collaborator_emails: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreateCollaboration = async () => {
        if (!formData.title || !formData.type) return;
        setIsSubmitting(true);
        try {
            // 1. Create the Collaboration
            const newCollab = await Collaboration.create({
                ...formData,
                creator_id: currentUser.id,
                creator_name: currentUser.artist_name || currentUser.full_name,
                collaborator_ids: [currentUser.id], // Start with creator
                collaborator_emails: formData.collaborator_emails.split(',').map(e => e.trim()).filter(Boolean),
                status: 'active',
            });

            // 2. Create a dedicated ChatRoom
            const newChatRoom = await ChatRoom.create({
                name: newCollab.title,
                type: 'collaboration',
                participants: [currentUser.id], // For now, only creator. Others can be invited.
                collaboration_id: newCollab.id,
            });

            // 3. Update the Collaboration with the chat_room_id
            const updatedCollab = await Collaboration.update(newCollab.id, {
                chat_room_id: newChatRoom.id,
            });

            onSuccess(updatedCollab);
        } catch (error) {
            console.error("Failed to create collaboration:", error);
            alert("Failed to create collaboration. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Start a New Collaboration</DialogTitle>
                    <DialogDescription>Define your project and invite other artists to join.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="collab-title">Title *</Label>
                        <Input id="collab-title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g., Summer Hit Single" />
                    </div>
                    <div>
                        <Label htmlFor="collab-desc">Description</Label>
                        <Textarea id="collab-desc" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Describe the project goals, style, etc." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="collab-type">Type *</Label>
                            <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="track">Track</SelectItem>
                                    <SelectItem value="release">Release</SelectItem>
                                    <SelectItem value="project">Project</SelectItem>
                                    <SelectItem value="remix">Remix</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="collab-due">Due Date</Label>
                            <Input id="collab-due" type="date" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="collab-emails">Invite Collaborators (by email)</Label>
                        <Input id="collab-emails" value={formData.collaborator_emails} onChange={(e) => setFormData({...formData, collaborator_emails: e.target.value})} placeholder="jane@example.com, john@example.com" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <ActionButton onClick={handleCreateCollaboration} disabled={isSubmitting} icon={isSubmitting ? 'loading' : 'plus'}>
                        {isSubmitting ? 'Creating...' : 'Create Collaboration'}
                    </ActionButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
