import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ActionButton from '../ActionButton';
import { UploadFile } from '@/api/integrations';
import { Story } from '@/api/entities';
import { Image, Video } from 'lucide-react';
import AnimatedIcon from '../AnimatedIcon';

export default function CreateStoryModal({ open, onOpenChange, currentUser, onStoryCreated }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File is too large. Maximum size is 10MB.');
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!file || !currentUser) return;
    
    setIsUploading(true);
    setError('');
    
    try {
      console.log('Uploading file...', file.name);
      const { file_url } = await UploadFile({ file });
      console.log('File uploaded:', file_url);
      
      const expires = new Date();
      expires.setHours(expires.getHours() + 24);

      const storyData = {
        author_id: currentUser.id,
        author_name: currentUser.artist_name || currentUser.full_name,
        author_avatar_url: currentUser.profile_image_url,
        content_type: file.type.startsWith('image/') ? 'image' : 'video',
        content_url: file_url,
        expires_at: expires.toISOString(),
        viewers: [],
        reactions: []
      };

      console.log('Creating story with data:', storyData);
      
      // Create the story in the database
      const newStory = await Story.create(storyData);
      console.log('Story created successfully:', newStory);
      
      // Notify the parent component to refresh its stories list
      if (onStoryCreated) {
        onStoryCreated(newStory);
      }
      
      handleClose();
    } catch (err) {
      console.error('Error creating story:', err);
      setError('Failed to create story. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new Story</DialogTitle>
          <DialogDescription>
            Share a photo or a short video. It will disappear after 24 hours.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {!preview ? (
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="story-file-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <AnimatedIcon icon="upload" size={32} className="text-slate-500 mb-3" />
                  <p className="mb-2 text-sm text-slate-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-slate-500">Image or Video (MAX. 10MB)</p>
                </div>
                <input
                  id="story-file-upload"
                  type="file"
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          ) : (
            <div className="relative w-full aspect-[9/16] rounded-lg overflow-hidden border">
              {file.type.startsWith('image/') ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <video src={preview} controls autoPlay muted className="w-full h-full object-cover" />
              )}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={() => { setFile(null); setPreview(null); }}
              >
                <AnimatedIcon icon="close" size={16} />
              </Button>
            </div>
          )}
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <ActionButton
            onClick={handleSubmit}
            disabled={!file || isUploading}
            icon={isUploading ? 'loading' : 'share'}
          >
            {isUploading ? 'Sharing...' : 'Share to Story'}
          </ActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}