import React, { useState, useEffect, useCallback } from 'react';
import { Web3Drop, User } from '@/api/entities';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import StudioPanel from '../StudioPanel';
import ActionButton from '../ActionButton';
import AnimatedIcon from '../AnimatedIcon';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import CreateDropModal from './CreateDropModal';

const DropCard = ({ drop, onEdit }) => (
    <StudioPanel className="p-4 flex flex-col h-full">
        <div className="relative aspect-video rounded-lg overflow-hidden mb-4 bg-slate-100">
             <img src={drop.cover_image_url || 'https://images.unsplash.com/photo-1642104793574-8547a08f5429?auto=format&fit=crop&w=400&q=80'} alt={drop.title} className="w-full h-full object-cover" />
             <Badge className="absolute top-2 right-2 capitalize">{drop.status}</Badge>
        </div>
        <div className="flex-grow">
            <h3 className="font-bold text-lg text-slate-900">{drop.title}</h3>
            <p className="text-sm text-slate-500 mb-2">{drop.item_name}</p>
            <p className="text-xs text-slate-600 mb-4">{drop.description}</p>
        </div>
        <div className="mt-auto">
            <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-slate-600">Claimed</span>
                <span className="font-medium text-slate-800">{drop.claimed_count} / {drop.total_supply}</span>
            </div>
            <Progress value={(drop.claimed_count / drop.total_supply) * 100} className="w-full h-2" />
            <div className="flex justify-between items-center mt-4">
                <p className="text-sm font-bold text-purple-700">${(drop.price || 0).toFixed(2)}</p>
                <ActionButton variant="secondary" size="sm" onClick={() => onEdit(drop)}>Manage</ActionButton>
            </div>
        </div>
    </StudioPanel>
);

export default function Web3StudioModal({ open, onOpenChange, user }) {
    const [drops, setDrops] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [editingDrop, setEditingDrop] = useState(null);

    const loadData = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const artistDrops = await Web3Drop.filter({ artist_id: user.id }, '-created_date');
            setDrops(artistDrops);
        } catch (error) {
            console.error("Error loading Web3 drops:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (open) {
            loadData();
        }
    }, [open, loadData]);

    const handleCreateNew = () => {
        setEditingDrop(null);
        setCreateModalOpen(true);
    };

    const handleEditDrop = (drop) => {
        setEditingDrop(drop);
        setCreateModalOpen(true);
    };

    const handleSuccess = () => {
        setCreateModalOpen(false);
        setEditingDrop(null);
        loadData();
    };
    
    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Web3 Studio</DialogTitle>
                        <DialogDescription>Create and manage digital collectibles for your fans.</DialogDescription>
                    </DialogHeader>
                    <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-8">
                        <div className="flex justify-end">
                            <ActionButton onClick={handleCreateNew} icon="plus">New Drop</ActionButton>
                        </div>
                        {drops.length === 0 && !isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <AnimatedIcon icon="star" size={64} className="mx-auto text-slate-300 mb-4" />
                                <h2 className="text-xl font-semibold text-slate-800">Your First Digital Drop</h2>
                                <p className="text-slate-500 mb-6 max-w-lg mx-auto">Engage your community by creating limited-edition digital items.</p>
                                <ActionButton onClick={handleCreateNew} icon="plus">Create First Drop</ActionButton>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {drops.map(drop => (
                                    <DropCard key={drop.id} drop={drop} onEdit={handleEditDrop} />
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
            <CreateDropModal
                open={isCreateModalOpen}
                onOpenChange={setCreateModalOpen}
                onSuccess={handleSuccess}
                user={user}
                editingDrop={editingDrop}
            />
        </>
    );
}