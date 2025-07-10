
import React, { useState, useEffect } from "react";
import { DigitalStore } from "@/api/entities";
import { useAuth } from "@/contexts/AuthContext";
import { adminAPI } from "@/api/admin";
import GlassCard from "../components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch"; // Fixed import - removed SwitchThumb
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Settings,
  Store as StoreIcon,
  Plus,
  Save,
  Trash2,
  Info,
  Mail,
  Globe,
  Upload,
  Check,
  Lock,
  HelpCircle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UploadFile } from "@/api/integrations";

export default function AdminPlatformSettingsPage() {
  const { user: currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");
  const [platformSettings, setPlatformSettings] = useState({
    general: {
      platformName: "LUCY",
      tagline: "Your music career, simplified.",
      supportEmail: "support@lucy-music.com",
      allowPublicRegistration: true,
      requireEmailVerification: true,
      maintenanceMode: false
    },
    appearance: {
      primaryColor: "#8b5cf6", // Purple
      accentColor: "#3b82f6", // Blue
      darkMode: true,
      logoUrl: "",
      faviconUrl: ""
    }
  });
  
  const [digitalStores, setDigitalStores] = useState([]);
  const [showAddStoreDialog, setShowAddStoreDialog] = useState(false);
  const [newStore, setNewStore] = useState({
    name: "",
    website: "",
    logo_url: "",
    submission_fee: 0
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteStoreDialog, setShowDeleteStoreDialog] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState(null);
  
  // Check admin status and fetch data
  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      if (!currentUser) return;
      setIsLoading(true);
      try {
        const adminStatus = await adminAPI.isAdmin();
        setIsAdmin(adminStatus);
        
        if (adminStatus) {
          const stores = await DigitalStore.list();
          setDigitalStores(stores);
        }
      } catch (error) {
        console.error("Error checking admin status or fetching data:", error);
        setIsAdmin(false);
      }
      setIsLoading(false);
    };

    checkAdminAndFetchData();
  }, [currentUser]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };
  
  const handleSaveGeneralSettings = async () => {
    setIsSaving(true);
    try {
      // In a real implementation, you would save the settings to your backend
      // await platformApi.updateSettings(platformSettings.general);
      setTimeout(() => {
        alert("General settings saved successfully");
        setIsSaving(false);
      }, 800);
    } catch (error) {
      console.error("Error saving general settings:", error);
      alert("Failed to save settings. Please try again.");
      setIsSaving(false);
    }
  };
  
  const handleSaveAppearanceSettings = async () => {
    setIsSaving(true);
    try {
      // In a real implementation, you would save the settings to your backend
      // await platformApi.updateAppearance(platformSettings.appearance);
      setTimeout(() => {
        alert("Appearance settings saved successfully");
        setIsSaving(false);
      }, 800);
    } catch (error) {
      console.error("Error saving appearance settings:", error);
      alert("Failed to save settings. Please try again.");
      setIsSaving(false);
    }
  };
  
  const handleAddStore = async () => {
    if (!newStore.name) return;
    
    setIsSaving(true);
    try {
      let logo_url = newStore.logo_url;
      
      if (logoFile) {
        const uploadedLogo = await UploadFile({ file: logoFile });
        logo_url = uploadedLogo.file_url;
      }
      
      const storeData = {
        ...newStore,
        logo_url
      };
      
      const createdStore = await DigitalStore.create(storeData);
      setDigitalStores([...digitalStores, createdStore]);
      
      setNewStore({
        name: "",
        website: "",
        logo_url: "",
        submission_fee: 0
      });
      setLogoFile(null);
      setLogoPreview("");
      setShowAddStoreDialog(false);
    } catch (error) {
      console.error("Error adding store:", error);
      alert("Failed to add store. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const confirmDeleteStore = (store) => {
    setStoreToDelete(store);
    setShowDeleteStoreDialog(true);
  };
  
  const handleDeleteStore = async () => {
    if (!storeToDelete) return;
    
    try {
      await DigitalStore.delete(storeToDelete.id);
      setDigitalStores(digitalStores.filter(store => store.id !== storeToDelete.id));
      setShowDeleteStoreDialog(false);
      setStoreToDelete(null);
    } catch (error) {
      console.error("Error deleting store:", error);
      alert("Failed to delete store. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-128px)] text-white">
        <Loader2 className="w-12 h-12 animate-spin text-purple-400 mb-4" />
        <p className="text-xl">Loading Platform Settings...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <GlassCard className="p-8 mt-10 max-w-lg mx-auto text-center" glowColor="rgba(220, 38, 38, 0.1)">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-white/70">You do not have permission to view this page.</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <GlassCard className="p-6" glowColor="rgba(139, 92, 246, 0.1)">
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-purple-300" />
          <div>
            <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
            <p className="text-white/70">Configure global platform settings and options</p>
          </div>
        </div>
      </GlassCard>

      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-white/5 border border-white/10">
          <TabsTrigger value="general" className="flex-1 data-[state=active]:bg-white/10">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="stores" className="flex-1 data-[state=active]:bg-white/10">
            <StoreIcon className="h-4 w-4 mr-2" />
            Digital Stores
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-6 space-y-6">
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">General Settings</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="platformName" className="text-white">Platform Name</Label>
                  <Input
                    id="platformName"
                    value={platformSettings.general.platformName}
                    onChange={(e) => setPlatformSettings({
                      ...platformSettings,
                      general: { ...platformSettings.general, platformName: e.target.value }
                    })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tagline" className="text-white">Tagline</Label>
                  <Input
                    id="tagline"
                    value={platformSettings.general.tagline}
                    onChange={(e) => setPlatformSettings({
                      ...platformSettings,
                      general: { ...platformSettings.general, tagline: e.target.value }
                    })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supportEmail" className="text-white">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={platformSettings.general.supportEmail}
                    onChange={(e) => setPlatformSettings({
                      ...platformSettings,
                      general: { ...platformSettings.general, supportEmail: e.target.value }
                    })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
              
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-medium text-white">Access Settings</h3>
                
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="font-medium text-white">Public Registration</p>
                    <p className="text-sm text-white/70">Allow users to register without an invitation</p>
                  </div>
                  <Switch 
                    checked={platformSettings.general.allowPublicRegistration}
                    onCheckedChange={(value) => setPlatformSettings({
                      ...platformSettings,
                      general: { ...platformSettings.general, allowPublicRegistration: value }
                    })}
                    className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                  />
                </div>
                
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="font-medium text-white">Email Verification</p>
                    <p className="text-sm text-white/70">Require users to verify their email</p>
                  </div>
                  <Switch 
                    checked={platformSettings.general.requireEmailVerification}
                    onCheckedChange={(value) => setPlatformSettings({
                      ...platformSettings,
                      general: { ...platformSettings.general, requireEmailVerification: value }
                    })}
                    className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                  />
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="font-medium text-white">Maintenance Mode</p>
                    <p className="text-sm text-white/70">Take the entire platform offline for maintenance</p>
                  </div>
                  <Switch 
                    checked={platformSettings.general.maintenanceMode}
                    onCheckedChange={(value) => setPlatformSettings({
                      ...platformSettings,
                      general: { ...platformSettings.general, maintenanceMode: value }
                    })}
                    className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <Button 
                onClick={handleSaveGeneralSettings}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </GlassCard>
          
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Appearance Settings</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor" className="text-white">Primary Color</Label>
                  <div className="flex gap-3">
                    <div 
                      className="w-12 h-10 rounded border border-white/20"
                      style={{ backgroundColor: platformSettings.appearance.primaryColor }}
                    ></div>
                    <Input
                      id="primaryColor"
                      type="text"
                      value={platformSettings.appearance.primaryColor}
                      onChange={(e) => setPlatformSettings({
                        ...platformSettings,
                        appearance: { ...platformSettings.appearance, primaryColor: e.target.value }
                      })}
                      className="flex-1 bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accentColor" className="text-white">Accent Color</Label>
                  <div className="flex gap-3">
                    <div 
                      className="w-12 h-10 rounded border border-white/20"
                      style={{ backgroundColor: platformSettings.appearance.accentColor }}
                    ></div>
                    <Input
                      id="accentColor"
                      type="text"
                      value={platformSettings.appearance.accentColor}
                      onChange={(e) => setPlatformSettings({
                        ...platformSettings,
                        appearance: { ...platformSettings.appearance, accentColor: e.target.value }
                      })}
                      className="flex-1 bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="font-medium text-white">Dark Mode</p>
                  <p className="text-sm text-white/70">Enable dark mode by default</p>
                </div>
                <Switch 
                  checked={platformSettings.appearance.darkMode}
                  onCheckedChange={(value) => setPlatformSettings({
                    ...platformSettings,
                    appearance: { ...platformSettings.appearance, darkMode: value }
                  })}
                  className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                />
              </div>
              
              <div className="space-y-6 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="logoUpload" className="text-white">Platform Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 border border-white/20 rounded flex items-center justify-center bg-white/10">
                      {platformSettings.appearance.logoUrl ? (
                        <img 
                          src={platformSettings.appearance.logoUrl} 
                          alt="Logo" 
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <Upload className="w-6 h-6 text-white/40" />
                      )}
                    </div>
                    <Input
                      id="logoUpload"
                      type="file"
                      onChange={(e) => {
                        // In a real implementation, handle the file upload
                        alert("In a real implementation, this would upload a file");
                      }}
                      className="flex-1 bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <p className="text-xs text-white/60">Recommended size: 200x60px</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="faviconUpload" className="text-white">Favicon</Label>
                  <Input
                    id="faviconUpload"
                    type="file"
                    onChange={(e) => {
                      // In a real implementation, handle the file upload
                      alert("In a real implementation, this would upload a favicon");
                    }}
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <p className="text-xs text-white/60">Recommended size: 32x32px</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <Button 
                onClick={handleSaveAppearanceSettings}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isSaving ? "Saving..." : "Save Appearance"}
              </Button>
            </div>
          </GlassCard>
        </TabsContent>
        
        <TabsContent value="stores" className="mt-6">
          <GlassCard className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Digital Store Management</h2>
                <p className="text-white/70">Configure stores available for distribution</p>
              </div>
              
              <Button 
                onClick={() => setShowAddStoreDialog(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Store
              </Button>
            </div>
            
            {digitalStores.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/20 rounded-md">
                <StoreIcon className="mx-auto h-12 w-12 text-white/20 mb-4" />
                <h3 className="text-xl font-medium text-white">No Stores Configured</h3>
                <p className="text-white/60 mt-2 mb-4">Add digital stores for artists to distribute their music to.</p>
                <Button 
                  onClick={() => setShowAddStoreDialog(true)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add First Store
                </Button>
              </div>
            ) : (
              <div className="rounded-md border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="hover:bg-transparent border-white/10">
                      <TableHead className="text-white">Store</TableHead>
                      <TableHead className="text-white">Website</TableHead>
                      <TableHead className="text-white text-right">Submission Fee</TableHead>
                      <TableHead className="text-white text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {digitalStores.map((store) => (
                      <TableRow key={store.id} className="border-white/10 hover:bg-white/5">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 border border-white/10 rounded bg-white/10 p-1 flex items-center justify-center">
                              {store.logo_url ? (
                                <img 
                                  src={store.logo_url} 
                                  alt={store.name}
                                  className="max-w-full max-h-full object-contain"
                                />
                              ) : (
                                <StoreIcon className="w-6 h-6 text-white/60" />
                              )}
                            </div>
                            <span className="text-white font-medium">{store.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-white/60" />
                            <a 
                              href={store.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 hover:underline"
                            >
                              {store.website?.replace(/^https?:\/\//, '')}
                            </a>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {store.submission_fee ? `$${store.submission_fee.toFixed(2)}` : "Free"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => confirmDeleteStore(store)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            <div className="flex items-center gap-2 mt-6 text-sm text-white/70 bg-blue-500/10 p-3 rounded-md">
              <Info className="h-4 w-4 text-blue-400" />
              <p>Digital stores are platforms where artists can distribute their music. 
                 Configure the list of available platforms for your users.</p>
            </div>
          </GlassCard>
        </TabsContent>
      </Tabs>

      {/* Add Store Dialog */}
      <Dialog open={showAddStoreDialog} onOpenChange={setShowAddStoreDialog}>
        <DialogContent className="bg-black/70 backdrop-blur-xl text-white border-white/20 max-w-md">
          <DialogHeader>
            <DialogTitle>Add Digital Store</DialogTitle>
            <DialogDescription className="text-white/70">
              Add a new digital music store for distribution.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="storeName" className="text-white">Store Name</Label>
              <Input
                id="storeName"
                value={newStore.name}
                onChange={(e) => setNewStore({...newStore, name: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
                placeholder="e.g., Spotify"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="storeWebsite" className="text-white">Website URL</Label>
              <Input
                id="storeWebsite"
                type="url"
                value={newStore.website}
                onChange={(e) => setNewStore({...newStore, website: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
                placeholder="e.g., https://spotify.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="storeFee" className="text-white">Submission Fee (USD)</Label>
              <Input
                id="storeFee"
                type="number"
                min="0"
                step="0.01"
                value={newStore.submission_fee}
                onChange={(e) => setNewStore({...newStore, submission_fee: parseFloat(e.target.value) || 0})}
                className="bg-white/10 border-white/20 text-white"
                placeholder="0.00"
              />
              <p className="text-xs text-white/60">Leave as 0 for free submission</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="storeLogo" className="text-white">Store Logo</Label>
              <Input
                id="storeLogo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="bg-white/10 border-white/20 text-white"
              />
              {logoPreview && (
                <div className="mt-2 p-2 bg-white/10 rounded border border-white/20 inline-flex">
                  <img 
                    src={logoPreview} 
                    alt="Logo Preview"
                    className="h-12 object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="text-white bg-white/5">
                Cancel
              </Button>
            </DialogClose>
            <Button 
              onClick={handleAddStore} 
              disabled={!newStore.name || isSaving}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              {isSaving ? "Adding..." : "Add Store"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Store Confirmation Dialog */}
      <Dialog open={showDeleteStoreDialog} onOpenChange={setShowDeleteStoreDialog}>
        <DialogContent className="bg-black/70 backdrop-blur-xl text-white border-white/20 max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Store</DialogTitle>
            <DialogDescription className="text-white/70">
              Are you sure you want to delete <strong className="text-white">{storeToDelete?.name}</strong>? 
              This will remove the store from distribution options.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="text-white bg-white/5">
                Cancel
              </Button>
            </DialogClose>
            <Button 
              onClick={handleDeleteStore}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
