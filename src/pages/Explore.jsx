
import React, { useState, useEffect } from 'react';
import { User, Follow, Collaboration } from '@/api/entities';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import StudioPanel from '../components/StudioPanel';
import ActionButton from '../components/ActionButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnimatedIcon from '../components/AnimatedIcon';
import LordIcon from '../components/LordIcon';
import MentorSelectionModal from '../components/studio/MentorSelectionModal';
import ExpertConsultationModal from '../components/studio/ExpertConsultationModal';
import Web3StudioModal from '../components/web3/Web3StudioModal';
import CreateCollaborationModal from '../components/CreateCollaborationModal';

const OpportunityCard = ({ icon, title, description, buttonText, gradient, onClick }) => (
  <StudioPanel className="p-6 flex flex-col justify-between h-full transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
    <div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} mb-4`}>
        <LordIcon icon={icon} size={24} className="text-white" />
      </div>
      <h3 className="font-bold text-lg text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 mb-4">{description}</p>
    </div>
    <ActionButton variant="secondary" className="w-full mt-2" onClick={onClick}>
        {buttonText}
    </ActionButton>
  </StudioPanel>
);

const ArtistCard = ({ artist, currentUser, onFollowToggle, isFollowing, onCollaborate }) => {
  const [isLoading, setIsLoading] = useState(false);

  const getInitials = (name) => {
    if (!name) return "?";
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : names[0][0];
  };

  const handleFollow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    await onFollowToggle(artist.id, isFollowing);
    setIsLoading(false);
  };

  const handleCollaborate = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onCollaborate(artist);
  };

  return (
    <Link to={createPageUrl(`Artist?id=${artist.id}`)} className="block group">
      <StudioPanel className="p-4 flex flex-col items-center text-center transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-lg w-full h-full">
        <Avatar className="w-20 h-20 mb-4 border-4 border-white shadow-lg">
          <AvatarImage src={artist.profile_image_url} alt={artist.artist_name || artist.full_name} />
          <AvatarFallback className="text-2xl bg-purple-100 text-purple-700">
            {getInitials(artist.artist_name || artist.full_name)}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-bold text-lg text-slate-900 truncate w-full px-2">
          {artist.artist_name || artist.full_name}
        </h3>
        {artist.genre && (
          <Badge variant="secondary" className="my-2 text-xs">{artist.genre}</Badge>
        )}
        <p className="text-sm text-slate-500 flex-grow">{artist.followers_count || 0} followers</p>
        
        {currentUser && currentUser.id !== artist.id && (
          <div className="flex gap-2 mt-4 w-full">
            <ActionButton 
              size="sm" 
              className="flex-1" 
              variant={isFollowing ? "secondary" : "primary"}
              onClick={handleFollow}
              disabled={isLoading}
              icon={isLoading ? "loading" : (isFollowing ? "check" : "userPlus")}
            >
              {isLoading ? '...' : (isFollowing ? 'Following' : 'Follow')}
            </ActionButton>
            <ActionButton 
              size="sm" 
              variant="secondary" 
              className="flex-1"
              onClick={handleCollaborate}
              icon="collaborate"
            >
              Collab
            </ActionButton>
          </div>
        )}
      </StudioPanel>
    </Link>
  );
};

const CollaborationCard = ({ collab, currentUser }) => {
  const navigate = useNavigate();
  
  const getInitials = (name) => {
    if (!name) return "?";
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : names[0][0];
  };

  const isOwner = collab.creator_id === currentUser?.id;
  const isMember = collab.collaborator_ids.includes(currentUser?.id);
  const canJoin = !isOwner && !isMember;

  const handleJoinCollaboration = async () => {
    try {
      // Add current user to collaborators
      const updatedCollaboratorIds = [...collab.collaborator_ids, currentUser.id];
      await Collaboration.update(collab.id, {
        collaborator_ids: updatedCollaboratorIds
      });
      // Refresh the page or update state
      window.location.reload();
    } catch (error) {
      console.error("Error joining collaboration:", error);
    }
  };

  const handleManageCollaboration = () => {
    // Navigate to a collaboration management page or open a modal
    // For now, we'll navigate to the chat room if it exists
    if (collab.chat_room_id) {
      navigate(createPageUrl(`Messenger?id=${collab.chat_room_id}`));
    }
  };

  const handleJoinConversation = () => {
    // Navigate to the collaboration's chat room
    if (collab.chat_room_id) {
      navigate(createPageUrl(`Messenger?id=${collab.chat_room_id}`));
    }
  };

  const handleCollaborationClick = () => {
    // If user is a member (owner or collaborator), take them to the conversation
    if (isMember) {
      handleJoinConversation();
    }
  };

  return (
    <StudioPanel 
      className={`p-6 transition-all duration-300 ${isMember ? 'cursor-pointer hover:scale-[1.02] hover:shadow-lg' : ''}`}
      onClick={isMember ? handleCollaborationClick : undefined}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{collab.title}</h3>
          <p className="text-sm text-slate-600">by {collab.creator_name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={collab.status === 'active' ? 'default' : 'secondary'} className="capitalize">
            {collab.status}
          </Badge>
          {isMember && (
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              Member
            </Badge>
          )}
        </div>
      </div>
      
      <p className="text-sm text-slate-700 mb-4">{collab.description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">{collab.type}</Badge>
          <span className="text-xs text-slate-500">
            {collab.collaborator_ids.length} collaborator{collab.collaborator_ids.length !== 1 ? 's' : ''}
          </span>
          {collab.due_date && (
            <span className="text-xs text-slate-500">
              • Due {new Date(collab.due_date).toLocaleDateString()}
            </span>
          )}
        </div>
        
        <div onClick={(e) => e.stopPropagation()}>
          {isOwner ? (
            <ActionButton 
              size="sm" 
              onClick={handleManageCollaboration}
              icon="settings"
              variant="secondary"
            >
              Manage
            </ActionButton>
          ) : isMember ? (
            <ActionButton 
              size="sm" 
              onClick={handleJoinConversation}
              icon="message"
              variant="secondary"
            >
              Chat
            </ActionButton>
          ) : canJoin ? (
            <ActionButton 
              size="sm" 
              onClick={handleJoinCollaboration}
              icon="userPlus"
            >
              Join
            </ActionButton>
          ) : null}
        </div>
      </div>
    </StudioPanel>
  );
};

export default function ExplorePage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [artists, setArtists] = useState([]);
  const [collaborations, setCollaborations] = useState([]);
  const [followingIds, setFollowingIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showMentorSelectionModal, setShowMentorSelectionModal] = useState(false);
  const [showExpertConsultationModal, setShowExpertConsultationModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showWeb3StudioModal, setShowWeb3StudioModal] = useState(false);
  const [showCreateCollabModal, setShowCreateCollabModal] = useState(false);
  const [collaborateWithArtist, setCollaborateWithArtist] = useState(null);

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const allUsers = await User.list().catch(() => []);
      const otherUsers = allUsers.filter(u => u.id !== currentUser.id);
      setArtists(otherUsers);

      // Load active collaborations
      const activeCollabs = await Collaboration.filter({ status: 'active' }, '-created_date').catch(() => []);
      setCollaborations(activeCollabs);

      const follows = await Follow.filter({ follower_id: currentUser.id }).catch(() => []);
      setFollowingIds(new Set(follows.map(f => f.following_id)));
    } catch (error) {
      console.error("Error fetching data for Explore page:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowToggle = async (artistId, isCurrentlyFollowing) => {
    if (!currentUser) return;

    try {
      if (isCurrentlyFollowing) {
        const follows = await Follow.filter({ 
          follower_id: currentUser.id, 
          following_id: artistId 
        });
        if (follows.length > 0) {
          await Follow.delete(follows[0].id);
          setFollowingIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(artistId);
            return newSet;
          });
          setArtists(prev => prev.map(artist => 
            artist.id === artistId 
              ? { ...artist, followers_count: Math.max(0, (artist.followers_count || 1) - 1) }
              : artist
          ));
        }
      } else {
        await Follow.create({
          follower_id: currentUser.id,
          following_id: artistId
        });
        setFollowingIds(prev => new Set([...prev, artistId]));
        setArtists(prev => prev.map(artist => 
          artist.id === artistId 
            ? { ...artist, followers_count: (artist.followers_count || 0) + 1 }
            : artist
        ));
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };
  
  const handleMentorSelect = (mentor) => {
      setSelectedMentor(mentor);
      setShowMentorSelectionModal(false);
      setShowExpertConsultationModal(true);
  };

  const handleCollaborateWithArtist = (artist) => {
    setCollaborateWithArtist(artist);
    setShowCreateCollabModal(true);
  };

  const handleCollaborationCreated = () => {
    setShowCreateCollabModal(false);
    setCollaborateWithArtist(null);
    fetchData(); // Refresh collaborations
  };

  const filteredArtists = artists.filter(artist => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (artist.artist_name || artist.full_name || '').toLowerCase().includes(query) ||
      (artist.genre || '').toLowerCase().includes(query)
    );
  });

  const filteredCollaborations = collaborations.filter(collab => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      collab.title.toLowerCase().includes(query) ||
      collab.description.toLowerCase().includes(query) ||
      collab.type.toLowerCase().includes(query)
    );
  });
  
  const opportunities = [
    {
      icon: "userCheck",
      title: "Mentor Session",
      description: "Book a one-on-one call with a music industry expert for personalized guidance.",
      buttonText: "Book a Call",
      onClick: () => setShowMentorSelectionModal(true),
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: "star",
      title: "Web3 Fan Drops",
      description: "Launch exclusive digital collectibles and NFT collections for your top supporters.",
      buttonText: "Open Web3 Studio",
      onClick: () => setShowWeb3StudioModal(true),
      gradient: "from-violet-500 to-fuchsia-500"
    },
    {
        icon: "promote",
        title: "Promotion Campaigns",
        description: "Create smart links and promotional campaigns to market your music effectively.",
        buttonText: "Launch Campaign",
        onClick: () => navigate(createPageUrl('Promotion')),
        gradient: "from-pink-500 to-rose-500"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <AnimatedIcon icon="loading" size={32} trigger="spin" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Explore</h1>
          <p className="text-lg text-slate-700 mt-1">Discover artists, find collaborators, and unlock new opportunities.</p>
        </div>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Growth Opportunities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map(opp => (
              <OpportunityCard key={opp.title} {...opp} />
            ))}
          </div>
        </section>

        <section>
          <Tabs defaultValue="artists" className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <TabsList className="grid w-full md:w-auto grid-cols-2">
                <TabsTrigger value="artists">Discover Artists</TabsTrigger>
                <TabsTrigger value="collaborations">Collaborations</TabsTrigger>
              </TabsList>
              
              <div className="flex gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none md:w-80">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <LordIcon icon="search" size={16} />
                  </div>
                  <Input
                    type="search"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-slate-200 rounded-xl"
                  />
                </div>
                <ActionButton onClick={() => setShowCreateCollabModal(true)} icon="plus">
                  New Collab
                </ActionButton>
              </div>
            </div>

            <TabsContent value="artists" className="space-y-6">
              {filteredArtists.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredArtists.map(artist => (
                    <ArtistCard 
                      key={artist.id} 
                      artist={artist} 
                      currentUser={currentUser}
                      onFollowToggle={handleFollowToggle}
                      isFollowing={followingIds.has(artist.id)}
                      onCollaborate={handleCollaborateWithArtist}
                    />
                  ))}
                </div>
              ) : (
                <StudioPanel className="p-12 text-center">
                  <AnimatedIcon icon="users" size={64} className="mx-auto text-slate-300 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {searchQuery ? 'No artists found' : 'No artists yet'}
                  </h3>
                  <p className="text-slate-600">
                    {searchQuery 
                      ? 'Try adjusting your search terms.'
                      : 'Looks like you are the first one here!'
                    }
                  </p>
                </StudioPanel>
              )}
            </TabsContent>

            <TabsContent value="collaborations" className="space-y-6">
              {filteredCollaborations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCollaborations.map(collab => (
                    <CollaborationCard 
                      key={collab.id} 
                      collab={collab} 
                      currentUser={currentUser}
                    />
                  ))}
                </div>
              ) : (
                <StudioPanel className="p-12 text-center">
                  <AnimatedIcon icon="collaborate" size={64} className="mx-auto text-slate-300 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {searchQuery ? 'No collaborations found' : 'No open collaborations'}
                  </h3>
                  <p className="text-slate-600 mb-6">
                    {searchQuery 
                      ? 'Try adjusting your search terms.'
                      : 'Be the first to start a collaboration project!'
                    }
                  </p>
                  <ActionButton onClick={() => setShowCreateCollabModal(true)} icon="plus">
                    Start First Collaboration
                  </ActionButton>
                </StudioPanel>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </div>

      <MentorSelectionModal
        open={showMentorSelectionModal}
        onOpenChange={setShowMentorSelectionModal}
        onMentorSelect={handleMentorSelect}
      />
      
      {selectedMentor && (
        <ExpertConsultationModal 
          open={showExpertConsultationModal} 
          onOpenChange={setShowExpertConsultationModal} 
          user={currentUser} 
          mentor={selectedMentor}
        />
      )}

      <Web3StudioModal
        open={showWeb3StudioModal}
        onOpenChange={setShowWeb3StudioModal}
        user={currentUser}
      />

      <CreateCollaborationModal
        isOpen={showCreateCollabModal}
        onClose={() => {
          setShowCreateCollabModal(false);
          setCollaborateWithArtist(null);
        }}
        currentUser={currentUser}
        onSuccess={handleCollaborationCreated}
        initialCollaborator={collaborateWithArtist}
      />
    </>
  );
}
