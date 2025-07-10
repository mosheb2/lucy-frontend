import React, { useState, useEffect } from 'react';
import { Mentor } from '@/api/entities';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import ActionButton from '../ActionButton';
import { Loader2 } from 'lucide-react';

export default function MentorSelectionModal({ open, onOpenChange, onMentorSelect }) {
    const [mentors, setMentors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (open) {
            setIsLoading(true);
            Mentor.list().then(data => {
                setMentors(data.filter(m => m.is_active));
                setIsLoading(false);
            }).catch(err => {
                console.error("Failed to load mentors:", err);
                setIsLoading(false);
            });
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Choose Your Mentor</DialogTitle>
                    <DialogDescription>
                        Select an industry expert for a one-on-one consultation session.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto">
                    {isLoading ? (
                         <div className="flex justify-center items-center h-48"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>
                    ) : (
                        mentors.map(mentor => (
                            <div key={mentor.id} className="p-4 border rounded-lg flex flex-col sm:flex-row items-start gap-4">
                                <Avatar className="w-20 h-20">
                                    <AvatarImage src={mentor.profile_image_url} />
                                    <AvatarFallback>{mentor.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h4 className="font-bold text-lg">{mentor.name}</h4>
                                    <p className="text-sm font-medium text-purple-600">{mentor.title}</p>
                                    <div className="flex flex-wrap gap-2 my-2">
                                        {(mentor.specialties || []).map(spec => <Badge key={spec} variant="secondary">{spec}</Badge>)}
                                    </div>
                                    <p className="text-sm text-slate-600">{mentor.bio}</p>
                                </div>
                                <ActionButton 
                                    onClick={() => onMentorSelect(mentor)}
                                    size="sm" 
                                    className="mt-2 sm:mt-0 w-full sm:w-auto"
                                >
                                    Book Session
                                </ActionButton>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}