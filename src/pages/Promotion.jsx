
import React, { useState, useEffect, useCallback } from 'react';
import { Promotion, Track, Release, Fan } from '@/api/entities';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StudioPanel from '../components/StudioPanel';
import ActionButton from '../components/ActionButton';
import AnimatedIcon from '../components/AnimatedIcon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLocation } from 'react-router-dom';
import { Heart, Users, MoreVertical, Trash2, Edit, Palette, AtSign, PlusCircle, XCircle } from 'lucide-react';
import { Switch } from "@/components/ui/switch";

const CampaignTypeSelector = ({ selectedType, onSelect }) => {
  const campaignTypes = [
    {
      id: 'smartlink',
      title: 'Smart Link',
      description: 'One link to all music platforms',
      icon: 'share',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      id: 'presave',
      title: 'Pre-Save',
      description: 'Build hype before your release',
      icon: 'calendar',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'premiere',
      title: 'Video Premiere',
      description: 'Create an event for your music video',
      icon: 'video',
      color: 'from-red-500 to-pink-500'
    },
    {
      id: 'social',
      title: 'Social Campaign',
      description: 'Promote your music on social media',
      icon: 'users',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {campaignTypes.map((type) => (
        <button
          key={type.id}
          onClick={() => onSelect(type.id)}
          className={`p-6 rounded-2xl border-2 transition-all duration-200 text-left ${
            selectedType === type.id
              ? 'border-purple-500 bg-purple-50'
              : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${type.color} flex items-center justify-center`}>
              <AnimatedIcon icon={type.icon} size={24} className="text-white" trigger="bounce" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{type.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{type.description}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

const CampaignCreationModal = ({ open, onOpenChange, onSave, userTracks, userReleases, initialData }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialData || {
    title: '',
    type: '',
    description: '',
    release_id: '',
    external_release: {
      title: '',
      artist_name: '',
      release_date: '',
      cover_art_url: '',
      spotify_url: '',
      apple_music_url: '',
      youtube_url: ''
    },
    use_external_release: false,
    start_date: '',
    end_date: '',
    custom_url: '',
    video_url: '',
    fan_collection_enabled: true,
    social_links: [],
    styling_options: { background_color: '#ffffff', background_image_url: '', text_color: '#000000' },
    pixel_ids: { facebook_pixel_id: '', google_analytics_id: '', tiktok_pixel_id: '' }
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          ...initialData,
          external_release: initialData.external_release_data || { title: '', artist_name: '', release_date: '', cover_art_url: '', spotify_url: '', apple_music_url: '', youtube_url: '' },
          use_external_release: !!initialData.external_release_data,
          release_id: initialData.release_id || '',
          social_links: initialData.social_links || [],
          styling_options: initialData.styling_options || { background_color: '#ffffff', background_image_url: '', text_color: '#000000' },
          pixel_ids: initialData.pixel_ids || { facebook_pixel_id: '', google_analytics_id: '', tiktok_pixel_id: '' }
        });
        setStep(2); // Start at details step when editing
      } else {
        setFormData({
          title: '', type: '', description: '',
          release_id: '', start_date: '', end_date: '',
          custom_url: '', video_url: '', fan_collection_enabled: true,
          external_release: { title: '', artist_name: '', release_date: '', cover_art_url: '', spotify_url: '', apple_music_url: '', youtube_url: '' },
          use_external_release: false,
          social_links: [],
          styling_options: { background_color: '#ffffff', background_image_url: '', text_color: '#000000' },
          pixel_ids: { facebook_pixel_id: '', google_analytics_id: '', tiktok_pixel_id: '' }
        });
        setStep(1);
      }
    }
  }, [open, initialData]);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSave = async () => {
    await onSave(formData);
    onOpenChange(false);
  };

  const handleSocialLinkChange = (index, field, value) => {
    const newLinks = [...formData.social_links];
    newLinks[index][field] = value;
    setFormData(prev => ({ ...prev, social_links: newLinks }));
  };

  const addSocialLink = () => {
    setFormData(prev => ({ ...prev, social_links: [...prev.social_links, { platform: 'instagram', url: '' }] }));
  };

  const removeSocialLink = (index) => {
    const newLinks = formData.social_links.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, social_links: newLinks }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <AnimatedIcon icon="target" size={48} className="mx-auto mb-4 text-purple-600" trigger="pulse" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">What kind of campaign?</h3>
              <p className="text-slate-600">Choose a campaign type to connect with your audience</p>
            </div>
            <CampaignTypeSelector
              selectedType={formData.type}
              onSelect={(type) => setFormData(prev => ({ ...prev, type }))}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <AnimatedIcon icon="edit" size={48} className="mx-auto mb-4 text-purple-600" trigger="bounce" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Campaign Details</h3>
              <p className="text-slate-600">Tell us about your campaign</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Campaign Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter campaign title"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your campaign..."
                  className="mt-1 h-24"
                />
              </div>
              {/* Conditional fields based on type */}
              {(formData.type === 'smartlink' || formData.type === 'presave') && (
                <>
                  <div>
                    <Label htmlFor="custom_url">Custom URL Slug</Label>
                    <Input
                      id="custom_url"
                      value={formData.custom_url || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, custom_url: e.target.value }))}
                      placeholder="my-new-single"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="fan_collection_enabled">Collect Fan Emails & Info</Label>
                    <Switch
                      id="fan_collection_enabled"
                      checked={formData.fan_collection_enabled}
                      onCheckedChange={(checked) => setFormData(prev => ({...prev, fan_collection_enabled: checked}))}
                    />
                  </div>
                </>
              )}
              {formData.type === 'premiere' && (
                  <div>
                    <Label htmlFor="video_url">Video Premiere URL</Label>
                    <Input
                      id="video_url"
                      value={formData.video_url || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                      placeholder="https://youtube.com/watch?v=..."
                      className="mt-1"
                    />
                  </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <AnimatedIcon icon="music" size={48} className="mx-auto mb-4 text-purple-600" trigger="bounce" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Choose Your Content</h3>
              <p className="text-slate-600">Select your music to promote</p>
            </div>
            <div className="space-y-4">
              {/* Release Selection Options */}
              <div className="space-y-3">
                <Label>Release Source</Label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="release_source"
                      checked={!formData.use_external_release}
                      onChange={() => setFormData(prev => ({ ...prev, use_external_release: false, release_id: '', external_release: { ...prev.external_release, title: '', artist_name: '', release_date: '', cover_art_url: '', spotify_url: '', apple_music_url: '', youtube_url: '' }}))}
                      className="text-purple-600"
                    />
                    <span>Use a release from my library</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="release_source"
                      checked={formData.use_external_release}
                      onChange={() => setFormData(prev => ({ ...prev, use_external_release: true, release_id: '' }))}
                      className="text-purple-600"
                    />
                    <span>Add external release (from Spotify, Apple Music, etc.)</span>
                  </label>
                </div>
              </div>

              {!formData.use_external_release ? (
                <div>
                  <Label htmlFor="release">Select Release (Optional)</Label>
                  <Select value={formData.release_id} onValueChange={(value) => setFormData(prev => ({ ...prev, release_id: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose a release" />
                    </SelectTrigger>
                    <SelectContent>
                      {userReleases.map(release => (
                        <SelectItem key={release.id} value={release.id}>{release.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
                  <h4 className="font-semibold text-slate-900">External Release Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="external_title">Release Title</Label>
                      <Input
                        id="external_title"
                        value={formData.external_release.title}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          external_release: { ...prev.external_release, title: e.target.value }
                        }))}
                        placeholder="Song or Album Title"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="external_artist">Artist Name</Label>
                      <Input
                        id="external_artist"
                        value={formData.external_release.artist_name}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          external_release: { ...prev.external_release, artist_name: e.target.value }
                        }))}
                        placeholder="Artist Name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="external_release_date">Release Date</Label>
                      <Input
                        id="external_release_date"
                        type="date"
                        value={formData.external_release.release_date}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          external_release: { ...prev.external_release, release_date: e.target.value }
                        }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="external_cover">Cover Art URL</Label>
                      <Input
                        id="external_cover"
                        value={formData.external_release.cover_art_url}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          external_release: { ...prev.external_release, cover_art_url: e.target.value }
                        }))}
                        placeholder="https://..."
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h5 className="font-medium text-slate-800">Platform Links</h5>
                    <div className="grid grid-cols-1 gap-3">
                      <Input
                        value={formData.external_release.spotify_url}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          external_release: { ...prev.external_release, spotify_url: e.target.value }
                        }))}
                        placeholder="Spotify URL"
                      />
                      <Input
                        value={formData.external_release.apple_music_url}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          external_release: { ...prev.external_release, apple_music_url: e.target.value }
                        }))}
                        placeholder="Apple Music URL"
                      />
                      <Input
                        value={formData.external_release.youtube_url}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          external_release: { ...prev.external_release, youtube_url: e.target.value }
                        }))}
                        placeholder="YouTube URL"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <AnimatedIcon icon="palette" size={48} className="mx-auto mb-4 text-purple-600" trigger="bounce" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Customize Your Page</h3>
                    <p className="text-slate-600">Make your landing page stand out.</p>
                </div>

                {/* Styling Options */}
                <div className="space-y-4 p-4 border border-slate-200 rounded-lg">
                    <h4 className="font-semibold text-slate-900">Appearance</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="bg_color">Background Color</Label>
                            <Input id="bg_color" type="color" value={formData.styling_options.background_color} onChange={(e) => setFormData(prev => ({...prev, styling_options: {...prev.styling_options, background_color: e.target.value}}))} className="mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="text_color">Text Color</Label>
                            <Input id="text_color" type="color" value={formData.styling_options.text_color} onChange={(e) => setFormData(prev => ({...prev, styling_options: {...prev.styling_options, text_color: e.target.value}}))} className="mt-1" />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="bg_image_url">Background Image URL</Label>
                        <Input id="bg_image_url" placeholder="https://..." value={formData.styling_options.background_image_url} onChange={(e) => setFormData(prev => ({...prev, styling_options: {...prev.styling_options, background_image_url: e.target.value}}))} className="mt-1" />
                    </div>
                </div>

                {/* Social Links */}
                <div className="space-y-4 p-4 border border-slate-200 rounded-lg">
                     <h4 className="font-semibold text-slate-900">Social Links</h4>
                     {formData.social_links.map((link, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Select value={link.platform} onValueChange={(value) => handleSocialLinkChange(index, 'platform', value)}>
                                <SelectTrigger><SelectValue placeholder="Platform"/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="instagram">Instagram</SelectItem>
                                    <SelectItem value="tiktok">TikTok</SelectItem>
                                    <SelectItem value="twitter">Twitter/X</SelectItem>
                                    <SelectItem value="facebook">Facebook</SelectItem>
                                    <SelectItem value="youtube">YouTube</SelectItem>
                                    <SelectItem value="soundcloud">SoundCloud</SelectItem>
                                    <SelectItem value="bandcamp">Bandcamp</SelectItem>
                                    <SelectItem value="website">Website</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input placeholder="https://..." value={link.url} onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)} />
                            <Button variant="ghost" size="icon" onClick={() => removeSocialLink(index)}><XCircle className="w-5 h-5 text-red-500"/></Button>
                        </div>
                     ))}
                     <Button variant="outline" size="sm" onClick={addSocialLink} className="flex items-center gap-2"><PlusCircle className="w-4 h-4"/>Add Social Link</Button>
                </div>

                {/* Pixel IDs */}
                <div className="space-y-4 p-4 border border-slate-200 rounded-lg">
                    <h4 className="font-semibold text-slate-900">Marketing Pixels (Advanced)</h4>
                    <div>
                        <Label htmlFor="fb_pixel">Facebook Pixel ID</Label>
                        <Input id="fb_pixel" placeholder="Enter FB Pixel ID" value={formData.pixel_ids.facebook_pixel_id} onChange={(e) => setFormData(prev => ({...prev, pixel_ids: {...prev.pixel_ids, facebook_pixel_id: e.target.value}}))} className="mt-1" />
                    </div>
                     <div>
                        <Label htmlFor="ga_pixel">Google Analytics ID</Label>
                        <Input id="ga_pixel" placeholder="Enter GA ID (G-...)" value={formData.pixel_ids.google_analytics_id} onChange={(e) => setFormData(prev => ({...prev, pixel_ids: {...prev.pixel_ids, google_analytics_id: e.target.value}}))} className="mt-1" />
                    </div>
                     <div>
                        <Label htmlFor="tiktok_pixel">TikTok Pixel ID</Label>
                        <Input id="tiktok_pixel" placeholder="Enter TikTok Pixel ID" value={formData.pixel_ids.tiktok_pixel_id} onChange={(e) => setFormData(prev => ({...prev, pixel_ids: {...prev.pixel_ids, tiktok_pixel_id: e.target.value}}))} className="mt-1" />
                    </div>
                </div>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <div className="flex items-center justify-between">
            {step > 1 && (
              <Button variant="ghost" onClick={handleBack}>
                ← Back
              </Button>
            )}
            {!initialData && (
              <div className="flex space-x-2 mx-auto">
                {[1, 2, 3, 4].map((stepNum) => (
                  <div
                    key={stepNum}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      stepNum <= step ? 'bg-purple-500' : 'bg-slate-300'
                    }`}
                  />
                ))}
              </div>
            )}
            <span className="text-sm text-slate-500">{initialData ? '' : `${step}/4`}</span>
          </div>
        </DialogHeader>

        {renderStep()}

        <DialogFooter className="pt-6">
          {step < 4 && !initialData ? (
            <ActionButton
              onClick={handleNext}
              disabled={(step === 1 && !formData.type) || (step === 3 && !formData.release_id && !formData.use_external_release)}
              className="w-full"
              icon="chevronRight"
            >
              Continue
            </ActionButton>
          ) : (
            <ActionButton
              onClick={handleSave}
              disabled={!formData.title}
              className="w-full"
              icon={initialData ? "save" : "lightning"}
            >
              {initialData ? 'Save Changes' : 'Launch Campaign'}
            </ActionButton>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const FanCRMPanel = ({ user }) => {
    const [fans, setFans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadFans();
        }
    }, [user]);

    const loadFans = async () => {
        setIsLoading(true);
        try {
            const fanData = await Fan.filter({ artist_id: user.id }, '-created_date', 10);
            setFans(fanData);
        } catch (error) {
            console.error('Error loading fans:', error);
            setFans([]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <StudioPanel className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Your Fans</h3>
                <ActionButton variant="secondary" size="sm" icon="download">Export CSV</ActionButton>
            </div>
            {isLoading ? (
                <div className="flex justify-center py-4">
                    <AnimatedIcon icon="loading" size={24} className="text-purple-600" trigger="spin" />
                </div>
            ) : fans.length > 0 ? (
                <div className="space-y-3">
                    {fans.map(fan => (
                        <div key={fan.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div>
                                <p className="font-medium">{fan.name || fan.email}</p>
                                <p className="text-sm text-slate-600">{fan.location || 'Unknown location'} • {fan.source}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-green-600">${(fan.total_support || 0).toFixed(2)}</p>
                                <p className="text-xs text-slate-500">total support</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <Heart className="mx-auto h-12 w-12 text-slate-300 mb-2"/>
                    <p className="text-slate-600">No fans collected yet</p>
                    <p className="text-sm text-slate-500">Create smart links to start building your fanbase</p>
                </div>
            )}
        </StudioPanel>
    );
};

export default function PromotionPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [userTracks, setUserTracks] = useState([]);
  const [userReleases, setUserReleases] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const location = useLocation();

  const loadData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [userCampaigns, tracks, releases] = await Promise.all([
        Promotion.filter({ artist_id: user.id }, '-created_date'),
        Track.filter({ artist_id: user.id }),
        Release.filter({ artist_id: user.id }),
      ]);

      setCampaigns(userCampaigns);
      setUserTracks(tracks);
      setUserReleases(releases);
    } catch (error) {
      console.error('Error loading promotion data:', error);
      setCampaigns([]); // Ensure campaigns is an array on error
      setUserTracks([]);
      setUserReleases([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('create')) {
        setShowCreateModal(true);
    }
    // Clean up the URL after opening the modal
    if (window.history.replaceState) {
        window.history.replaceState({}, '', location.pathname);
    }
  }, [location.search, user]);

  const handleEditClick = (campaign) => {
    setEditingCampaign(campaign);
    setShowCreateModal(true);
  };

  const handleDeleteClick = (campaign) => {
    setCampaignToDelete(campaign);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!campaignToDelete) return;
    try {
      await Promotion.delete(campaignToDelete.id);
      loadData();
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      alert("Failed to delete campaign. Please try again.");
    } finally {
      setIsDeleteAlertOpen(false);
      setCampaignToDelete(null);
    }
  };

  const handleSaveCampaign = async (campaignData) => {
    if (!user) return;
    try {
      const payload = { 
        ...campaignData, 
        artist_id: user.id, 
      };
      
      // Add status if it's a new campaign
      if (!campaignData.id) {
          payload.status = 'active';
      }

      // Handle type-specific logic
      if (campaignData.type === 'smartlink' || campaignData.type === 'presave') {
        // Generate a slug if one isn't provided
        payload.custom_url = campaignData.custom_url || 
                             `${(user.artist_name || user.full_name || 'artist').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-5)}`;
        payload.fan_collection_enabled = campaignData.fan_collection_enabled;
        
        // Handle external vs internal release
        if (campaignData.use_external_release) {
          // Store external release data and clear internal release_id
          payload.external_release_data = campaignData.external_release;
          payload.release_id = undefined; // Ensure release_id is not set for external releases
          payload.cover_image_url = campaignData.external_release.cover_art_url;
          
          // Build links from external URLs
          const links = [];
          if (campaignData.external_release.spotify_url) {
            links.push({ platform: 'Spotify', url: campaignData.external_release.spotify_url, icon: 'spotify' });
          }
          if (campaignData.external_release.apple_music_url) {
            links.push({ platform: 'Apple Music', url: campaignData.external_release.apple_music_url, icon: 'apple' });
          }
          if (campaignData.external_release.youtube_url) {
            links.push({ platform: 'YouTube Music', url: campaignData.external_release.youtube_url, icon: 'youtube' });
          }
          payload.links = links;
        } else {
          // Use internal release, clear external_release_data
          payload.external_release_data = undefined; // Ensure external data is not set for internal releases
          const release = userReleases.find(r => r.id === campaignData.release_id);
          payload.cover_image_url = release?.cover_art_url || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=400&q=80';
          payload.links = [
              { platform: 'Spotify', url: '#', icon: 'spotify' },
              { platform: 'Apple Music', url: '#', icon: 'apple' },
              { platform: 'YouTube Music', url: '#', icon: 'youtube' },
          ];
        }
      }
      
      if (campaignData.type === 'premiere') {
          payload.video_url = campaignData.video_url;
      }

      if (campaignData.id) {
        // Update existing campaign
        await Promotion.update(campaignData.id, payload);
      } else {
        // Create new campaign
        await Promotion.create(payload);
      }
      loadData();
    } catch (error) {
      console.error('Error saving campaign:', error);
      alert('Failed to save Campaign. Custom URL might be taken or other error.');
    }
  };

  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <AnimatedIcon icon="loading" size={48} className="mx-auto text-purple-600" trigger="spin" />
      </div>
    );
  }

  const smartLinks = campaigns.filter(c => c.type === 'smartlink' || c.type === 'presave');
  const appUrl = window.location.origin;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Marketing Hub</h1>
          <p className="text-lg text-slate-700 mt-1">Create campaigns, build your fanbase, and promote your music.</p>
        </div>
        <ActionButton 
          onClick={() => setShowCreateModal(true)} 
          size="lg" 
          className="w-full sm:w-auto"
          icon="plus"
        >
          Launch Campaign
        </ActionButton>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="campaigns">All Campaigns</TabsTrigger>
              <TabsTrigger value="fans">Fan CRM</TabsTrigger>
          </TabsList>
          
          <TabsContent value="campaigns" className="mt-6">
            {campaigns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map(campaign => (
                  <StudioPanel key={campaign.id} className="p-6 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{campaign.title}</h3>
                        <Badge className="mt-1 capitalize">{campaign.type}</Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(campaign)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteClick(campaign)}>
                             <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-slate-600 text-sm mb-4 flex-grow">{campaign.description || "No description."}</p>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between"><span className="text-slate-500">Visits</span><span className="font-medium">{campaign.visit_count || 0}</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-500">Clicks</span><span className="font-medium">{campaign.click_count || 0}</span></div>
                      {campaign.type === 'presave' && <div className="flex items-center justify-between"><span className="text-slate-500">Pre-Saves</span><span className="font-medium">{campaign.pre_save_count || 0}</span></div>}
                    </div>
                    {(campaign.type === 'smartlink' || campaign.type === 'presave') && campaign.custom_url && (
                        <a href={`${appUrl}/landing-page?slug=${campaign.custom_url}`} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 hover:underline mt-4 block w-full truncate">{`${appUrl}/l/${campaign.custom_url}`}</a>
                    )}
                    {campaign.type === 'premiere' && campaign.video_url && (
                        <a href={campaign.video_url} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 hover:underline mt-4 block w-full truncate">{campaign.video_url}</a>
                    )}
                  </StudioPanel>
                ))}
                </div>
            ) : (
                <div className="text-center py-16">
                  <AnimatedIcon icon="target" size={64} className="mx-auto mb-4 text-slate-300" trigger="pulse" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No campaigns yet</h3>
                  <p className="text-slate-600 mb-6">Start promoting your music with smart marketing campaigns</p>
                  <ActionButton onClick={() => setShowCreateModal(true)} icon="plus">
                    Launch Your First Campaign
                  </ActionButton>
                </div>
            )}
          </TabsContent>

          <TabsContent value="fans" className="mt-6">
              <FanCRMPanel user={user} />
          </TabsContent>
      </Tabs>

      <CampaignCreationModal
        open={showCreateModal}
        onOpenChange={(isOpen) => {
            if (!isOpen) setEditingCampaign(null);
            setShowCreateModal(isOpen);
        }}
        onSave={handleSaveCampaign}
        userTracks={userTracks}
        userReleases={userReleases}
        initialData={editingCampaign}
      />

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the campaign "{campaignToDelete?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
