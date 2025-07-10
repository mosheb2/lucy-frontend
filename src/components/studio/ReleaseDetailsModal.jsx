
import React, { useState, useEffect } from 'react';
import { Release, Track } from '@/api/entities';
import { distributionAPI } from '@/api/functions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ActionButton from '../ActionButton';
import AnimatedIcon from '../AnimatedIcon';
import { Clock, CheckCircle, AlertTriangle, XCircle, Globe, Calendar, Music, User, Play, Pause, Download } from 'lucide-react';
import { format } from 'date-fns';

const getStatusInfo = (status) => {
  switch (status) {
    case 'draft': return { 
      color: 'bg-slate-100 text-slate-800', 
      icon: <Clock className="w-4 h-4" />, 
      message: 'This release is a draft. Complete all required information and submit it for review.' 
    };
    case 'pending_review': return { 
      color: 'bg-yellow-100 text-yellow-800', 
      icon: <AlertTriangle className="w-4 h-4" />, 
      message: 'Your release has been submitted and is awaiting review from our team.' 
    };
    case 'under_review': return { 
      color: 'bg-blue-100 text-blue-800', 
      icon: <AnimatedIcon icon="loading" size={16} trigger="spin" />, 
      message: 'Our team is currently reviewing your release. This usually takes 1-2 business days.' 
    };
    case 'approved': return { 
      color: 'bg-green-100 text-green-800', 
      icon: <CheckCircle className="w-4 h-4" />, 
      message: 'Congratulations! Your release has been approved and is ready for distribution.' 
    };
    case 'rejected': return { 
      color: 'bg-red-100 text-red-800', 
      icon: <XCircle className="w-4 h-4" />, 
      message: 'Your release was not approved. Please check the admin notes for details and make the necessary changes.' 
    };
    case 'processing': return { 
      color: 'bg-purple-100 text-purple-800', 
      icon: <AnimatedIcon icon="loading" size={16} trigger="spin" />, 
      message: 'Your release is being processed and delivered to streaming platforms. This can take a few days.'
    };
    case 'live': return { 
      color: 'bg-emerald-100 text-emerald-800', 
      icon: <Globe className="w-4 h-4" />, 
      message: 'Your release is live and available on streaming platforms!' 
    };
    default: return { 
      color: 'bg-slate-100 text-slate-800', 
      icon: <Clock className="w-4 h-4" />, 
      message: 'Unknown status' 
    };
  }
};

const TrackPlayer = ({ track, index }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState(null);

  const togglePlay = () => {
    if (!audioRef) return;
    
    if (isPlaying) {
      audioRef.pause();
      setIsPlaying(false);
    } else {
      audioRef.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  return (
    <div className="flex items-center gap-4 p-3 border rounded-lg bg-white">
      <span className="text-sm font-mono text-slate-500 w-6">{index + 1}.</span>
      <img 
        src={track.cover_art_url} 
        alt={track.title}
        className="w-12 h-12 rounded object-cover"
      />
      <div className="flex-1">
        <p className="font-medium text-slate-900">{track.title}</p>
        <p className="text-sm text-slate-500">
          {track.duration_seconds ? `${Math.floor(track.duration_seconds / 60)}:${(track.duration_seconds % 60).toString().padStart(2, '0')}` : 'Duration unknown'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {track.explicit_content && (
          <Badge variant="outline" className="text-xs">Explicit</Badge>
        )}
        {track.audio_file_url && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="h-8 w-8"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <audio
              ref={setAudioRef}
              src={track.audio_file_url}
              onEnded={handleAudioEnd}
              preload="metadata"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default function ReleaseDetailsModal({ open, onOpenChange, release, onSuccess, user }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [distributionStatus, setDistributionStatus] = useState(null);
  const [releaseTracks, setReleaseTracks] = useState([]);

  useEffect(() => {
    if (open && release) {
      loadReleaseTracks();
      if (release.status === 'live') {
        checkDistributionStatus();
      }
    }
  }, [open, release]);

  const loadReleaseTracks = async () => {
    if (release?.track_ids?.length) {
      try {
        const tracks = await Promise.all(
          release.track_ids.map(id => Track.get(id))
        );
        setReleaseTracks(tracks.filter(Boolean));
      } catch (error) {
        console.error('Error loading tracks:', error);
      }
    }
  };

  const checkDistributionStatus = async () => {
    try {
      const response = await distributionAPI({ action: 'check_status', releaseId: release.id });
      if (response.data.success) {
        setDistributionStatus(response.data);
      }
    } catch (error) {
      console.error('Error checking distribution status:', error);
    }
  };

  const handleSubmitForReview = async () => {
    setIsSubmitting(true);
    try {
      await Release.update(release.id, {
        status: 'pending_review',
        submission_notes: 'Submitted for review by artist.',
        submitted_date: new Date().toISOString()
      });
      onSuccess();
    } catch (error) {
      console.error('Error submitting release for review:', error);
      alert('Failed to submit release. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDistribute = async () => {
    setIsSubmitting(true);
    try {
      const response = await distributionAPI({
        action: 'submit_release',
        releaseId: release.id,
        serviceName: 'auto',
      });
      
      if (response.data.success) {
        await Release.update(release.id, {
          status: 'processing',
          submission_notes: `Distribution started. Est. live date: ${new Date(response.data.estimated_live_date).toLocaleDateString()}`
        });
        onSuccess();
      } else {
        throw new Error(response.data.error || 'Distribution API failed');
      }
    } catch (error) {
      console.error('Error starting distribution:', error);
      alert(`Distribution failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!release) return null;

  const statusInfo = getStatusInfo(release.status);
  const canSubmit = (release.status === 'draft' || release.status === 'rejected') && releaseTracks.length > 0;
  const canDistribute = release.status === 'approved';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src={release.cover_art_url || 'https://via.placeholder.com/100'} alt="Cover" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
              <div>
                <DialogTitle className="text-2xl">{release.title}</DialogTitle>
                <p className="text-slate-600 capitalize">{release.release_type} • {release.artist_name}</p>
              </div>
            </div>
            <Badge className={`${statusInfo.color} self-start sm:self-center`}>
              {statusInfo.icon}
              <span className="ml-1 capitalize">{release.status?.replace('_', ' ')}</span>
            </Badge>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-6 p-4 bg-slate-50 rounded-lg">
            <p className="text-slate-700">{statusInfo.message}</p>
            {release.admin_notes && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  <span className="font-semibold">Admin Feedback:</span> {release.admin_notes}
                </p>
              </div>
            )}
          </div>

          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="tracks">Tracks ({releaseTracks.length})</TabsTrigger>
              <TabsTrigger value="rights">Rights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Release Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Type:</strong> <span className="capitalize">{release.release_type}</span></p>
                    <p><strong>Release Date:</strong> {release.release_date ? format(new Date(release.release_date), 'PPP') : 'Not set'}</p>
                    <p><strong>Genre:</strong> {release.genre || 'Not specified'}</p>
                    <p><strong>Label:</strong> {release.label_name || 'Independent'}</p>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    Content Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Tracks:</strong> {releaseTracks.length}</p>
                    <p><strong>Explicit Content:</strong> {release.explicit_content ? 'Yes' : 'No'}</p>
                    <p><strong>Previously Released:</strong> {release.previously_released ? 'Yes' : 'No'}</p>
                    <p><strong>Language:</strong> {release.language || 'English'}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="tracks" className="mt-6">
              <div className="space-y-3">
                {releaseTracks.length > 0 ? (
                  releaseTracks.map((track, index) => (
                    <TrackPlayer key={track.id} track={track} index={index} />
                  ))
                ) : (
                  <div className="text-center py-8 bg-slate-50 rounded-lg">
                    <Music className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                    <p className="text-slate-600">No tracks added yet</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="rights" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold text-slate-700 mb-3">Copyright Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>© Holder:</strong> {release.phonographic_copyright || 'Not specified'}</p>
                    <p><strong>℗ Holder:</strong> {release.copyright_holder || 'Not specified'}</p>
                    <p><strong>Recording Year:</strong> {release.recording_year || 'Not specified'}</p>
                    <p><strong>PRO Affiliation:</strong> {release.pro_affiliation || 'None'}</p>
                    {release.pro_affiliation !== 'None' && <p><strong>IPI/CAE Number:</strong> {release.ipi_cae_number || 'Not provided'}</p>}
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold text-slate-700 mb-3">Production Credits</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Producer:</strong> {release.producer || 'Not specified'}</p>
                    <p><strong>UPC/EAN:</strong> {release.upc_ean_code || 'Will be auto-generated'}</p>
                  </div>
                </div>
              </div>
              
              {release.royalty_splits && release.royalty_splits.length > 0 && (
                <div className="mt-4 bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold text-slate-700 mb-3">Royalty Splits</h4>
                  <div className="space-y-2">
                    {release.royalty_splits.map((split, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span>{split.name} ({split.role})</span>
                        <span className="font-medium">{split.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">Close</Button>
          <div className="flex gap-2 w-full sm:w-auto">
            {canSubmit && (
              <ActionButton onClick={handleSubmitForReview} disabled={isSubmitting} icon={isSubmitting ? "loading" : "send"} className="w-full">
                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
              </ActionButton>
            )}
            {canDistribute && (
              <ActionButton onClick={handleDistribute} disabled={isSubmitting} icon={isSubmitting ? "loading" : "globe"} className="w-full">
                {isSubmitting ? 'Processing...' : 'Start Distribution'}
              </ActionButton>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
