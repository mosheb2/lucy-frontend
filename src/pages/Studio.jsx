
import React, { useState, useEffect, useCallback } from 'react';
import { Track, Release, SongRegistration } from '@/api/entities';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import StudioPanel from '../components/StudioPanel';
import ActionButton from '../components/ActionButton';
import AnimatedIcon from '../components/AnimatedIcon';
import CreateReleaseModal from '../components/studio/CreateReleaseModal';
import ReleaseDetailsModal from '../components/studio/ReleaseDetailsModal';
import { Disc, Clock, CheckCircle, XCircle, AlertTriangle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PRORegistrationModal from '../components/studio/PRORegistrationModal';
import CopyrightRegistrationModal from '../components/studio/CopyrightRegistrationModal';
import ExpertConsultationModal from '../components/studio/ExpertConsultationModal';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const getStatusColor = (status) => {
  switch (status) {
    case 'draft': return 'bg-slate-100 text-slate-800';
    case 'pending_review': return 'bg-yellow-100 text-yellow-800';
    case 'under_review': return 'bg-blue-100 text-blue-800';
    case 'approved': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'live': return 'bg-emerald-100 text-emerald-800';
    case 'processing': return 'bg-purple-100 text-purple-800';
    default: return 'bg-slate-100 text-slate-800';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'draft': return <Clock className="w-4 h-4" />;
    case 'pending_review':
    case 'under_review': return <AlertTriangle className="w-4 h-4" />;
    case 'approved':
    case 'live': return <CheckCircle className="w-4 h-4" />;
    case 'rejected': return <XCircle className="w-4 h-4" />;
    case 'processing': return <AnimatedIcon icon="loading" size={16} trigger="spin" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

export default function StudioPage() {
  const { user } = useAuth();
  const [releases, setReleases] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [songRegistrations, setSongRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('releases');
  const [splitTab, setSplitTab] = useState('overview');

  // Modal states
  const [showCreateRelease, setShowCreateRelease] = useState(false);
  const [showEditRelease, setShowEditRelease] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState(null);
  const [showPROModal, setShowPROModal] = useState(false);
  const [showCopyrightModal, setShowCopyrightModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [userReleases, userTracks, userSongRegistrations] = await Promise.all([
        Release.filter({ artist_id: user.id }, '-updated_date'),
        Track.filter({ artist_id: user.id }, '-updated_date'),
        SongRegistration.filter({ artist_id: user.id }, '-submission_date'),
      ]);
      setReleases(userReleases);
      setTracks(userTracks);
      setSongRegistrations(userSongRegistrations);
    } catch (error) {
      console.error("Error loading studio data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  const handleCreateRelease = () => {
    setSelectedRelease(null);
    setShowCreateRelease(true);
  };

  const handleEditRelease = (release) => {
    setSelectedRelease(release);
    if (release.status === 'draft') {
      setShowCreateRelease(true); // Use creation modal for editing drafts
    } else {
      setShowEditRelease(true); // Use details modal for viewing completed releases
    }
  };

  const handleSubmitForReview = async (releaseId, event) => {
    event.stopPropagation(); // Prevent card click

    try {
      await Release.update(releaseId, {
        status: 'pending_review',
        submission_notes: 'Submitted for review by artist.',
        submitted_date: new Date().toISOString()
      });
      loadData(); // Refresh the data
    } catch (error) {
      console.error('Error submitting release for review:', error);
      alert('Failed to submit release. Please try again.');
    }
  };

  const handleModalSuccess = () => {
    setShowCreateRelease(false);
    setShowEditRelease(false);
    setShowCopyrightModal(false); // Close copyright modal on success
    setShowConsultationModal(false); // Close consultation modal on success
    loadData();
  };

  // Helper functions for Split Management
  const getAllCollaborators = useCallback(() => {
    const collaboratorsMap = new Map();

    releases.forEach(release => {
      if (release.royalty_splits && release.royalty_splits.length > 0) {
        release.royalty_splits.forEach(split => {
          const key = split.email || split.name; // Use email as primary key, fallback to name
          if (!collaboratorsMap.has(key)) {
            collaboratorsMap.set(key, {
              name: split.name,
              email: split.email,
              role: split.role,
              releases: []
            });
          }
          collaboratorsMap.get(key).releases.push({
            releaseTitle: release.title,
            releaseId: release.id,
            percentage: split.percentage,
            role: split.role
          });
        });
      }
    });

    return Array.from(collaboratorsMap.values());
  }, [releases]);

  const getReleasesWithSplits = useCallback(() => {
    return releases.filter(release =>
      release.royalty_splits && release.royalty_splits.length > 0
    );
  }, [releases]);

  const collaborators = getAllCollaborators();
  const releasesWithSplits = getReleasesWithSplits();


  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <AnimatedIcon icon="loading" size={48} className="mx-auto mb-4 text-purple-600" trigger="spin" />
          <p className="text-slate-600">Loading your studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Studio</h1>
          <p className="text-lg text-slate-700 mt-1">Create, manage, and publish your music</p>
        </div>
        <ActionButton
          onClick={handleCreateRelease}
          size="lg"
          icon="plus"
          className="w-full sm:w-auto"
        >
          New Release
        </ActionButton>
      </div>

      {/* Studio Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('releases')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'releases'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Releases
          </button>
          <button
            onClick={() => setActiveTab('publishing')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'publishing'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Publishing & Rights
          </button>
           <button
            onClick={() => setActiveTab('splits')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'splits'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Split Management
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'submissions'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Submissions
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'releases' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-900">Your Releases</h3>
          </div>

          {releases.length === 0 ? (
            <div className="text-center py-16">
              <Disc className="mx-auto h-16 w-16 text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Releases Yet</h3>
              <p className="text-slate-600 mb-6">Create your first release to distribute your music</p>
              <ActionButton onClick={handleCreateRelease} icon="disc">Create Release</ActionButton>
            </div>
          ) : (
            <div className="grid gap-4">
              {releases.map((release) => {
                const releaseTracks = tracks.filter(track =>
                  release.track_ids?.includes(track.id)
                );

                const canSubmit = release.status === 'draft' && releaseTracks.length > 0 &&
                                release.title && release.genre && release.release_date &&
                                release.copyright_holder && release.phonographic_copyright;

                return (
                  <StudioPanel key={release.id} className="p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => handleEditRelease(release)}>
                        <img
                          src={release.cover_art_url || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=100&q=80'}
                          alt="cover"
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{release.title}</h4>
                          <p className="text-sm text-slate-500 capitalize">{release.release_type}</p>
                          <p className="text-xs text-slate-400">
                            Release Date: {release.release_date ? new Date(release.release_date).toLocaleDateString() : 'Not set'}
                          </p>
                          <p className="text-xs text-slate-400">
                            Genre: {release.genre || 'Not specified'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                        <div className="text-left sm:text-right">
                          <Badge className={getStatusColor(release.status)}>
                            {getStatusIcon(release.status)}
                            <span className="ml-1 capitalize">{release.status?.replace('_', ' ')}</span>
                          </Badge>
                          {releaseTracks.length > 0 && (
                            <Badge variant="outline" className="mt-1">
                              {releaseTracks.length} track{releaseTracks.length !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex sm:flex-col gap-2 pt-2 sm:pt-0">
                          {release.status === 'draft' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditRelease(release)}
                              className="whitespace-nowrap"
                            >
                              Edit Release
                            </Button>
                          )}

                          {canSubmit && (
                            <ActionButton
                              size="sm"
                              onClick={(e) => handleSubmitForReview(release.id, e)}
                              icon="send"
                              className="whitespace-nowrap"
                            >
                              Submit for Review
                            </ActionButton>
                          )}

                          {!canSubmit && release.status === 'draft' && (
                            <div className="text-xs text-slate-500 max-w-xs sm:max-w-32 self-center sm:self-auto">
                              {!releaseTracks.length ? 'Add tracks to submit' :
                               !release.title ? 'Add title to submit' :
                               !release.genre ? 'Add genre to submit' :
                               !release.release_date ? 'Add release date to submit' :
                               (!release.copyright_holder || !release.phonographic_copyright) ? 'Complete rights info to submit' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Show tracks for this release */}
                    {releaseTracks.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <h5 className="text-sm font-medium text-slate-700 mb-2">Tracks:</h5>
                        <div className="space-y-1">
                          {releaseTracks.map((track, index) => (
                            <div key={track.id} className="flex items-center gap-2 text-sm text-slate-600">
                              <span className="font-mono text-xs text-slate-400">{index + 1}.</span>
                              <span>{track.title}</span>
                              {track.duration_seconds && (
                                <span className="text-slate-400">
                                  ({Math.floor(track.duration_seconds / 60)}:{(track.duration_seconds % 60).toString().padStart(2, '0')})
                                </span>
                              )}
                              {track.explicit_content && (
                                <Badge variant="outline" className="text-xs">E</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {release.admin_notes && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">
                          <span className="font-semibold">Admin Feedback:</span> {release.admin_notes}
                        </p>
                      </div>
                    )}

                    {release.submission_notes && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-600">{release.submission_notes}</p>
                      </div>
                    )}
                  </StudioPanel>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'publishing' && (
        <div className="space-y-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AnimatedIcon icon="shield" size={32} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Publishing & Rights Management</h3>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Protect your music and collect all the royalties you deserve. Register your songs with PROs,
              handle copyright registration, and manage your publishing rights all in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <StudioPanel className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AnimatedIcon icon="check" size={24} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">Copyright Registration</h4>
                  <p className="text-slate-600 mb-4">
                    Register your songs with the U.S. Copyright Office to establish legal ownership and protection.
                  </p>
                  <ActionButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowCopyrightModal(true)}
                  >
                    Register Songs
                  </ActionButton>
                </div>
              </div>
            </StudioPanel>

            <StudioPanel className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AnimatedIcon icon="globe" size={24} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">PRO Registration</h4>
                  <p className="text-slate-600 mb-4">
                    Register with Performance Rights Organizations (ASCAP, BMI, SESAC) to collect performance royalties.
                  </p>
                  <ActionButton
                    onClick={() => setShowPROModal(true)}
                    variant="secondary"
                    size="sm"
                  >
                    Learn More
                  </ActionButton>
                </div>
              </div>
            </StudioPanel>

            <StudioPanel className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AnimatedIcon icon="users" size={24} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">Split Management</h4>
                  <p className="text-slate-600 mb-4">
                    Manage collaborator splits and ensure everyone gets paid their fair share of royalties.
                  </p>
                  {/* The previous Link to SplitManagement is removed as it's now a dedicated tab */}
                  <Button variant="secondary" size="sm" onClick={() => setActiveTab('splits')}>
                    Manage Splits
                  </Button>
                </div>
              </div>
            </StudioPanel>

            <StudioPanel className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AnimatedIcon icon="headphones" size={24} className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">Expert Consultation</h4>
                  <p className="text-slate-600 mb-4">
                    Get professional help with complex publishing questions from industry experts.
                  </p>
                  <ActionButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowConsultationModal(true)}
                  >
                    Book Call ($49.99)
                  </ActionButton>
                </div>
              </div>
            </StudioPanel>
          </div>

          <StudioPanel className="p-6">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Why Handle Publishing Rights?</h4>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AnimatedIcon icon="trending" size={20} className="text-green-600" />
                </div>
                <h5 className="font-medium text-slate-900 mb-2">Maximize Revenue</h5>
                <p className="text-sm text-slate-600">Collect all possible royalties from streams, radio, TV, and live performances</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AnimatedIcon icon="shield" size={20} className="text-blue-600" />
                </div>
                <h5 className="font-medium text-slate-900 mb-2">Legal Protection</h5>
                <p className="text-sm text-slate-600">Establish clear ownership and protect against unauthorized use</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AnimatedIcon icon="globe" size={20} className="text-purple-600" />
                </div>
                <h5 className="font-medium text-slate-900 mb-2">Global Reach</h5>
                <p className="text-sm text-slate-600">Collect royalties worldwide through international agreements</p>
              </div>
            </div>
          </StudioPanel>
        </div>
      )}

      {activeTab === 'splits' && (
        <div className="space-y-6">
            <Tabs value={splitTab} onValueChange={setSplitTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="collaborators">Collaborators ({collaborators.length})</TabsTrigger>
                <TabsTrigger value="releases">Releases ({releasesWithSplits.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StudioPanel className="p-6 text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <AnimatedIcon icon="disc" size={24} className="text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">{releasesWithSplits.length}</h3>
                    <p className="text-slate-600">Releases with Splits</p>
                    </StudioPanel>

                    <StudioPanel className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <AnimatedIcon icon="users" size={24} className="text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">{collaborators.length}</h3>
                    <p className="text-slate-600">Active Collaborators</p>
                    </StudioPanel>

                    <StudioPanel className="p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <AnimatedIcon icon="check" size={24} className="text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">{releases.length}</h3>
                    <p className="text-slate-600">Total Releases</p>
                    </StudioPanel>
                </div>

                {releasesWithSplits.length === 0 ? (
                    <StudioPanel className="p-8 text-center">
                    <AnimatedIcon icon="users" size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No Royalty Splits Yet</h3>
                    <p className="text-slate-600 mb-6 max-w-xl mx-auto">
                        Start collaborating with other artists by adding royalty splits to your releases.
                    </p>
                    <ActionButton icon="plus" onClick={handleCreateRelease}>
                        Create Release with Splits
                    </ActionButton>
                    </StudioPanel>
                ) : (
                    <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
                    {releasesWithSplits.slice(0, 3).map(release => (
                        <StudioPanel key={release.id} className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                            <img
                                src={release.cover_art_url || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=100&q=80'}
                                alt={release.title}
                                className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                                <h4 className="font-medium text-slate-900">{release.title}</h4>
                                <p className="text-sm text-slate-500">
                                {release.royalty_splits.length} collaborator{release.royalty_splits.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                            </div>
                            <Badge variant="outline">
                            {release.status === 'live' ? 'Live' : 'In Progress'}
                            </Badge>
                        </div>
                        </StudioPanel>
                    ))}
                    </div>
                )}
                </TabsContent>

                <TabsContent value="collaborators" className="mt-6">
                {collaborators.length === 0 ? (
                    <StudioPanel className="p-8 text-center">
                    <AnimatedIcon icon="users" size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No Collaborators Yet</h3>
                    <p className="text-slate-600 mb-6">
                        Add collaborators when creating releases to start managing splits.
                    </p>
                    </StudioPanel>
                ) : (
                    <div className="grid gap-4">
                    {collaborators.map((collaborator, index) => (
                        <StudioPanel key={index} className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                            <h3 className="text-lg font-semibold text-slate-900">{collaborator.name}</h3>
                            <p className="text-slate-600">{collaborator.email}</p>
                            <Badge className="mt-2 capitalize">{collaborator.role?.replace(/_/g, ' ')}</Badge>
                            </div>
                            <div className="text-right">
                            <p className="text-sm text-slate-500">{collaborator.releases.length} release{collaborator.releases.length !== 1 ? 's' : ''}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-medium text-slate-700">Active Splits:</h4>
                            {collaborator.releases.map((release, releaseIndex) => (
                            <div key={releaseIndex} className="flex justify-between items-center text-sm bg-slate-50 p-2 rounded">
                                <span>{release.releaseTitle}</span>
                                <span className="font-medium">{release.percentage}%</span>
                            </div>
                            ))}
                        </div>
                        </StudioPanel>
                    ))}
                    </div>
                )}
                </TabsContent>

                <TabsContent value="releases" className="mt-6">
                {releasesWithSplits.length === 0 ? (
                    <StudioPanel className="p-8 text-center">
                    <AnimatedIcon icon="disc" size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No Releases with Splits</h3>
                    <p className="text-slate-600 mb-6">
                        Create releases and add collaborators to manage royalty splits.
                    </p>
                    </StudioPanel>
                ) : (
                    <div className="grid gap-4">
                    {releasesWithSplits.map(release => (
                        <StudioPanel key={release.id} className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <img
                            src={release.cover_art_url || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=100&q=80'}
                            alt={release.title}
                            className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                            <h3 className="text-lg font-semibold text-slate-900">{release.title}</h3>
                            <p className="text-slate-600 capitalize">{release.release_type}</p>
                            <p className="text-sm text-slate-500">
                                Released: {release.release_date ? format(new Date(release.release_date), 'MMM d, yyyy') : 'TBD'}
                            </p>
                            </div>
                            <Badge className={
                            release.status === 'live' ? 'bg-green-100 text-green-800' :
                            release.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                            }>
                            <span className="capitalize">{release.status}</span>
                            </Badge>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="font-medium text-slate-700 mb-3">Royalty Splits:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {release.royalty_splits.map((split, splitIndex) => (
                                <div key={splitIndex} className="bg-slate-50 p-3 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                    <p className="font-medium text-slate-900">{split.name}</p>
                                    <p className="text-sm text-slate-600">{split.email}</p>
                                    <Badge variant="outline" className="mt-1 text-xs capitalize">{split.role?.replace(/_/g, ' ')}</Badge>
                                    </div>
                                    <div className="text-right">
                                    <p className="text-lg font-bold text-purple-600">{split.percentage}%</p>
                                    </div>
                                </div>
                                </div>
                            ))}
                            </div>

                            <div className="flex justify-between items-center mt-4 pt-3 border-t">
                            <span className="font-medium">Total Split:</span>
                            <span className="font-bold text-lg">
                                {release.royalty_splits.reduce((sum, split) => sum + (Number(split.percentage) || 0), 0)}%
                            </span>
                            </div>
                        </div>

                        <div className="flex justify-end mt-4">
                            <Button variant="outline" size="sm" onClick={() => handleEditRelease(release)}>
                                Edit Release
                            </Button>
                        </div>
                        </StudioPanel>
                    ))}
                    </div>
                )}
                </TabsContent>
            </Tabs>
        </div>
      )}

      {activeTab === 'submissions' && (
        <StudioPanel className="p-4 md:p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">My Copyright Submissions</h3>
          {songRegistrations.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {songRegistrations.map(reg => {
                const statusConfig = {
                  submitted: { color: 'bg-blue-100 text-blue-800', icon: 'send' },
                  in_review: { color: 'bg-yellow-100 text-yellow-800', icon: 'eye' },
                  completed: { color: 'bg-green-100 text-green-800', icon: 'check' },
                  requires_action: { color: 'bg-red-100 text-red-800', icon: 'warning' },
                };
                const config = statusConfig[reg.status] || statusConfig.submitted;
                return (
                  <div key={reg.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-slate-900">{reg.title}</p>
                      <p className="text-sm text-slate-500">Submitted: {format(new Date(reg.submission_date), 'MMM d, yyyy')}</p>
                    </div>
                    <Badge className={`${config.color} gap-2`}>
                      <AnimatedIcon icon={config.icon} size={14} />
                      <span className="capitalize">{reg.status.replace(/_/g, ' ')}</span>
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-16 w-16 text-slate-300 mb-4" />
              <p className="text-slate-500">You haven't submitted any songs for registration yet.</p>
            </div>
          )}
        </StudioPanel>
      )}

      {/* Modals */}
      <CreateReleaseModal
        open={showCreateRelease}
        onOpenChange={setShowCreateRelease}
        onSuccess={handleModalSuccess}
        user={user}
        editingRelease={selectedRelease?.status === 'draft' ? selectedRelease : null}
      />

      <ReleaseDetailsModal
        open={showEditRelease}
        onOpenChange={setShowEditRelease}
        release={selectedRelease}
        onSuccess={handleModalSuccess}
        user={user}
      />

      <PRORegistrationModal
        open={showPROModal}
        onOpenChange={setShowPROModal}
      />

      <CopyrightRegistrationModal
        open={showCopyrightModal}
        onOpenChange={setShowCopyrightModal}
        onSuccess={handleModalSuccess}
      />

      <ExpertConsultationModal
        open={showConsultationModal}
        onOpenChange={setShowConsultationModal}
        user={user}
      />
    </div>
  );
}
