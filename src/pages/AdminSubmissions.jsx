
import React, { useState, useEffect, useCallback } from 'react';
import { Release, User, Track } from '@/api/entities';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/api/admin';
import StudioPanel from '../components/StudioPanel';
import { Loader2, Save, Download, Play, Pause, FileDown, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import ActionButton from '../components/ActionButton';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const TrackPreview = ({ track, index }) => {
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

  const handleDownload = () => {
    if (track.audio_file_url) {
      const link = document.createElement('a');
      link.href = track.audio_file_url;
      link.download = `${track.title}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
      <span className="text-sm font-mono text-slate-500 w-6">{index + 1}.</span>
      <img 
        src={track.cover_art_url} 
        alt={track.title}
        className="w-10 h-10 rounded object-cover"
      />
      <div className="flex-1">
        <p className="font-medium text-slate-900 text-sm">{track.title}</p>
        <p className="text-xs text-slate-500">
          {track.duration_seconds ? `${Math.floor(track.duration_seconds / 60)}:${(track.duration_seconds % 60).toString().padStart(2, '0')}` : 'Duration unknown'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {track.explicit_content && (
          <Badge variant="outline" className="text-xs">E</Badge>
        )}
        {track.audio_file_url && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="h-8 w-8"
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="h-8 w-8"
              title="Download track"
            >
              <Download className="w-3 h-3" />
            </Button>
            <audio
              ref={setAudioRef}
              src={track.audio_file_url}
              onEnded={() => setIsPlaying(false)}
              preload="metadata"
            />
          </>
        )}
      </div>
    </div>
  );
};

const ReleaseReviewCard = ({ release, tracks, onUpdate }) => {
    const [status, setStatus] = useState(release.status);
    const [adminNotes, setAdminNotes] = useState(release.admin_notes || '');
    const [isSaving, setIsSaving] = useState(false);
    const [showTracks, setShowTracks] = useState(false);

    const releaseTracks = tracks.filter(track => 
      release.track_ids?.includes(track.id)
    );

    const handleSave = async () => {
        setIsSaving(true);
        await onUpdate(release.id, { status, admin_notes: adminNotes });
        setIsSaving(false);
    };

    const handleExportRelease = () => {
      const releaseTracks = tracks.filter(track => 
        release.track_ids?.includes(track.id)
      );

      // Create CSV data for Excel compatibility
      const releaseData = [
        ['RELEASE INFORMATION', ''],
        ['Release ID', release.id],
        ['Title', release.title],
        ['Artist Name', release.artist_name],
        ['Release Type', release.release_type],
        ['Release Date', release.release_date],
        ['Genre', release.genre],
        ['Status', release.status],
        ['Label Name', release.label_name || 'Independent'],
        ['UPC/EAN Code', release.upc_ean_code || 'Not provided'],
        ['Copyright Holder (©)', release.copyright_holder],
        ['Phonographic Copyright (℗)', release.phonographic_copyright],
        ['Recording Location', release.recording_location || 'Not specified'],
        ['Producer', release.producer || 'Not specified'],
        ['Recording Year', release.recording_year],
        ['Explicit Content', release.explicit_content ? 'Yes' : 'No'],
        ['Previously Released', release.previously_released ? 'Yes' : 'No'],
        ['Submission Notes', release.submission_notes || 'None'],
        ['Admin Notes', release.admin_notes || 'None'],
        ['Created Date', format(new Date(release.created_date), 'PPP')],
        ['Updated Date', format(new Date(release.updated_date), 'PPP')],
        ['', ''],
        ['TRACKS', ''],
        ['Track #', 'Title', 'Duration', 'Genre', 'Explicit', 'ISRC', 'Has Audio File', 'Has Lyrics']
      ];

      // Add track data
      releaseTracks.forEach((track, index) => {
        const duration = track.duration_seconds 
          ? `${Math.floor(track.duration_seconds / 60)}:${(track.duration_seconds % 60).toString().padStart(2, '0')}`
          : 'Unknown';
        
        releaseData.push([
          index + 1,
          track.title,
          duration,
          track.genre || 'Not specified',
          track.explicit_content ? 'Yes' : 'No',
          track.isrc_code || 'Not provided',
          track.audio_file_url ? 'Yes' : 'No',
          track.lyrics ? 'Yes' : 'No'
        ]);
      });

      // Convert to CSV format
      const csvContent = releaseData.map(row => 
        row.map(cell => {
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          const cellStr = String(cell || '');
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',')
      ).join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `release_${release.title.replace(/[^a-zA-Z0-9]/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };
    
    const statusClasses = {
        pending_review: "bg-yellow-100 text-yellow-800",
        under_review: "bg-blue-100 text-blue-800",
        approved: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
    };
    
    const statusOptions = ['pending_review', 'under_review', 'approved', 'rejected'];

    return (
        <StudioPanel className="p-6 space-y-4">
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                <div className="flex items-center gap-4">
                    <img src={release.cover_art_url} alt={release.title} className="w-20 h-20 rounded-lg object-cover" />
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">{release.title}</h3>
                        <p className="text-sm text-slate-600">
                            By <span className="font-medium">{release.artist_name || 'N/A'}</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            Submitted on {format(new Date(release.updated_date), 'PPP')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-sm capitalize font-medium ${statusClasses[release.status]}`}>
                      {release.status.replace('_', ' ')}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportRelease}
                    className="gap-2"
                  >
                    <FileDown className="w-4 h-4" />
                    Export
                  </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Release Info</h4>
                  <p><strong>Type:</strong> <span className="capitalize">{release.release_type}</span></p>
                  <p><strong>Release Date:</strong> {format(new Date(release.release_date), 'PPP')}</p>
                  <p><strong>Genre:</strong> {release.genre}</p>
                  <p><strong>Label:</strong> {release.label_name || 'Independent'}</p>
                  <p><strong>UPC:</strong> {release.upc_ean_code || 'Not provided'}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Copyright Info</h4>
                    <p><strong>© Holder:</strong> {release.phonographic_copyright}</p>
                    <p><strong>℗ Holder:</strong> {release.copyright_holder}</p>
                    <p><strong>Year:</strong> {release.recording_year}</p>
                    <p><strong>Producer:</strong> {release.producer || 'Not specified'}</p>
                </div>
            </div>

            {releaseTracks.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-slate-700">Tracks ({releaseTracks.length})</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTracks(!showTracks)}
                  >
                    {showTracks ? 'Hide' : 'Show'} Tracks
                  </Button>
                </div>
                {showTracks && (
                  <div className="space-y-2">
                    {releaseTracks.map((track, index) => (
                      <TrackPreview key={track.id} track={track} index={index} />
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
                <label className="font-semibold text-slate-700">Update Status</label>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {statusOptions.map(opt => (
                            <SelectItem key={opt} value={opt} className="capitalize">
                                {opt.replace('_', ' ')}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            <div>
                <label className="font-semibold text-slate-700">Admin Notes</label>
                <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add feedback for the artist..."
                    className="mt-2"
                />
            </div>
            
            <div className="flex justify-end">
                <ActionButton 
                    onClick={handleSave} 
                    disabled={isSaving}
                    icon={isSaving ? "loading" : "save"}
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </ActionButton>
            </div>
        </StudioPanel>
    );
};

export default function AdminSubmissions() {
    const [releases, setReleases] = useState([]);
    const [tracks, setTracks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [allReleases, allTracks] = await Promise.all([
                Release.filter({ status: ['pending_review', 'under_review'] }, '-updated_date'),
                Track.list()
            ]);
            setReleases(allReleases);
            setTracks(allTracks);
        } catch (error) {
            console.error('Error loading submissions:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleUpdateRelease = async (releaseId, updates) => {
        try {
            await Release.update(releaseId, updates);
            loadData(); // Refresh data
        } catch (error) {
            console.error('Error updating release:', error);
            alert('Failed to update release');
        }
    };

    const handleExportAllSubmissions = () => {
      if (releases.length === 0) return;

      const allData = [
        ['LUCY MUSIC PLATFORM - ADMIN SUBMISSIONS EXPORT', '', '', '', '', '', '', ''],
        ['Export Date', format(new Date(), 'PPP')],
        ['Total Submissions', releases.length],
        ['', '', '', '', '', '', '', ''],
        ['Release ID', 'Title', 'Artist', 'Type', 'Status', 'Submission Date', 'Track Count', 'Genre']
      ];

      releases.forEach(release => {
        const releaseTracks = tracks.filter(track => 
          release.track_ids?.includes(track.id)
        );

        allData.push([
          release.id,
          release.title,
          release.artist_name,
          release.release_type,
          release.status,
          format(new Date(release.updated_date), 'PPP'),
          releaseTracks.length,
          release.genre || 'Not specified'
        ]);
      });

      // Convert to CSV
      const csvContent = allData.map(row => 
        row.map(cell => {
          const cellStr = String(cell || '');
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',')
      ).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `all_submissions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Manage Submissions</h1>
                    <p className="text-slate-600 mt-2">Review and approve artist releases</p>
                </div>
                {releases.length > 0 && (
                    <ActionButton 
                        onClick={handleExportAllSubmissions}
                        variant="secondary"
                        icon="download"
                        className="w-full sm:w-auto"
                    >
                        Export All to Excel
                    </ActionButton>
                )}
            </div>

            {releases.length === 0 ? (
                <StudioPanel className="text-center py-12">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No Pending Submissions</h3>
                    <p className="text-slate-600">All submissions have been reviewed</p>
                </StudioPanel>
            ) : (
                <div className="space-y-6">
                    {releases.map(release => (
                        <ReleaseReviewCard 
                            key={release.id} 
                            release={release} 
                            tracks={tracks}
                            onUpdate={handleUpdateRelease} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
