import React, { useState } from 'react';
import { SupportRequest } from '@/api/entities';
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import ActionButton from '../ActionButton';

export default function ExpertConsultationModal({ open, onOpenChange, user, mentor }) {
    const [isRequesting, setIsRequesting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [supportData, setSupportData] = useState({
        phone: '',
        preferred_time: 'afternoon',
        message: '',
    });

    const handleRequestSupport = async (e) => {
        e.preventDefault();
        if (!supportData.phone || !supportData.message) {
            setSubmitStatus('error');
            return;
        }
        
        setIsRequesting(true);
        setSubmitStatus(null);
        try {
            await SupportRequest.create({
                user_id: user.id,
                type: 'expert_consultation',
                name: user.full_name,
                email: user.email,
                mentor_id: mentor?.id,
                mentor_name: mentor?.name,
                ...supportData
            });
            
            setSubmitStatus('success');
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (error) {
            console.error('Error requesting support:', error);
            setSubmitStatus('error');
        } finally {
            setIsRequesting(false);
        }
    };
    
    const handleClose = () => {
        setSupportData({ phone: '', preferred_time: 'afternoon', message: '' });
        setSubmitStatus(null);
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Book a call with {mentor?.name || 'an Expert'}</DialogTitle>
                    <DialogDescription>
                        Get expert help for $49.99. We'll call you within 24 hours to schedule.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRequestSupport} className="pt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input
                                id="phone"
                                placeholder="Your phone number" 
                                value={supportData.phone}
                                onChange={e => setSupportData({...supportData, phone: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="time">Preferred Call Time</Label>
                            <Select value={supportData.preferred_time} onValueChange={value => setSupportData({...supportData, preferred_time: value})}>
                                <SelectTrigger id="time">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="morning">Morning (9AM-12PM)</SelectItem>
                                    <SelectItem value="afternoon">Afternoon (12PM-5PM)</SelectItem>
                                    <SelectItem value="evening">Evening (5PM-8PM)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="message">What do you need help with? *</Label>
                        <Textarea 
                            id="message"
                            placeholder="PRO registration, copyright questions, etc."
                            value={supportData.message}
                            onChange={e => setSupportData({...supportData, message: e.target.value})}
                            className="h-24"
                            required
                        />
                    </div>
                    
                    {submitStatus === 'success' && (
                        <div className="p-3 bg-green-50 text-green-700 rounded-lg text-center">
                            Request sent! We'll be in touch soon.
                        </div>
                    )}
                    {submitStatus === 'error' && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-center">
                            Please fill out all required fields.
                        </div>
                    )}

                    <div className="text-right pt-2">
                        <ActionButton 
                            type="submit"
                            disabled={isRequesting}
                            icon={isRequesting ? 'loading' : 'phone'}
                        >
                            {isRequesting ? 'Scheduling...' : 'Schedule Expert Call ($49.99)'}
                        </ActionButton>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}