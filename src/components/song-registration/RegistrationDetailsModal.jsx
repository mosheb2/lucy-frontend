import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function RegistrationDetailsModal({ registration, open, onOpenChange }) {
    if (!registration) return null;

    const statusColors = {
        submitted: 'bg-yellow-100 text-yellow-800',
        in_review: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        requires_action: 'bg-red-100 text-red-800',
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{registration.title}</DialogTitle>
                    <DialogDescription>
                        Submitted on {format(new Date(registration.submission_date), 'MMMM d, yyyy')}
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                    <div className="flex items-center gap-4">
                        <span className="font-semibold">Status:</span>
                        <Badge className={statusColors[registration.status]}>
                            {registration.status.replace('_', ' ')}
                        </Badge>
                    </div>
                    
                    <div className="p-4 bg-slate-50 rounded-lg">
                        <h4 className="font-semibold mb-2">Song Details</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <p><span className="text-slate-500">Genre:</span> {registration.genre}</p>
                            <p><span className="text-slate-500">Created:</span> {format(new Date(registration.creation_date), 'MMM d, yyyy')}</p>
                            <p><span className="text-slate-500">Style:</span> {registration.performance_style}</p>
                        </div>
                         {registration.description && (
                            <p className="mt-2 text-sm"><span className="text-slate-500">Description:</span> {registration.description}</p>
                         )}
                    </div>
                    
                     <div className="p-4 bg-slate-50 rounded-lg">
                        <h4 className="font-semibold mb-2">Author & Publisher</h4>
                        <p className="text-sm"><span className="text-slate-500">Authors/Composers:</span> {registration.author_info}</p>
                        <p className="text-sm mt-1"><span className="text-slate-500">Publisher:</span> {registration.publisher_info || 'N/A'}</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg">
                        <h4 className="font-semibold mb-2">Requested Services</h4>
                        <div className="flex gap-4">
                            <p className="text-sm">Copyright Registration: <span className={`font-bold ${registration.needs_copyright_registration ? 'text-green-600' : 'text-slate-500'}`}>{registration.needs_copyright_registration ? 'Yes' : 'No'}</span></p>
                            <p className="text-sm">PRO Registration: <span className={`font-bold ${registration.needs_pro_registration ? 'text-green-600' : 'text-slate-500'}`}>{registration.needs_pro_registration ? 'Yes' : 'No'}</span></p>
                        </div>
                    </div>

                    {registration.notes && (
                         <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h4 className="font-semibold text-yellow-800 mb-2">Notes from Staff</h4>
                            <p className="text-sm text-yellow-700">{registration.notes}</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}