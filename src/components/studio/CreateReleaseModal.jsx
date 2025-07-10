
import React, { useState, useEffect } from 'react';
import { Release, Track } from '@/api/entities';
import { UploadFile, ExtractDataFromUploadedFile } from '@/api/integrations';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import StudioInput from '../StudioInput';
import ActionButton from '../ActionButton';
import { Upload, X, Plus, Music, Trash2, ExternalLink } from 'lucide-react';

export default function CreateReleaseModal({ open, onOpenChange, onSuccess, user, editingRelease }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const getInitialState = () => ({
    title: editingRelease?.title || '',
    release_type: editingRelease?.release_type || 'single',
    release_date: editingRelease?.release_date || '',
    genre: editingRelease?.genre || '',
    cover_art_url: editingRelease?.cover_art_url || '',
    label_name: editingRelease?.label_name || user?.artist_name || '',
    copyright_holder: editingRelease?.copyright_holder || user?.artist_name || '',
    phonographic_copyright: editingRelease?.phonographic_copyright || user?.artist_name || '',
    recording_location: editingRelease?.recording_location || '',
    producer: editingRelease?.producer || '',
    recording_year: editingRelease?.recording_year || new Date().getFullYear().toString(),
    language: editingRelease?.language || 'en',
    explicit_content: editingRelease?.explicit_content || false,
    previously_released: editingRelease?.previously_released || false,
    original_release_date: editingRelease?.original_release_date || '',
    upc_ean_code: editingRelease?.upc_ean_code || '',
    pro_affiliation: editingRelease?.pro_affiliation || 'None',
    ipi_cae_number: editingRelease?.ipi_cae_number || '',
    royalty_splits: editingRelease?.royalty_splits || [],
    tracks: [], // Tracks are loaded separately if editing
  });

  const [releaseData, setReleaseData] = useState(getInitialState());
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(editingRelease?.cover_art_url || '');

  useEffect(() => {
    if (open) {
      if (editingRelease) {
        // Load existing release data for editing
        setReleaseData(getInitialState()); // Re-initialize with editingRelease data
        setCoverPreview(editingRelease.cover_art_url || '');
        loadExistingTracks(editingRelease.track_ids);
      } else {
        // Reset for new release
        setCurrentStep(1);
        setReleaseData(getInitialState());
        setCoverFile(null);
        setCoverPreview('');
      }
    }
  }, [open, editingRelease, user]); // Added editingRelease to dependencies

  const loadExistingTracks = async (trackIds) => {
    if (trackIds?.length) {
      try {
        const existingTracks = await Promise.all(
          trackIds.map(async (trackId) => {
            const track = await Track.get(trackId);
            return {
              id: track.id,
              title: track.title,
              audio_file: null, // Audio file itself is not re-loaded, just its URL
              audio_url: track.audio_file_url,
              duration_seconds: track.duration_seconds,
              explicit_content: track.explicit_content,
              isrc_code: track.isrc_code,
              lyrics: track.lyrics
            };
          })
        );
        setReleaseData(prev => ({ ...prev, tracks: existingTracks }));
      } catch (error) {
        console.error('Error loading existing tracks:', error);
        alert('Failed to load existing tracks.');
      }
    }
  };

  const handleInputChange = (field, value) => {
    setReleaseData(prev => ({ ...prev, [field]: value }));
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const addTrack = () => {
    setReleaseData(prev => ({
      ...prev,
      tracks: [...prev.tracks, {
        id: `new-${Date.now()}`, // Use a temporary unique ID for new tracks
        title: '',
        audio_file: null,
        audio_url: '',
        duration_seconds: 0,
        explicit_content: false,
        isrc_code: '',
        lyrics: ''
      }]
    }));
  };

  const updateTrack = (trackId, field, value) => {
    setReleaseData(prev => ({
      ...prev,
      tracks: prev.tracks.map(track => 
        track.id === trackId ? { ...track, [field]: value } : track
      )
    }));
  };

  const removeTrack = (trackId) => {
    setReleaseData(prev => ({
      ...prev,
      tracks: prev.tracks.filter(track => track.id !== trackId)
    }));
  };

  const handleTrackAudioUpload = async (trackId, file) => {
    if (!file) return;
    
    try {
      const uploadResult = await UploadFile({ file });
      const audioUrl = uploadResult.file_url;
      
      // Create audio element to get duration
      const audio = new Audio(audioUrl);
      audio.addEventListener('loadedmetadata', () => {
        updateTrack(trackId, 'duration_seconds', Math.floor(audio.duration));
      });
      
      updateTrack(trackId, 'audio_file', file);
      updateTrack(trackId, 'audio_url', audioUrl);
      
      // Auto-fill track title from filename if empty
      const currentTrack = releaseData.tracks.find(t => t.id === trackId);
      if (!currentTrack?.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        updateTrack(trackId, 'title', fileName);
      }
    } catch (error) {
      console.error('Error uploading track:', error);
      alert('Failed to upload track. Please try again.');
    }
  };

  const addRoyaltySplit = () => {
    setReleaseData(prev => ({
      ...prev,
      royalty_splits: [...(prev.royalty_splits || []), { 
        name: '', 
        email: '', 
        percentage: '', 
        role: 'artist' 
      }]
    }));
  };

  const updateRoyaltySplit = (index, field, value) => {
    setReleaseData(prev => ({
      ...prev,
      royalty_splits: prev.royalty_splits.map((split, i) => 
        i === index ? { ...split, [field]: value } : split
      )
    }));
  };

  const removeRoyaltySplit = (index) => {
    setReleaseData(prev => ({
      ...prev,
      royalty_splits: prev.royalty_splits.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let coverUrl = releaseData.cover_art_url; // Default to existing URL if editing
      
      if (coverFile) { // Only upload if a new file was selected
        const uploadResult = await UploadFile({ file: coverFile });
        coverUrl = uploadResult.file_url;
      }

      let release;
      const releasePayload = {
        ...releaseData,
        artist_id: user.id,
        artist_name: user.artist_name || user.full_name,
        cover_art_url: coverUrl,
        status: 'draft', // Keep as draft, can be changed later
        track_count: releaseData.tracks.length,
        submission_notes: editingRelease ? 'Release updated.' : 'Release created with tracks, ready for completion.'
      };

      if (editingRelease) {
        // Update existing release
        release = await Release.update(editingRelease.id, releasePayload);
        // Ensure the returned release object has updated data (some APIs might return partial)
        release = { ...editingRelease, ...releasePayload, id: editingRelease.id }; 
      } else {
        // Create new release
        release = await Release.create(releasePayload);
      }

      // Handle tracks: update existing or create new ones
      const finalTrackIds = [];
      for (const trackData of releaseData.tracks) {
        let processedTrack;
        // Check if trackData.id is NOT a temporary 'new-' id, indicating it's an existing track
        if (trackData.id && !String(trackData.id).startsWith('new-')) {
          // Update existing track
          processedTrack = await Track.update(trackData.id, {
            title: trackData.title,
            audio_file_url: trackData.audio_url,
            duration_seconds: trackData.duration_seconds,
            explicit_content: trackData.explicit_content,
            isrc_code: trackData.isrc_code,
            lyrics: trackData.lyrics,
            cover_art_url: coverUrl, // Update track cover art if release cover changes
            genre: releaseData.genre,
          });
          finalTrackIds.push(trackData.id);
        } else {
          // Create new track
          processedTrack = await Track.create({
            title: trackData.title,
            artist_id: user.id,
            artist_name: user.artist_name || user.full_name,
            audio_file_url: trackData.audio_url,
            duration_seconds: trackData.duration_seconds,
            explicit_content: trackData.explicit_content,
            isrc_code: trackData.isrc_code,
            lyrics: trackData.lyrics,
            release_id: release.id, // Link new track to the current release
            cover_art_url: coverUrl,
            genre: releaseData.genre,
            status: 'draft'
          });
          finalTrackIds.push(processedTrack.id);
        }
      }

      // Update the release with the final list of track IDs
      await Release.update(release.id, { track_ids: finalTrackIds });

      onSuccess();
    } catch (error) {
      console.error('Error saving release:', error);
      alert('Failed to save release. Please check all fields and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return releaseData.title && releaseData.release_type && releaseData.release_date && releaseData.genre && (coverPreview || coverFile);
      case 2:
        return releaseData.tracks.length > 0 && releaseData.tracks.every(track => track.title && track.audio_url);
      case 3:
        return releaseData.copyright_holder && releaseData.phonographic_copyright && releaseData.recording_year;
      case 4:
        const totalPercentage = releaseData.royalty_splits.reduce((sum, split) => sum + (Number(split.percentage) || 0), 0);
        return totalPercentage === 100 || releaseData.royalty_splits.length === 0;
      case 5:
        return true; // Review step
      default:
        return false;
    }
  };

  const renderStep = () => {
    const Step1_BasicInfo = () => (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Release Information</h3>
          <p className="text-slate-600">Tell us about your release</p>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Release Title *</Label>
            <StudioInput 
              id="title" 
              value={releaseData.title} 
              onChange={(e) => handleInputChange('title', e.target.value)} 
              placeholder="Enter your release title"
              required 
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="release_type">Release Type *</Label>
              <Select value={releaseData.release_type} onValueChange={(value) => handleInputChange('release_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="ep">EP</SelectItem>
                  <SelectItem value="album">Album</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="release_date">Release Date *</Label>
              <StudioInput 
                id="release_date" 
                type="date" 
                value={releaseData.release_date} 
                onChange={(e) => handleInputChange('release_date', e.target.value)} 
                min={new Date().toISOString().split('T')[0]} 
                required 
              />
            </div>
          </div>
          <div>
            <Label htmlFor="genre">Primary Genre *</Label>
            <Select value={releaseData.genre} onValueChange={(value) => handleInputChange('genre', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select primary genre" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="pop">Pop</SelectItem>
                <SelectItem value="rock">Rock</SelectItem>
                <SelectItem value="hip-hop">Hip-Hop</SelectItem>
                <SelectItem value="rap">Rap</SelectItem>
                <SelectItem value="r&b">R&B</SelectItem>
                <SelectItem value="country">Country</SelectItem>
                <SelectItem value="electronic">Electronic</SelectItem>
                <SelectItem value="dance">Dance</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="techno">Techno</SelectItem>
                <SelectItem value="dubstep">Dubstep</SelectItem>
                <SelectItem value="trap">Trap</SelectItem>
                <SelectItem value="indie">Indie</SelectItem>
                <SelectItem value="alternative">Alternative</SelectItem>
                <SelectItem value="punk">Punk</SelectItem>
                <SelectItem value="metal">Metal</SelectItem>
                <SelectItem value="jazz">Jazz</SelectItem>
                <SelectItem value="blues">Blues</SelectItem>
                <SelectItem value="classical">Classical</SelectItem>
                <SelectItem value="folk">Folk</SelectItem>
                <SelectItem value="acoustic">Acoustic</SelectItem>
                <SelectItem value="reggae">Reggae</SelectItem>
                <SelectItem value="latin">Latin</SelectItem>
                <SelectItem value="world">World</SelectItem>
                <SelectItem value="ambient">Ambient</SelectItem>
                <SelectItem value="instrumental">Instrumental</SelectItem>
                <SelectItem value="gospel">Gospel</SelectItem>
                <SelectItem value="christian">Christian</SelectItem>
                <SelectItem value="children">Children's Music</SelectItem>
                <SelectItem value="comedy">Comedy</SelectItem>
                <SelectItem value="spoken-word">Spoken Word</SelectItem>
                <SelectItem value="podcast">Podcast</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="cover_art">Cover Art * (3000x3000px recommended)</Label>
            {coverPreview ? (
              <div className="flex items-center gap-4 mt-2">
                <img src={coverPreview} alt="Cover" className="w-20 h-20 rounded-lg object-cover" />
                <Button variant="outline" size="sm" onClick={() => { setCoverPreview(''); setCoverFile(null); handleInputChange('cover_art_url', ''); }}>
                  <X className="w-4 h-4 mr-2" />Remove
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 mt-2 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                <Upload className="w-8 h-8 mb-2 text-slate-400" />
                <p className="text-sm text-slate-500">Click to upload cover art</p>
                <p className="text-xs text-slate-400">JPG, PNG up to 10MB</p>
                <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} />
              </label>
            )}
          </div>
        </div>
      </div>
    );
    
    const Step2_Tracks = () => (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Upload Tracks</h3>
          <p className="text-slate-600">Add your music files</p>
        </div>
        <div className="space-y-4">
          {releaseData.tracks.map((track, index) => (
            <div key={track.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Track {index + 1}</h4>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-red-500 hover:text-red-600" 
                  onClick={() => removeTrack(track.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Track Title *</Label>
                  <StudioInput
                    value={track.title}
                    onChange={(e) => updateTrack(track.id, 'title', e.target.value)}
                    placeholder="Enter track title"
                  />
                </div>
                <div>
                  <Label>ISRC Code</Label>
                  <StudioInput
                    value={track.isrc_code}
                    onChange={(e) => updateTrack(track.id, 'isrc_code', e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>
              
              <div>
                <Label>Audio File *</Label>
                {track.audio_url ? (
                  <div className="mt-2 space-y-2">
                    <audio controls src={track.audio_url} className="w-full" />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => updateTrack(track.id, 'audio_url', '')} // Clear URL to allow re-upload
                    >
                      <X className="w-4 h-4 mr-2" />Remove
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-24 mt-2 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                    <Music className="w-6 h-6 mb-1 text-slate-400" />
                    <p className="text-sm text-slate-500">Click to upload audio</p>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="audio/*" 
                      onChange={(e) => handleTrackAudioUpload(track.id, e.target.files[0])} 
                    />
                  </label>
                )}
              </div>
              
              <div>
                <Label>Lyrics</Label>
                <Textarea
                  value={track.lyrics}
                  onChange={(e) => updateTrack(track.id, 'lyrics', e.target.value)}
                  placeholder="Enter lyrics (optional)"
                  className="h-20"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  checked={track.explicit_content} 
                  onCheckedChange={(checked) => updateTrack(track.id, 'explicit_content', checked)} 
                />
                <Label>This track contains explicit content</Label>
              </div>
            </div>
          ))}
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={addTrack} 
            className="w-full border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Track
          </Button>
        </div>
      </div>
    );

    const Step3_RightsMetadata = () => (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Rights & Metadata</h3>
          <p className="text-slate-600">Copyright and ownership information</p>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Label Name</Label>
              <StudioInput 
                value={releaseData.label_name} 
                onChange={(e) => handleInputChange('label_name', e.target.value)} 
              />
            </div>
            <div>
              <Label>Recording Year *</Label>
              <StudioInput 
                type="number" 
                value={releaseData.recording_year} 
                onChange={(e) => handleInputChange('recording_year', e.target.value)} 
                required 
              />
            </div>
          </div>
          <div>
            <Label>Copyright Holder (℗) *</Label>
            <StudioInput 
              value={releaseData.copyright_holder} 
              onChange={(e) => handleInputChange('copyright_holder', e.target.value)} 
              required 
            />
          </div>
          <div>
            <Label>Phonographic Copyright (©) *</Label>
            <StudioInput 
              value={releaseData.phonographic_copyright} 
              onChange={(e) => handleInputChange('phonographic_copyright', e.target.value)} 
              required 
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Recording Location</Label>
              <StudioInput 
                value={releaseData.recording_location} 
                onChange={(e) => handleInputChange('recording_location', e.target.value)} 
              />
            </div>
            <div>
              <Label>Producer</Label>
              <StudioInput 
                value={releaseData.producer} 
                onChange={(e) => handleInputChange('producer', e.target.value)} 
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              checked={releaseData.explicit_content} 
              onCheckedChange={(checked) => handleInputChange('explicit_content', checked)} 
            />
            <Label>This release contains explicit content</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              checked={releaseData.previously_released} 
              onCheckedChange={(checked) => handleInputChange('previously_released', checked)} 
            />
            <Label>This has been released before</Label>
          </div>
          {releaseData.previously_released && (
            <div>
              <Label>Original Release Date</Label>
              <StudioInput 
                type="date" 
                value={releaseData.original_release_date} 
                onChange={(e) => handleInputChange('original_release_date', e.target.value)} 
              />
            </div>
          )}

          <div className="pt-4 border-t">
            <h4 className="font-medium text-slate-800 mb-3">PRO Affiliation</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Performance Rights Organization</Label>
                <Select value={releaseData.pro_affiliation} onValueChange={(value) => handleInputChange('pro_affiliation', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">Not Affiliated</SelectItem>
                    <SelectItem value="ASCAP">ASCAP</SelectItem>
                    <SelectItem value="BMI">BMI</SelectItem>
                    <SelectItem value="SESAC">SESAC</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {releaseData.pro_affiliation !== 'None' && (
                <div>
                  <Label>IPI/CAE Number</Label>
                  <StudioInput 
                    value={releaseData.ipi_cae_number}
                    onChange={(e) => handleInputChange('ipi_cae_number', e.target.value)}
                    placeholder="Enter your IPI/CAE number"
                  />
                </div>
              )}
            </div>
            {releaseData.pro_affiliation === 'None' && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-sm">
                <p className="font-semibold mb-2">Want to collect performance royalties?</p>
                <p className="mb-2">Register with a PRO like ASCAP or BMI to get paid when your music is played publicly.</p>
                <div className="flex gap-2">
                   <a href="https://www.ascap.com/music-creators" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Join ASCAP <ExternalLink className="inline w-3 h-3"/></a>
                   <a href="https://www.bmi.com/join" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Join BMI <ExternalLink className="inline w-3 h-3"/></a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );

    const Step4_RoyaltySplits = () => (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Royalty Splits</h3>
          <p className="text-slate-600">How should royalties be distributed?</p>
        </div>
        <div className="flex justify-between items-center">
          <Label>Royalty Splits</Label>
          <Button variant="outline" size="sm" onClick={addRoyaltySplit}>
            <Plus className="w-4 h-4 mr-2" />Add Split
          </Button>
        </div>
        {releaseData.royalty_splits.map((split, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-end">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={() => removeRoyaltySplit(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <StudioInput
                placeholder="Full Name"
                value={split.name}
                onChange={(e) => updateRoyaltySplit(index, 'name', e.target.value)}
              />
              <StudioInput
                placeholder="Email"
                type="email"
                value={split.email}
                onChange={(e) => updateRoyaltySplit(index, 'email', e.target.value)}
              />
              <StudioInput
                placeholder="Percentage"
                type="number"
                min="0"
                max="100"
                value={split.percentage}
                onChange={(e) => updateRoyaltySplit(index, 'percentage', e.target.value)}
              />
              <Select 
                value={split.role} 
                onValueChange={(value) => updateRoyaltySplit(index, 'role', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="artist">Artist</SelectItem>
                  <SelectItem value="producer">Producer</SelectItem>
                  <SelectItem value="songwriter">Songwriter</SelectItem>
                  <SelectItem value="composer">Composer</SelectItem>
                  <SelectItem value="publisher">Publisher</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
        {releaseData.royalty_splits.length === 0 && (
          <p className="text-center text-slate-500 py-8">
            No splits added. 100% royalties will go to the main artist.
          </p>
        )}
        {releaseData.royalty_splits.length > 0 && (
          <p className="text-right text-sm font-bold">
            Total: {releaseData.royalty_splits.reduce((sum, s) => sum + (Number(s.percentage) || 0), 0)}%
          </p>
        )}
      </div>
    );

    const Step5_Review = () => (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Review & {editingRelease ? 'Update' : 'Create'}</h3>
          <p className="text-slate-600">Review your release details before {editingRelease ? 'updating' : 'creating'}</p>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold mb-2">Release Details</h4>
            <p><strong>Title:</strong> {releaseData.title}</p>
            <p><strong>Type:</strong> {releaseData.release_type}</p>
            <p><strong>Release Date:</strong> {releaseData.release_date}</p>
            <p><strong>Genre:</strong> {releaseData.genre}</p>
            {releaseData.cover_art_url && <p><strong>Cover Art:</strong> <a href={releaseData.cover_art_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View</a></p>}
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold mb-2">Tracks ({releaseData.tracks.length})</h4>
            {releaseData.tracks.length > 0 ? (
              releaseData.tracks.map((track, index) => (
                <p key={track.id}>{index + 1}. {track.title} {track.explicit_content && "(Explicit)"} {track.audio_url && "(Uploaded)"}</p>
              ))
            ) : (
              <p>No tracks added.</p>
            )}
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold mb-2">Rights</h4>
            <p><strong>Label Name:</strong> {releaseData.label_name || 'N/A'}</p>
            <p><strong>Copyright Holder (℗):</strong> {releaseData.copyright_holder}</p>
            <p><strong>Phonographic Copyright (©):</strong> {releaseData.phonographic_copyright}</p>
            <p><strong>Recording Year:</strong> {releaseData.recording_year}</p>
            <p><strong>Recording Location:</strong> {releaseData.recording_location || 'N/A'}</p>
            <p><strong>Producer:</strong> {releaseData.producer || 'N/A'}</p>
            <p><strong>PRO Affiliation:</strong> {releaseData.pro_affiliation || 'None'}</p>
            {releaseData.pro_affiliation !== 'None' && <p><strong>IPI/CAE Number:</strong> {releaseData.ipi_cae_number || 'Not provided'}</p>}
            <p><strong>Explicit Content:</strong> {releaseData.explicit_content ? 'Yes' : 'No'}</p>
            <p><strong>Previously Released:</strong> {releaseData.previously_released ? 'Yes' : 'No'}</p>
            {releaseData.previously_released && <p><strong>Original Release Date:</strong> {releaseData.original_release_date}</p>}
          </div>
          {releaseData.royalty_splits.length > 0 && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-semibold mb-2">Royalty Splits</h4>
              {releaseData.royalty_splits.map((split, index) => (
                <p key={index}>{split.name} ({split.role}): {split.percentage}%</p>
              ))}
            </div>
          )}
        </div>
      </div>
    );

    switch (currentStep) {
      case 1: return <Step1_BasicInfo />;
      case 2: return <Step2_Tracks />;
      case 3: return <Step3_RightsMetadata />;
      case 4: return <Step4_RoyaltySplits />;
      case 5: return <Step5_Review />;
      default: return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {editingRelease ? 'Edit Release' : 'Create New Release'}
            </DialogTitle>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-1 rounded-full ${
                    step <= currentStep ? 'bg-purple-500' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-slate-500">Step {currentStep} of 5</p>
        </DialogHeader>

        <div className="py-4 min-h-[400px]">
          {renderStep()}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} className="w-full sm:w-auto">
            Previous
          </Button>
          <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="w-full sm:w-auto">
              Cancel
            </Button>
            {currentStep < 5 ? (
              <ActionButton 
                onClick={nextStep} 
                disabled={!isStepValid() || isSubmitting} 
                icon="chevronRight"
                className="w-full sm:w-auto"
              >
                Continue
              </ActionButton>
            ) : (
              <ActionButton 
                onClick={handleSubmit} 
                disabled={!isStepValid() || isSubmitting} 
                icon={isSubmitting ? "loading" : "check"}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (editingRelease ? 'Updating...' : 'Creating...') : (editingRelease ? 'Update Release' : 'Create Release')}
              </ActionButton>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
