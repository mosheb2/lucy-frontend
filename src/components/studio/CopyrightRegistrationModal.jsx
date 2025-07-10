
import React, { useState } from 'react';
import { publishingServices } from '@/api/functions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import ActionButton from '../ActionButton';

export default function CopyrightRegistrationModal({ open, onOpenChange, onSuccess }) {
    const [formData, setFormData] = useState({
        title: '',
        creation_date: '',
        author_info: '',
        publisher_info: '',
        needs_copyright_registration: true,
        needs_pro_registration: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);
        try {
            await publishingServices({
                action: 'submit_copyright',
                songData: formData
            });
            setSubmitStatus('success');
            onSuccess(); // Refresh data on the parent page
            setTimeout(() => {
                handleClose();
            }, 2000); // Close modal after 2s on success
        } catch (error) {
            console.error('Failed to submit registration:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleClose = () => {
        setFormData({ title: '', creation_date: '', author_info: '', publisher_info: '', needs_copyright_registration: true, needs_pro_registration: true });
        setSubmitStatus(null);
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Register a New Song</DialogTitle>
                    <DialogDescription>
                        Register your song with PROs and copyright offices.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="title">Song Title *</Label>
                            <Input id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                        </div>
                        <div>
                            <Label htmlFor="creation_date">Date of Creation *</Label>
                            <Input id="creation_date" type="date" value={formData.creation_date} onChange={e => setFormData({...formData, creation_date: e.target.value})} required />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="author_info">Authors / Composers (including splits) *</Label>
                        <Textarea id="author_info" placeholder="e.g., Jane Doe (50%), John Smith (50%)" value={formData.author_info} onChange={e => setFormData({...formData, author_info: e.target.value})} required />
                    </div>
                    <div>
                        <Label htmlFor="publisher_info">Publisher Information (if any)</Label>
                        <Textarea id="publisher_info" placeholder="Enter publisher details" value={formData.publisher_info} onChange={e => setFormData({...formData, publisher_info: e.target.value})} />
                    </div>
                    <div>
                        <h3 className="font-medium mb-2">Registration Services</h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 p-3 border rounded-lg">
                                <Checkbox id="copyright" checked={formData.needs_copyright_registration} onCheckedChange={checked => setFormData({...formData, needs_copyright_registration: checked})} />
                                <Label htmlFor="copyright" className="flex-1 cursor-pointer">Copyright Registration (U.S. Copyright Office)</Label>
                            </div>
                            <div className="flex items-center gap-3 p-3 border rounded-lg">
                                <Checkbox id="pro" checked={formData.needs_pro_registration} onCheckedChange={checked => setFormData({...formData, needs_pro_registration: checked})} />
                                <Label htmlFor="pro" className="flex-1 cursor-pointer">PRO Registration (ASCAP, BMI, etc.) & SoundExchange</Label>
                            </div>
                        </div>
                    </div>
                    {submitStatus === 'success' && (
                        <div className="p-3 bg-green-50 text-green-700 rounded-lg text-center">
                            Registration submitted successfully! You can track its status under the "Submissions" tab.
                        </div>
                    )}
                    {submitStatus === 'error' && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-center">
                            There was an error submitting your registration. Please try again.
                        </div>
                    )}
                    <div className="text-right pt-2">
                        <ActionButton type="submit" icon={isSubmitting ? 'loading' : 'send'} disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit for Registration'}
                        </ActionButton>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
