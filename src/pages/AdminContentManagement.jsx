import React, { useState, useEffect } from "react";
import { Track, Release } from "@/api/entities";
import { useAuth } from "@/contexts/AuthContext";
import { adminAPI } from "@/api/admin";
import GlassCard from "../components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  AlertTriangle,
  Loader2,
  ListMusic,
  Disc3,
  Search,
  MoreHorizontal,
  Eye,
  Trash2,
  Check,
  X,
  Music,
  User as UserIcon,
  Calendar,
  Clock,
  Tag,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, parseISO } from "date-fns";

export default function AdminContentManagementPage() {
  const { user: currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tracks, setTracks] = useState([]);
  const [releases, setReleases] = useState([]);
  const [filteredTracks, setFilteredTracks] = useState([]);
  const [filteredReleases, setFilteredReleases] = useState([]);
  const [trackSearchQuery, setTrackSearchQuery] = useState("");
  const [releaseSearchQuery, setReleaseSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("tracks");
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // Check admin status and fetch content
  useEffect(() => {
    const checkAdminAndFetchContent = async () => {
      if (!currentUser) return;
      setIsLoading(true);
      try {
        const adminStatus = await adminAPI.isAdmin();
        setIsAdmin(adminStatus);
        
        if (adminStatus) {
          const [allTracks, allReleases] = await Promise.all([
            Track.list(),
            Release.list()
          ]);
          setTracks(allTracks);
          setFilteredTracks(allTracks);
          setReleases(allReleases);
          setFilteredReleases(allReleases);
        }
      } catch (error) {
        console.error("Error checking admin status or fetching content:", error);
        setIsAdmin(false);
      }
      setIsLoading(false);
    };

    checkAdminAndFetchContent();
  }, [currentUser]);

  // Filter tracks based on search
  useEffect(() => {
    if (trackSearchQuery) {
      const lowerQuery = trackSearchQuery.toLowerCase();
      setFilteredTracks(
        tracks.filter(track => 
          track.title?.toLowerCase().includes(lowerQuery) || 
          track.artist_name?.toLowerCase().includes(lowerQuery)
        )
      );
    } else {
      setFilteredTracks(tracks);
    }
  }, [trackSearchQuery, tracks]);

  // Filter releases based on search
  useEffect(() => {
    if (releaseSearchQuery) {
      const lowerQuery = releaseSearchQuery.toLowerCase();
      setFilteredReleases(
        releases.filter(release => 
          release.title?.toLowerCase().includes(lowerQuery) || 
          release.artist_name?.toLowerCase().includes(lowerQuery)
        )
      );
    } else {
      setFilteredReleases(releases);
    }
  }, [releaseSearchQuery, releases]);

  const getInitials = (name) => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  };
  
  const formatDuration = (seconds) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleViewDetails = (item, type) => {
    setSelectedItem({...item, type});
    setShowDetailsDialog(true);
  };
  
  const handleDeleteConfirm = (item, type) => {
    setItemToDelete({...item, type});
    setShowDeleteConfirmDialog(true);
  };
  
  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      if (itemToDelete.type === 'track') {
        await Track.delete(itemToDelete.id);
        setTracks(prev => prev.filter(t => t.id !== itemToDelete.id));
      } else if (itemToDelete.type === 'release') {
        await Release.delete(itemToDelete.id);
        setReleases(prev => prev.filter(r => r.id !== itemToDelete.id));
      }
      setItemToDelete(null);
      setShowDeleteConfirmDialog(false);
    } catch (error) {
      console.error(`Error deleting ${itemToDelete.type}:`, error);
      alert(`Failed to delete ${itemToDelete.type}. Please try again.`);
    }
  };

  const handleModerateContent = async (item, approved) => {
    try {
      if (item.type === 'track') {
        // In a real implementation, update the track's status
        // await Track.update(item.id, { moderation_status: approved ? 'approved' : 'rejected' });
        alert(`Track "${item.title}" has been ${approved ? 'approved' : 'rejected'}.`);
      } else if (item.type === 'release') {
        // In a real implementation, update the release's status
        // await Release.update(item.id, { moderation_status: approved ? 'approved' : 'rejected' });
        alert(`Release "${item.title}" has been ${approved ? 'approved' : 'rejected'}.`);
      }
      setShowDetailsDialog(false);
    } catch (error) {
      console.error(`Error moderating ${item.type}:`, error);
      alert(`Failed to update ${item.type} status. Please try again.`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-128px)] text-white">
        <Loader2 className="w-12 h-12 animate-spin text-purple-400 mb-4" />
        <p className="text-xl">Loading Content Management...</p>
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
      <GlassCard className="p-6" glowColor="rgba(0, 112, 243, 0.1)">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Content Management</h1>
            <p className="text-white/70">Monitor and manage user-generated content</p>
          </div>
        </div>
      </GlassCard>

      <Tabs defaultValue="tracks" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-white/5 border border-white/10">
          <TabsTrigger value="tracks" className="flex-1 data-[state=active]:bg-white/10">
            <Music className="h-4 w-4 mr-2" />
            Tracks ({tracks.length})
          </TabsTrigger>
          <TabsTrigger value="releases" className="flex-1 data-[state=active]:bg-white/10">
            <Disc3 className="h-4 w-4 mr-2" />
            Releases ({releases.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tracks" className="mt-6">
          <GlassCard className="p-6">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
              <Input 
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 w-full"
                placeholder="Search tracks by title or artist..."
                value={trackSearchQuery}
                onChange={(e) => setTrackSearchQuery(e.target.value)}
              />
            </div>

            {filteredTracks.length === 0 ? (
              <div className="text-center py-12">
                <ListMusic className="mx-auto h-12 w-12 text-white/20 mb-4" />
                <h3 className="text-xl font-medium text-white">No Tracks Found</h3>
                <p className="text-white/60 mt-2">Try adjusting your search</p>
              </div>
            ) : (
              <div className="rounded-md border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="hover:bg-transparent border-white/10">
                      <TableHead className="text-white">Title</TableHead>
                      <TableHead className="text-white">Artist</TableHead>
                      <TableHead className="text-white">Duration</TableHead>
                      <TableHead className="text-white">Genre</TableHead>
                      <TableHead className="text-white text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTracks.map((track) => (
                      <TableRow key={track.id} className="border-white/10 hover:bg-white/5">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img 
                              src={track.cover_art_url || 'https://via.placeholder.com/40/2d3748/a0aec0?text=Music'} 
                              alt={track.title}
                              className="h-10 w-10 rounded object-cover"
                            />
                            <span className="text-white font-medium">{track.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-white/60" />
                            <span className="text-white/80">{track.artist_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-white/60" />
                            <span className="text-white/70">{formatDuration(track.duration_seconds)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Tag className="h-4 w-4 text-white/60" />
                            <span className="text-white/70">{track.genre || "Unspecified"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4 text-white/70" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-black/70 backdrop-blur-md text-white border-white/20">
                              <DropdownMenuItem 
                                onClick={() => handleViewDetails(track, 'track')}
                                className="cursor-pointer hover:bg-white/10"
                              >
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteConfirm(track, 'track')}
                                className="cursor-pointer hover:bg-white/10 text-red-400"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Track
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </GlassCard>
        </TabsContent>
        
        <TabsContent value="releases" className="mt-6">
          <GlassCard className="p-6">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
              <Input 
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 w-full"
                placeholder="Search releases by title or artist..."
                value={releaseSearchQuery}
                onChange={(e) => setReleaseSearchQuery(e.target.value)}
              />
            </div>

            {filteredReleases.length === 0 ? (
              <div className="text-center py-12">
                <Disc3 className="mx-auto h-12 w-12 text-white/20 mb-4" />
                <h3 className="text-xl font-medium text-white">No Releases Found</h3>
                <p className="text-white/60 mt-2">Try adjusting your search</p>
              </div>
            ) : (
              <div className="rounded-md border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="hover:bg-transparent border-white/10">
                      <TableHead className="text-white">Title</TableHead>
                      <TableHead className="text-white">Artist</TableHead>
                      <TableHead className="text-white">Type</TableHead>
                      <TableHead className="text-white">Release Date</TableHead>
                      <TableHead className="text-white">Status</TableHead>
                      <TableHead className="text-white text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReleases.map((release) => (
                      <TableRow key={release.id} className="border-white/10 hover:bg-white/5">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img 
                              src={release.cover_art_url || 'https://via.placeholder.com/40/2d3748/a0aec0?text=Album'} 
                              alt={release.title}
                              className="h-10 w-10 rounded object-cover"
                            />
                            <span className="text-white font-medium">{release.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-white/60" />
                            <span className="text-white/80">{release.artist_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-purple-500/20 text-purple-300 capitalize">
                            {release.release_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-white/60" />
                            <span className="text-white/70">
                              {release.release_date ? format(parseISO(release.release_date), "MMM d, yyyy") : "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            release.status === 'live' ? "bg-green-500/20 text-green-300" :
                            release.status === 'submitted' ? "bg-blue-500/20 text-blue-300" :
                            release.status === 'rejected' ? "bg-red-500/20 text-red-300" :
                            "bg-yellow-500/20 text-yellow-300"
                          }>
                            {release.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4 text-white/70" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-black/70 backdrop-blur-md text-white border-white/20">
                              <DropdownMenuItem 
                                onClick={() => handleViewDetails(release, 'release')}
                                className="cursor-pointer hover:bg-white/10"
                              >
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteConfirm(release, 'release')}
                                className="cursor-pointer hover:bg-white/10 text-red-400"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Release
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </GlassCard>
        </TabsContent>
      </Tabs>

      {/* Content Details Dialog */}
      <Dialog open={showDetailsDialog && selectedItem !== null} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="bg-black/70 backdrop-blur-xl text-white border-white/20 max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.type === 'track' ? 'Track Details' : 'Release Details'}
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-6 py-4">
              <div className="flex gap-4">
                <img 
                  src={selectedItem.cover_art_url || 'https://via.placeholder.com/100/2d3748/a0aec0?text=Cover'} 
                  alt={selectedItem.title}
                  className="h-24 w-24 rounded-md object-cover"
                />
                <div>
                  <h3 className="text-xl font-medium text-white">{selectedItem.title}</h3>
                  <p className="text-white/70">{selectedItem.artist_name}</p>
                  
                  {selectedItem.type === 'track' ? (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-blue-500/20 text-blue-300">Track</Badge>
                      {selectedItem.genre && (
                        <Badge className="bg-purple-500/20 text-purple-300">{selectedItem.genre}</Badge>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-purple-500/20 text-purple-300 capitalize">
                        {selectedItem.release_type}
                      </Badge>
                      <Badge className={
                        selectedItem.status === 'live' ? "bg-green-500/20 text-green-300" :
                        selectedItem.status === 'submitted' ? "bg-blue-500/20 text-blue-300" :
                        selectedItem.status === 'rejected' ? "bg-red-500/20 text-red-300" :
                        "bg-yellow-500/20 text-yellow-300"
                      }>
                        {selectedItem.status}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedItem.type === 'track' && (
                  <>
                    <div className="bg-white/5 p-3 rounded-md">
                      <p className="text-xs text-white/70">Duration</p>
                      <p className="text-white">{formatDuration(selectedItem.duration_seconds)}</p>
                    </div>
                    {selectedItem.audio_file_url && (
                      <div className="bg-white/5 p-3 rounded-md sm:col-span-2">
                        <p className="text-xs text-white/70 mb-2">Audio Preview</p>
                        <audio 
                          controls 
                          src={selectedItem.audio_file_url}
                          className="w-full h-8"
                        >
                          Your browser does not support audio playback.
                        </audio>
                      </div>
                    )}
                    {selectedItem.lyrics && (
                      <div className="bg-white/5 p-3 rounded-md sm:col-span-2">
                        <p className="text-xs text-white/70">Lyrics</p>
                        <p className="text-white text-sm whitespace-pre-wrap max-h-40 overflow-y-auto mt-1">
                          {selectedItem.lyrics}
                        </p>
                      </div>
                    )}
                  </>
                )}
                
                {selectedItem.type === 'release' && (
                  <>
                    <div className="bg-white/5 p-3 rounded-md">
                      <p className="text-xs text-white/70">Release Date</p>
                      <p className="text-white">
                        {selectedItem.release_date ? 
                          format(parseISO(selectedItem.release_date), "MMMM d, yyyy") : 
                          "Not set"
                        }
                      </p>
                    </div>
                    {selectedItem.genre && (
                      <div className="bg-white/5 p-3 rounded-md">
                        <p className="text-xs text-white/70">Genre</p>
                        <p className="text-white">{selectedItem.genre}</p>
                      </div>
                    )}
                    <div className="bg-white/5 p-3 rounded-md">
                      <p className="text-xs text-white/70">Track Count</p>
                      <p className="text-white">{selectedItem.track_ids?.length || 0} tracks</p>
                    </div>
                  </>
                )}
              </div>
              
              {/* Moderation Actions */}
              <div className="flex justify-between pt-3">
                <div className="flex gap-3">
                  <Button 
                    onClick={() => handleModerateContent(selectedItem, true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button 
                    onClick={() => handleModerateContent(selectedItem, false)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
                <DialogClose asChild>
                  <Button variant="outline" className="text-white bg-white/5">
                    Close
                  </Button>
                </DialogClose>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent className="bg-black/70 backdrop-blur-xl text-white border-white/20 max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription className="text-white/70">
              {itemToDelete?.type === 'track' 
                ? `Are you sure you want to delete the track "${itemToDelete?.title}"?` 
                : `Are you sure you want to delete the release "${itemToDelete?.title}"?`}
              <br/><br/>
              <span className="text-red-400">This action cannot be undone.</span>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="text-white bg-white/5">
                Cancel
              </Button>
            </DialogClose>
            <Button 
              onClick={handleDelete}
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