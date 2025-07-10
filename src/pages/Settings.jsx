
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { useAuth } from "@/contexts/AuthContext";
import StudioPanel from "../components/StudioPanel";
import StudioInput from "../components/StudioInput";
import ActionButton from "../components/ActionButton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import LordIcon from "../components/LordIcon";

const EPKBuilder = ({ user }) => {
    const handleDownload = () => {
        alert("Your EPK is being generated and will download shortly!");
        // In a real app, this would trigger a backend function to generate a PDF
    };

    if (!user) return null;

    return (
        <StudioPanel className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Auto-EPK / Promo Kit Builder</h3>
            <p className="text-slate-600 mb-6">Generate a professional Electronic Press Kit in seconds based on your profile data.</p>
            
            <div className="border rounded-lg p-6 bg-slate-50">
                <h4 className="font-bold text-xl text-center mb-2">{user.artist_name || user.full_name}</h4>
                <p className="text-center text-slate-600 mb-4">{user.genre || "Artist"}</p>
                <div className="flex justify-center mb-6">
                    <Avatar className="w-24 h-24">
                        <AvatarImage src={user.profile_image_url} />
                        <AvatarFallback>{(user.artist_name || user.full_name || 'A')[0]}</AvatarFallback>
                    </Avatar>
                </div>
                <h5 className="font-semibold text-slate-800 mb-2">Bio</h5>
                <p className="text-sm text-slate-700 whitespace-pre-line mb-6">{user.bio || "No bio available. Add one in your profile settings."}</p>
                
                {/* Add top songs, stats, etc. here in a real implementation */}
            </div>

            <div className="flex justify-end mt-6">
                <ActionButton onClick={handleDownload} icon="download">
                    Download PDF
                </ActionButton>
            </div>
        </StudioPanel>
    );
};


const DeleteAccountDialog = ({ open, onOpenChange, onConfirm }) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (confirmText !== 'DELETE MY ACCOUNT') {
      alert('Please type exactly "DELETE MY ACCOUNT" to confirm');
      return;
    }
    
    setIsDeleting(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please contact support.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <LordIcon icon="warning" size={20} className="mr-2" />
            Delete Account
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-2">What will be deleted:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Your profile and all personal information</li>
              <li>• All uploaded tracks and releases</li>
              <li>• Marketing campaigns and analytics data</li>
              <li>• Collaborations and messages</li>
              <li>• Song registrations and copyright submissions</li>
            </ul>
          </div>
          
          <div>
            <Label htmlFor="confirm-text" className="text-slate-700">
              Type "DELETE MY ACCOUNT" to confirm:
            </Label>
            <StudioInput
              id="confirm-text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE MY ACCOUNT"
              className="mt-2"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={confirmText !== 'DELETE MY ACCOUNT' || isDeleting}
          >
            {isDeleting ? (
              <>
                <LordIcon icon="loading" trigger="loop" size={16} className="mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <LordIcon icon="trash" size={16} className="mr-2" />
                Delete Account
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function SettingsPage() {
  const { user: currentUser, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    artist_name: "",
    bio: "",
    genre: "",
    website: "",
    tip_jar_url: "",
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    profile_visibility: 'public',
    allow_messages: true,
    show_online_status: true,
  });
  
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        artist_name: currentUser.artist_name || "",
        bio: currentUser.bio || "",
        genre: currentUser.genre || "",
        website: currentUser.website || "",
        tip_jar_url: currentUser.tip_jar_url || "",
      });
      setPrivacySettings({
        profile_visibility: currentUser.profile_visibility || 'public',
        allow_messages: currentUser.allow_messages !== false,
        show_online_status: currentUser.show_online_status !== false,
      });
      setProfileImagePreview(currentUser.profile_image_url || null);
      setCoverImagePreview(currentUser.cover_image_url || null);
      setIsLoading(false);
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePrivacyChange = (key, value) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }));
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };
  
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      let updateData = { ...formData, ...privacySettings };
      
      if (profileImageFile) {
        const uploadedProfileImage = await UploadFile({ file: profileImageFile });
        updateData.profile_image_url = uploadedProfileImage.file_url;
      }
      if (coverImageFile) {
        const uploadedCoverImage = await UploadFile({ file: coverImageFile });
        updateData.cover_image_url = uploadedCoverImage.file_url;
      }

      await User.updateMyUserData(updateData);
      const updatedUser = await User.me();
      updateUser(updatedUser);
      setProfileImagePreview(updatedUser.profile_image_url || null);
      setCoverImagePreview(updatedUser.cover_image_url || null);
      setProfileImageFile(null);
      setCoverImageFile(null);

      setMessage({ type: "success", text: "Settings updated successfully!" });
    } catch (error) {
      console.error("Error updating settings:", error);
      setMessage({ type: "error", text: "Failed to update settings. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };
  
  const getInitials = (name) => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex items-center gap-3 text-slate-800 text-xl">
          <Loader2 className="w-6 h-6 animate-spin"/> Loading Settings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Account Settings</h1>
        <p className="text-lg text-slate-700 mt-1">Manage your profile, privacy, and account preferences</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="epk">EPK</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6 space-y-6">
          <StudioPanel className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <Avatar className="w-24 h-24 border-2 border-slate-200">
                    <AvatarImage src={profileImagePreview} alt={formData.artist_name || currentUser?.full_name} />
                    <AvatarFallback className="text-3xl bg-purple-100 text-purple-700">
                      {getInitials(formData.artist_name || currentUser?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-grow w-full">
                  <Label htmlFor="profileImageFile" className="text-base">Profile Picture</Label>
                  <StudioInput 
                    id="profileImageFile" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleProfileImageChange}
                    className="text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1">Square, at least 400x400px recommended.</p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="coverImageFile" className="text-base">Cover Image</Label>
                {coverImagePreview && (
                  <img 
                    src={coverImagePreview} 
                    alt="Cover preview" 
                    className="mt-2 rounded-lg max-h-48 w-full object-cover border border-slate-200"
                  />
                )}
                <StudioInput 
                  id="coverImageFile" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleCoverImageChange}
                  className="text-sm mt-2"
                />
                <p className="text-xs text-slate-500 mt-1">Landscape, 1500x500px recommended.</p>
              </div>

              <div>
                <Label htmlFor="artist_name" className="text-base">Artist/Band Name</Label>
                <StudioInput 
                  id="artist_name" 
                  name="artist_name" 
                  value={formData.artist_name} 
                  onChange={handleChange} 
                  placeholder="Your public artist name"
                />
              </div>
              
              <div>
                <Label htmlFor="bio" className="text-base">Your Bio</Label>
                <Textarea 
                  id="bio" 
                  name="bio"
                  value={formData.bio} 
                  onChange={handleChange}
                  placeholder="Tell your story, your sound, your inspiration..."
                  className="h-32 resize-none bg-white"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="genre" className="text-base">Primary Genre</Label>
                  <StudioInput 
                    id="genre" 
                    name="genre" 
                    value={formData.genre} 
                    onChange={handleChange} 
                    placeholder="e.g., Indie Folk, Lofi Beats"
                  />
                </div>
                <div>
                  <Label htmlFor="website" className="text-base">Official Website</Label>
                  <StudioInput 
                    id="website" 
                    name="website" 
                    type="url" 
                    value={formData.website} 
                    onChange={handleChange} 
                    placeholder="https://yourband.com"
                  />
                </div>
              </div>

               <div>
                <Label htmlFor="tip_jar_url" className="text-base flex items-center gap-2">
                  <LordIcon icon="dollar" size={18} className="text-green-600" />
                  Tip Jar Link
                </Label>
                <p className="text-sm text-slate-500 mt-1 mb-2">Add a link to your PayPal, Stripe, or other tipping service to let fans support you directly from your profile.</p>
                <StudioInput 
                  id="tip_jar_url" 
                  name="tip_jar_url" 
                  type="url" 
                  value={formData.tip_jar_url} 
                  onChange={handleChange} 
                  placeholder="https://your-tip-jar-link.com"
                />
              </div>
            </form>
          </StudioPanel>
        </TabsContent>

        <TabsContent value="epk" className="mt-6">
            <EPKBuilder user={currentUser} />
        </TabsContent>

        <TabsContent value="privacy" className="mt-6 space-y-6">
          <StudioPanel className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Privacy Controls</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Profile Visibility</Label>
                      <p className="text-sm text-slate-500">Control who can see your profile</p>
                    </div>
                    <Switch
                      checked={privacySettings.profile_visibility === 'public'}
                      onCheckedChange={(checked) => 
                        handlePrivacyChange('profile_visibility', checked ? 'public' : 'private')
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Allow Direct Messages</Label>
                      <p className="text-sm text-slate-500">Let other users send you messages</p>
                    </div>
                    <Switch
                      checked={privacySettings.allow_messages}
                      onCheckedChange={(checked) => handlePrivacyChange('allow_messages', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Show Online Status</Label>
                      <p className="text-sm text-slate-500">Display when you're active on the platform</p>
                    </div>
                    <Switch
                      checked={privacySettings.show_online_status}
                      onCheckedChange={(checked) => handlePrivacyChange('show_online_status', checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </StudioPanel>
        </TabsContent>

        <TabsContent value="account" className="mt-6 space-y-6">
          <StudioPanel className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Data & Privacy Rights</h3>
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center gap-3">
                      <LordIcon icon="trash" size={20} className="text-red-600" />
                      <div>
                        <Label className="text-base font-medium text-red-800">Delete Your Account</Label>
                        <p className="text-sm text-red-600">Permanently remove your account and all data</p>
                      </div>
                    </div>
                    <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                      Delete Account
                    </Button>
                  </div>
              </div>
            </div>
          </StudioPanel>
        </TabsContent>
      </Tabs>

      {message.text && (
        <div className={`text-sm p-3 rounded-md ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {message.text}
        </div>
      )}

      <div className="flex justify-end pt-4">
        <ActionButton type="submit" size="lg" disabled={isSaving} onClick={handleSubmit} icon="save">
          {isSaving ? "Saving..." : "Save All Settings"}
        </ActionButton>
      </div>

      <DeleteAccountDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => { alert('Account deletion in progress...'); }}
      />
    </div>
  );
}
