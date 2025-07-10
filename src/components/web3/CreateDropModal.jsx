import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ActionButton from '../ActionButton';
import StudioInput from '../StudioInput';
import { Web3Drop } from '@/api/entities';
import { UploadFile } from '@/api/integrations';

export default function CreateDropModal({ open, onOpenChange, onSuccess, user, editingDrop }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        cover_image_url: '',
        item_name: '',
        item_media_url: '',
        total_supply: 100,
        price: 0,
        drop_date: '',
        status: 'draft',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
        if (editingDrop) {
            setFormData({
                ...editingDrop,
                drop_date: editingDrop.drop_date ? new Date(editingDrop.drop_date).toISOString().substring(0, 16) : ''
            });
        } else {
            setFormData({
                title: '', description: '', cover_image_url: '', item_name: '', item_media_url: '',
                total_supply: 100, price: 0, drop_date: '', status: 'draft',
            });
        }
    }, [editingDrop, open]);

    const handleFileChange = async (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsSubmitting(true);
        try {
            const { file_url } = await UploadFile({ file });
            setFormData(prev => ({ ...prev, [fieldName]: file_url }));
        } catch (error) {
            console.error("File upload failed:", error);
            alert("File upload failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleSubmit = async () => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            const dataToSave = { ...formData, artist_id: user.id };
            if (editingDrop) {
                await Web3Drop.update(editingDrop.id, dataToSave);
            } else {
                await Web3Drop.create(dataToSave);
            }
            onSuccess();
        } catch (error) {
            console.error("Failed to save drop:", error);
            alert("Failed to save drop. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{editingDrop ? 'Edit Drop' : 'Create a New Drop'}</DialogTitle>
                    <DialogDescription>Fill in the details for your digital collectible.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                    <StudioInput label="Drop Title" id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                    <StudioInput label="Item Name" id="item_name" value={formData.item_name} onChange={e => setFormData({...formData, item_name: e.target.value})} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <StudioInput label="Total Supply" id="total_supply" type="number" value={formData.total_supply} onChange={e => setFormData({...formData, total_supply: Number(e.target.value)})} />
                       <StudioInput label="Price (USD)" id="price" type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                    </div>

                    <StudioInput label="Drop Date" id="drop_date" type="datetime-local" value={formData.drop_date} onChange={e => setFormData({...formData, drop_date: e.target.value})} />
                    
                    <div>
                        <Label>Cover Image</Label>
                        <Input type="file" accept="image/*" onChange={e => handleFileChange(e, 'cover_image_url')} />
                        {formData.cover_image_url && <img src={formData.cover_image_url} alt="Cover preview" className="mt-2 h-24 rounded-lg" />}
                    </div>
                    <div>
                        <Label>Item Media</Label>
                        <Input type="file" onChange={e => handleFileChange(e, 'item_media_url')} />
                        {formData.item_media_url && <p className="text-xs text-slate-500 mt-1">Uploaded: {formData.item_media_url.split('/').pop()}</p>}
                    </div>
                </div>
                <DialogFooter>
                    <ActionButton onClick={handleSubmit} disabled={isSubmitting} icon={isSubmitting ? 'loading' : 'save'}>
                        {isSubmitting ? 'Saving...' : 'Save Drop'}
                    </ActionButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}