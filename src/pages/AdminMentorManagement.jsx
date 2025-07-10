import React, { useState, useEffect } from 'react';
import { Mentor } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import StudioPanel from '../components/StudioPanel';
import ActionButton from '../components/ActionButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const MentorFormModal = ({ open, onOpenChange, onSuccess, editingMentor }) => {
    const [formData, setFormData] = useState({ name: '', title: '', bio: '', profile_image_url: '', specialties: '' });
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        if (editingMentor) {
            setFormData({ ...editingMentor, specialties: (editingMentor.specialties || []).join(', ') });
        } else {
            setFormData({ name: '', title: '', bio: '', profile_image_url: '', specialties: '' });
        }
    }, [editingMentor, open]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsSaving(true);
        try {
            const { file_url } = await UploadFile({ file });
            setFormData(prev => ({ ...prev, profile_image_url: file_url }));
        } catch (error) {
            console.error("Image upload failed:", error);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            const dataToSave = { ...formData, specialties: formData.specialties.split(',').map(s => s.trim()).filter(Boolean) };
            if (editingMentor) {
                await Mentor.update(editingMentor.id, dataToSave);
            } else {
                await Mentor.create(dataToSave);
            }
            onSuccess();
        } catch (error) {
            console.error("Failed to save mentor:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingMentor ? 'Edit Mentor' : 'Add New Mentor'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Input placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <Input placeholder="Title (e.g., A&R Expert)" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    <Textarea placeholder="Bio" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
                    <Input placeholder="Specialties (comma-separated)" value={formData.specialties} onChange={e => setFormData({...formData, specialties: e.target.value})} />
                    <div>
                        <Label>Profile Image</Label>
                        <Input type="file" accept="image/*" onChange={handleFileChange} />
                        {formData.profile_image_url && <Avatar className="mt-2"><AvatarImage src={formData.profile_image_url} /></Avatar>}
                    </div>
                </div>
                <DialogFooter>
                    <ActionButton onClick={handleSubmit} disabled={isSaving} icon={isSaving ? 'loading' : 'save'}>{isSaving ? 'Saving...' : 'Save Mentor'}</ActionButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default function AdminMentorManagement() {
    const [mentors, setMentors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMentor, setEditingMentor] = useState(null);

    const loadMentors = async () => {
        setIsLoading(true);
        try {
            const data = await Mentor.list();
            setMentors(data);
        } catch (error) {
            console.error("Failed to load mentors", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadMentors();
    }, []);

    const handleEdit = (mentor) => {
        setEditingMentor(mentor);
        setIsModalOpen(true);
    };
    
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this mentor?")) {
            await Mentor.delete(id);
            loadMentors();
        }
    };

    const handleSuccess = () => {
        setIsModalOpen(false);
        setEditingMentor(null);
        loadMentors();
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Manage Mentors</h1>
                <ActionButton onClick={() => { setEditingMentor(null); setIsModalOpen(true); }} icon="plus">Add Mentor</ActionButton>
            </div>
            <StudioPanel>
                <div className="divide-y divide-slate-100">
                    {mentors.map(mentor => (
                        <div key={mentor.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={mentor.profile_image_url} />
                                    <AvatarFallback>{mentor.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-slate-800">{mentor.name}</p>
                                    <p className="text-sm text-slate-500">{mentor.title}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(mentor)}><Edit className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(mentor.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                            </div>
                        </div>
                    ))}
                </div>
            </StudioPanel>
            <MentorFormModal 
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSuccess={handleSuccess}
                editingMentor={editingMentor}
            />
        </div>
    );
}