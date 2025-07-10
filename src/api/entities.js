import apiClient from './client';

// User entity
export const User = {
  // Profile methods
  getProfile: () => apiClient.getUserProfile(),
  updateProfile: (data) => apiClient.updateUserProfile(data),
  getByUsername: (username) => apiClient.getUserByUsername(username),
  
  // Get user by ID
  get: (userId) => apiClient.getUserById(userId),
  
  // List and filter methods
  list: (sort = '-created_date', limit = 50) => apiClient.listUsers(sort, limit),
  filter: (criteria, sort = '-created_date', limit = 50) => apiClient.filterUsers(criteria, sort, limit),
  
  // Follow methods
  follow: (userId) => apiClient.followUser(userId),
  unfollow: (userId) => apiClient.unfollowUser(userId),
  getFollowers: (userId, page, limit) => apiClient.getUserFollowers(userId, page, limit),
  getFollowing: (userId, page, limit) => apiClient.getUserFollowing(userId, page, limit),
  
  // Auth methods
  getCurrent: () => apiClient.getCurrentUser(),
  me: () => apiClient.getCurrentUser(), // Alias for getCurrent
  signIn: (credentials) => apiClient.signIn(credentials),
  signUp: (userData) => apiClient.signUp(userData),
  signOut: () => apiClient.signOut(),
  refreshToken: (refreshToken) => apiClient.refreshToken(refreshToken),
};

// Track entity
export const Track = {
  getAll: (page, limit) => apiClient.getTracks(page, limit),
  getById: (id) => apiClient.getTrack(id),
  create: (data) => apiClient.createTrack(data),
  update: (id, data) => apiClient.updateTrack(id, data),
  delete: (id) => apiClient.deleteTrack(id),
  getPublic: (page, limit, genre, sort) => apiClient.getPublicTracks(page, limit, genre, sort),
  like: (id) => apiClient.likeTrack(id),
  unlike: (id) => apiClient.unlikeTrack(id),
  list: (sort = '-created_date', limit = 50) => apiClient.listTracks(sort, limit),
  filter: (criteria, sort = '-created_date', limit = 50) => apiClient.filterTracks(criteria, sort, limit),
};

// Release entity
export const Release = {
  getAll: (page, limit) => apiClient.getReleases(page, limit),
  create: (data) => apiClient.createRelease(data),
  addTrack: (releaseId, trackId) => apiClient.addTrackToRelease(releaseId, trackId),
  list: (sort = '-created_date', limit = 50) => apiClient.listReleases(sort, limit),
  filter: (criteria, sort = '-created_date', limit = 50) => apiClient.filterReleases(criteria, sort, limit),
  get: (id) => apiClient.getRelease(id),
};

// Post entity
export const Post = {
  getFeed: (page, limit) => apiClient.getPostsFeed(page, limit),
  getById: (id) => apiClient.getPost(id),
  create: (data) => apiClient.createPost(data),
  update: (id, data) => apiClient.updatePost(id, data),
  delete: (id) => apiClient.deletePost(id),
  like: (id) => apiClient.likePost(id),
  unlike: (id) => apiClient.unlikePost(id),
  addComment: (id, content) => apiClient.addComment(id, content),
  list: (sort = '-created_date', limit = 50) => apiClient.listPosts(sort, limit),
  filter: (criteria, sort = '-created_date', limit = 50) => apiClient.filterPosts(criteria, sort, limit),
  get: (id) => apiClient.getPost(id),
};

// Story entity
export const Story = {
  getFeed: () => apiClient.getStoriesFeed(),
  create: (data) => apiClient.createStory(data),
  delete: (id) => apiClient.deleteStory(id),
  list: (sort = '-created_date', limit = 50) => apiClient.listStories(sort, limit),
  filter: (criteria, sort = '-created_date', limit = 50) => apiClient.filterStories(criteria, sort, limit),
  get: (id) => apiClient.getStory(id),
};

// Comment entity
export const Comment = {
  create: (data) => apiClient.createComment(data),
  delete: (id) => apiClient.deleteComment(id),
  list: (sort = '-created_date', limit = 50) => apiClient.listComments(sort, limit),
  filter: (criteria, sort = '-created_date', limit = 50) => apiClient.filterComments(criteria, sort, limit),
};

// Like entity
export const Like = {
  create: (type, id) => {
    if (type === 'post') return apiClient.likePost(id);
    if (type === 'track') return apiClient.likeTrack(id);
    throw new Error('Invalid like type');
  },
  delete: (type, id) => {
    if (type === 'post') return apiClient.unlikePost(id);
    if (type === 'track') return apiClient.unlikeTrack(id);
    throw new Error('Invalid like type');
  },
  filter: (criteria, sort = '-created_date', limit = 50) => apiClient.filterLikes(criteria, sort, limit),
};

// Follow entity
export const Follow = {
  create: (data) => apiClient.createFollow(data),
  delete: (id) => apiClient.deleteFollow(id),
  filter: (criteria, sort = '-created_date', limit = 50) => apiClient.filterFollows(criteria, sort, limit),
};

// Notification entity
export const Notification = {
  create: (data) => apiClient.createNotification(data),
  markAsRead: (id) => apiClient.markNotificationAsRead(id),
  markAllAsRead: () => apiClient.markAllNotificationsAsRead(),
  delete: (id) => apiClient.deleteNotification(id),
  filter: (criteria, sort = '-created_date', limit = 50) => apiClient.filterNotifications(criteria, sort, limit),
};

// SavedPost entity
export const SavedPost = {
  create: (data) => apiClient.createSavedPost(data),
  delete: (id) => apiClient.deleteSavedPost(id),
  filter: (criteria, sort = '-created_date', limit = 50) => apiClient.filterSavedPosts(criteria, sort, limit),
};

// Collaboration entity
export const Collaboration = {
  create: (data) => apiClient.createCollaboration(data),
  update: (id, data) => apiClient.updateCollaboration(id, data),
  delete: (id) => apiClient.deleteCollaboration(id),
  filter: (criteria, sort = '-created_date', limit = 50) => apiClient.filterCollaborations(criteria, sort, limit),
  get: (id) => apiClient.getCollaboration(id),
};

// SongRegistration entity
export const SongRegistration = {
  create: (data) => apiClient.createSongRegistration(data),
  update: (id, data) => apiClient.updateSongRegistration(id, data),
  delete: (id) => apiClient.deleteSongRegistration(id),
  filter: (criteria, sort = '-created_date', limit = 50) => apiClient.filterSongRegistrations(criteria, sort, limit),
  get: (id) => apiClient.getSongRegistration(id),
};

// Web3Drop entity
export const Web3Drop = {
  getAll: () => apiClient.getWeb3Drops(),
  create: (data) => apiClient.createWeb3Drop(data),
  update: (id, data) => apiClient.updateWeb3Drop(id, data),
  filter: (criteria, sort = '-created_date', limit = 50) => apiClient.filterWeb3Drops(criteria, sort, limit),
  list: (sort = '-created_date', limit = 50) => apiClient.listWeb3Drops(sort, limit),
};

// DigitalStore entity
export const DigitalStore = {
  getAll: () => apiClient.getDigitalStores(),
  create: (data) => apiClient.createDigitalStore(data),
  update: (id, data) => apiClient.updateDigitalStore(id, data),
  list: (sort = '-created_date', limit = 50) => apiClient.listDigitalStores(sort, limit),
  filter: (criteria, sort = '-created_date', limit = 50) => apiClient.filterDigitalStores(criteria, sort, limit),
};

// Royalty entity
export const Royalty = {
  getAll: () => apiClient.getRoyalties(),
  create: (data) => apiClient.createRoyalty(data),
  update: (id, data) => apiClient.updateRoyalty(id, data),
  list: (sort = '-created_date', limit = 50) => apiClient.listRoyalties(sort, limit),
  filter: (criteria, sort = '-created_date', limit = 50) => apiClient.filterRoyalties(criteria, sort, limit),
};

// Fan entity
export const Fan = {
  getAll: () => apiClient.getFans(),
  create: (data) => apiClient.createFan(data),
  update: (id, data) => apiClient.updateFan(id, data),
  list: (sort = '-created_date', limit = 50) => apiClient.listFans(sort, limit),
  filter: (criteria, sort = '-created_date', limit = 50) => apiClient.filterFans(criteria, sort, limit),
};

// Promotion entity
export const Promotion = {
  create: (data) => apiClient.createPromotion(data),
  update: (id, data) => apiClient.updatePromotion(id, data),
  delete: (id) => apiClient.deletePromotion(id),
  list: (sort = '-created_date', limit = 50) => apiClient.listPromotions(sort, limit),
  filter: (criteria, sort = '-created_date', limit = 50) => apiClient.filterPromotions(criteria, sort, limit),
};

// ReleaseDropPlan entity
export const ReleaseDropPlan = {
  getAll: () => apiClient.getReleaseDropPlans(),
  create: (data) => apiClient.createReleaseDropPlan(data),
  update: (id, data) => apiClient.updateReleaseDropPlan(id, data),
  list: (sort = '-created_date', limit = 50) => apiClient.listReleaseDropPlans(sort, limit),
  filter: (criteria, sort = '-created_date', limit = 50) => apiClient.filterReleaseDropPlans(criteria, sort, limit),
};

// PreSave entity
export const PreSave = {
  getAll: () => apiClient.getPreSaves(),
  create: (data) => apiClient.createPreSave(data),
  update: (id, data) => apiClient.updatePreSave(id, data),
  list: (sort = '-created_date', limit = 50) => apiClient.listPreSaves(sort, limit),
  filter: (criteria, sort = '-created_date', limit = 50) => apiClient.filterPreSaves(criteria, sort, limit),
};

// DistributionService entity
export const DistributionService = {
  getAll: () => apiClient.getDistributionServices(),
  create: (data) => apiClient.createDistributionService(data),
  update: (id, data) => apiClient.updateDistributionService(id, data),
  list: (sort = '-created_date', limit = 50) => apiClient.listDistributionServices(sort, limit),
  filter: (criteria, sort = '-created_date', limit = 50) => apiClient.filterDistributionServices(criteria, sort, limit),
};

// Stat entity
export const Stat = {
  getAll: () => apiClient.getStats(),
  create: (data) => apiClient.createStat(data),
  update: (id, data) => apiClient.updateStat(id, data),
  list: (sort = '-created_date', limit = 50) => apiClient.listStats(sort, limit),
  filter: (criteria, sort = '-created_date', limit = 50) => apiClient.filterStats(criteria, sort, limit),
};

// SupportRequest entity
export const SupportRequest = {
  getAll: () => apiClient.getSupportRequests(),
  create: (data) => apiClient.createSupportRequest(data),
  update: (id, data) => apiClient.updateSupportRequest(id, data),
  list: (sort = '-created_date', limit = 50) => apiClient.listSupportRequests(sort, limit),
  filter: (criteria, sort = '-created_date', limit = 50) => apiClient.filterSupportRequests(criteria, sort, limit),
};

// Mentor entity
export const Mentor = {
  getAll: () => apiClient.getMentors(),
  create: (data) => apiClient.createMentor(data),
  update: (id, data) => apiClient.updateMentor(id, data),
  list: (sort = '-created_date', limit = 50) => apiClient.listMentors(sort, limit),
  filter: (criteria, sort = '-created_date', limit = 50) => apiClient.filterMentors(criteria, sort, limit),
};

// ChatRoom entity
export const ChatRoom = {
  create: (data) => apiClient.createChatRoom(data),
  update: (id, data) => apiClient.updateChatRoom(id, data),
  delete: (id) => apiClient.deleteChatRoom(id),
  filter: (criteria, sort = '-last_message_at', limit = 50) => apiClient.filterChatRooms(criteria, sort, limit),
  get: (id) => apiClient.getChatRoom(id),
};

// Message entity
export const Message = {
  create: (data) => apiClient.createMessage(data),
  delete: (id) => apiClient.deleteMessage(id),
  filter: (criteria, sort = 'created_date', limit = 100) => apiClient.filterMessages(criteria, sort, limit),
};