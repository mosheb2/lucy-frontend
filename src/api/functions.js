import apiClient from './client';

// Analytics functions
export const getCreatorAnalytics = async (period = '30d') => {
  return apiClient.post('/base44/creator-analytics', { period });
};

export const getAIInsights = async (data) => {
  return apiClient.post('/base44/ai-insights', { data });
};

export const generateSmartContent = async (prompt) => {
  return apiClient.post('/base44/smart-content', { prompt });
};

// Social media integration functions
export const getYouTubeChannel = async (channelId) => {
  return apiClient.post('/base44/youtube-channel', { channelId });
};

export const getTikTokProfile = async (username) => {
  // This would be implemented when TikTok API integration is added
  return Promise.reject(new Error('TikTok integration not implemented yet'));
};

export const getTwitterProfile = async (username) => {
  // This would be implemented when Twitter API integration is added
  return Promise.reject(new Error('Twitter integration not implemented yet'));
};

export const getFacebookProfile = async (pageId) => {
  // This would be implemented when Facebook API integration is added
  return Promise.reject(new Error('Facebook integration not implemented yet'));
};

export const getThreadsProfile = async (username) => {
  // This would be implemented when Threads API integration is added
  return Promise.reject(new Error('Threads integration not implemented yet'));
};

export const getInstagramProfile = async (username) => {
  // This would be implemented when Instagram API integration is added
  return Promise.reject(new Error('Instagram integration not implemented yet'));
};

// Music platform integrations
export const spotifyForArtists = async (artistId) => {
  return apiClient.post('/base44/spotify-artists', { artistId });
};

export const spotifyCallback = async (code) => {
  // This would be implemented when Spotify OAuth is added
  return Promise.reject(new Error('Spotify OAuth not implemented yet'));
};

export const spotifyPreSave = async (trackData) => {
  return apiClient.post('/base44/spotify-presave', { trackData });
};

// Analytics functions
export const twitterAnalytics = async (username) => {
  // This would be implemented when Twitter analytics are added
  return Promise.reject(new Error('Twitter analytics not implemented yet'));
};

// Music processing functions
export const musicProcessing = async (audioFile) => {
  return apiClient.post('/base44/music-processing', { audioFile });
};

// Distribution functions
export const distributionAPI = async (releaseData) => {
  return apiClient.post('/base44/distribution', { releaseData });
};

// Admin functions
export const adminAPI = async (action, data) => {
  return apiClient.post('/base44/admin', { action, data });
};

// Social features
export const socialFeatures = async (feature, data) => {
  return apiClient.post('/base44/social-features', { feature, data });
};

// Analytics engine
export const analyticsEngine = async (query) => {
  return apiClient.post('/base44/analytics-engine', { query });
};

// Promotion engine
export const promotionEngine = async (campaignData) => {
  return apiClient.post('/base44/promotion-engine', { campaignData });
};

// Notification system
export const notificationSystem = async (notificationData) => {
  // This would be implemented when notification system is enhanced
  return Promise.reject(new Error('Notification system not implemented yet'));
};

// YouTube functions
export const getYouTubeIdeas = async (topic) => {
  return apiClient.post('/base44/youtube-ideas', { topic });
};

// Message system
export const messageSystem = async (messageData) => {
  // This would be implemented when messaging system is enhanced
  return Promise.reject(new Error('Message system not implemented yet'));
};

export const sendMessage = async (roomId, content) => {
  return apiClient.sendMessage(roomId, content);
};

// Public campaign
export const publicCampaign = async (campaignData) => {
  return apiClient.post('/base44/public-campaign', campaignData);
};

// Publishing services
export const publishingServices = async (serviceData) => {
  return apiClient.post('/base44/publishing-services', { serviceData });
};

