import React, { useState, useEffect } from 'react';
import { Track } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import StudioInput from '../StudioInput';
import ActionButton from '../ActionButton';
import { Upload, X } from 'lucide-react';

export default function UploadTrackModal({ open, onOpenChange, track, onSuccess, user }) {
  const getInitialState = (existingTrack) => ({
    title: existingTrack?.title || '',
    genre: existingTrack?.genre || '',
    lyrics: existingTrack?.lyrics || '',
    isrc_code: existingTrack?.isrc_code || '',
    explicit_content: existingTrack?.explicit_content || false,
    audio_file_url: existingTrack?.audio_file_url || '',
    cover_art_url: existingTrack?.cover_art_url || '',
    ...existingTrack
  });

  const [isUploading, setIsUploading] = useState(false);
  const [trackData, setTrackData] = useState(getInitialState(track));
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');

  useEffect(() => {
    // When the modal opens with a track, set the initial state
    if (open) {
        const initialState = getInitialState(track);
        setTrackData(initialState);
        setAudioPreview(initialState.audio_file_url);
        setCoverPreview(initialState.cover_art_url);
        setAudioFile(null);
        setCoverFile(null);
    }
  }, [open, track]);

  const handleInputChange = (field, value) => {
    setTrackData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    if (type === 'audio') {
      setAudioFile(file);
      setAudioPreview(previewUrl);
      if (!trackData.title) {
        setTrackData(prev => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, "") }));
      }
    } else if (type === 'cover') {
      setCoverFile(file);
      setCoverPreview(previewUrl);
    }
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsUploading(true);
    try {
      let audioUrl = trackData.audio_file_url;
      let coverUrl = trackData.cover_art_url;

      if (audioFile) {
        const uploadResult = await UploadFile({ file: audioFile });
        audioUrl = uploadResult.file_url;
      }

      if (coverFile) {
        const uploadResult = await UploadFile({ file: coverFile });
        coverUrl = uploadResult.file_url;
      }
      
      const finalTrackData = {
        ...trackData,
        artist_id: user.id,
        artist_name: user.artist_name || user.full_name,
        audio_file_url: audioUrl,
        cover_art_url: coverUrl,
        status: track?.status || 'draft'
      };

      if (track?.id) {
        await Track.update(track.id, finalTrackData);
      } else {
        await Track.create(finalTrackData);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving track:', error);
      alert('Failed to save track. Please check the details and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const isValid = trackData.title && (audioPreview || trackData.audio_file_url);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{track ? 'Edit Track' : 'Upload New Track'}</DialogTitle>
          <DialogDescription>{track ? 'Update your track information.' : 'Add a new track to your music library.'}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <Label htmlFor="audio_file">Audio File *</Label>
            {audioPreview ? (
              <div className="mt-2 space-y-2">
                <audio controls src={audioPreview} className="w-full" />
                <Button variant="outline" size="sm" onClick={() => { setAudioPreview(''); setAudioFile(null); }}><X className="w-4 h-4 mr-2" />Remove</Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 mt-2 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                <Upload className="w-8 h-8 mb-2 text-slate-400" /><p className="text-sm text-slate-500">Click to upload audio</p>
                <input type="file" className="hidden" accept="audio/*" onChange={(e) => handleFileChange(e, 'audio')} />
              </label>
            )}
          </div>
          
          <div className="space-y-4">
            <Label>Track Title *</Label><StudioInput value={trackData.title} onChange={(e) => handleInputChange('title', e.target.value)} required />
            <Label>Genre</Label><StudioInput value={trackData.genre} onChange={(e) => handleInputChange('genre', e.target.value)} />
            <Label>ISRC Code</Label><StudioInput value={trackData.isrc_code} onChange={(e) => handleInputChange('isrc_code', e.target.value)} />
          </div>

          <div>
            <Label>Cover Art</Label>
            {coverPreview ? (
               <div className="flex items-center gap-4 mt-2">
                  <img src={coverPreview} alt="Cover" className="w-20 h-20 rounded-lg object-cover" />
                  <Button variant="outline" size="sm" onClick={() => { setCoverPreview(''); setCoverFile(null); }}><X className="w-4 h-4 mr-2" />Remove</Button>
               </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 mt-2 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                <Upload className="w-8 h-8 mb-2 text-slate-400" /><p className="text-sm text-slate-500">Click to upload cover</p>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />
              </label>
            )}
          </div>
          
          <Label>Lyrics</Label><Textarea value={trackData.lyrics} onChange={(e) => handleInputChange('lyrics', e.target.value)} className="h-32" />
          
          <div className="flex items-center space-x-2">
            <Checkbox checked={trackData.explicit_content} onCheckedChange={(checked) => handleInputChange('explicit_content', checked)} />
            <Label>Explicit content</Label>
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <ActionButton onClick={handleSubmit} disabled={!isValid || isUploading} icon={isUploading ? "loading" : "check"}>
            {isUploading ? 'Saving...' : track ? 'Update Track' : 'Save Track'}
          </ActionButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}