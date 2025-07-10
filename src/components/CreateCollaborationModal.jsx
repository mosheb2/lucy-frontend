import React, { useState } from 'react';
import { Collaboration, ChatRoom } from '@/api/entities';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import ActionButton from './ActionButton';

export default function CreateCollaborationModal({ isOpen, onClose, currentUser, onSuccess, initialCollaborator }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'track',
        due_date: '',
        collaborator_emails: initialCollaborator ? initialCollaborator.email : '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreateCollaboration = async () => {
        if (!formData.title || !formData.type) return;
        setIsSubmitting(true);
        try {
            // 1. Create the Collaboration
            const collaboratorIds = [currentUser.id];
            if (initialCollaborator) {
                collaboratorIds.push(initialCollaborator.id);
            }

            const newCollab = await Collaboration.create({
                ...formData,
                creator_id: currentUser.id,
                creator_name: currentUser.artist_name || currentUser.full_name,
                collaborator_ids: collaboratorIds,
                collaborator_emails: formData.collaborator_emails.split(',').map(e => e.trim()).filter(Boolean),
                status: 'active',
            });

            // 2. Create a dedicated ChatRoom
            const chatParticipants = [currentUser.id];
            if (initialCollaborator) {
                chatParticipants.push(initialCollaborator.id);
            }

            const newChatRoom = await ChatRoom.create({
                name: newCollab.title,
                type: 'collaboration',
                participants: chatParticipants,
                collaboration_id: newCollab.id,
            });

            // 3. Update the Collaboration with the chat_room_id
            await Collaboration.update(newCollab.id, {
                chat_room_id: newChatRoom.id,
            });

            onSuccess();
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
                    <DialogDescription>
                        {initialCollaborator 
                            ? `Create a collaboration project with ${initialCollaborator.artist_name || initialCollaborator.full_name}`
                            : 'Define your project and invite other artists to join.'
                        }
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="collab-title">Title *</Label>
                        <Input 
                            id="collab-title" 
                            value={formData.title} 
                            onChange={(e) => setFormData({...formData, title: e.target.value})} 
                            placeholder="e.g., Summer Hit Single" 
                        />
                    </div>
                    <div>
                        <Label htmlFor="collab-desc">Description</Label>
                        <Textarea 
                            id="collab-desc" 
                            value={formData.description} 
                            onChange={(e) => setFormData({...formData, description: e.target.value})} 
                            placeholder="Describe the project goals, style, etc." 
                        />
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
                            <Input 
                                id="collab-due" 
                                type="date" 
                                value={formData.due_date} 
                                onChange={(e) => setFormData({...formData, due_date: e.target.value})} 
                            />
                        </div>
                    </div>
                    {!initialCollaborator && (
                        <div>
                            <Label htmlFor="collab-emails">Invite Collaborators (by email)</Label>
                            <Input 
                                id="collab-emails" 
                                value={formData.collaborator_emails} 
                                onChange={(e) => setFormData({...formData, collaborator_emails: e.target.value})} 
                                placeholder="jane@example.com, john@example.com" 
                            />
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <ActionButton 
                        onClick={handleCreateCollaboration} 
                        disabled={isSubmitting} 
                        icon={isSubmitting ? 'loading' : 'plus'}
                    >
                        {isSubmitting ? 'Creating...' : 'Create Collaboration'}
                    </ActionButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}