import apiClient from './client';

// Core integrations
export const Core = {
  // File upload
  UploadFile: async (file, type = 'general') => {
    return apiClient.uploadFile(file, type);
  },
  
  // Email sending (would be implemented when email service is added)
  SendEmail: async (emailData) => {
    try {
      return await apiClient.request('/integrations/email/send', {
        method: 'POST',
        body: JSON.stringify(emailData)
      });
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message || 'Email service not implemented yet' };
    }
  },
  
  // LLM invocation (would be implemented when AI service is added)
  InvokeLLM: async (prompt, options = {}) => {
    try {
      return await apiClient.request('/integrations/ai/llm', {
        method: 'POST',
        body: JSON.stringify({ prompt, options })
      });
    } catch (error) {
      console.error('Error invoking LLM:', error);
      return { success: false, error: error.message || 'LLM service not implemented yet' };
    }
  },
  
  // Image generation (would be implemented when AI image service is added)
  GenerateImage: async (prompt, options = {}) => {
    try {
      return await apiClient.request('/integrations/ai/image', {
        method: 'POST',
        body: JSON.stringify({ prompt, options })
      });
    } catch (error) {
      console.error('Error generating image:', error);
      return { success: false, error: error.message || 'Image generation not implemented yet' };
    }
  },
  
  // File data extraction (would be implemented when file processing is added)
  ExtractDataFromUploadedFile: async (fileId) => {
    try {
      return await apiClient.request(`/integrations/files/${fileId}/extract`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error extracting file data:', error);
      return { success: false, error: error.message || 'File data extraction not implemented yet' };
    }
  },
};

// Individual integration exports for backward compatibility
export const UploadFile = Core.UploadFile;
export const SendEmail = Core.SendEmail;
export const InvokeLLM = Core.InvokeLLM;
export const GenerateImage = Core.GenerateImage;
export const ExtractDataFromUploadedFile = Core.ExtractDataFromUploadedFile;

/**
 * Integration API for various social media and streaming platforms
 */
class IntegrationsAPI {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  // YouTube integration
  async getYouTubeAnalytics() {
    try {
      return await this.apiClient.request('/integrations/youtube/analytics');
    } catch (error) {
      console.error('Error fetching YouTube analytics:', error);
      // Return placeholder data instead of throwing error
      return {
        success: false,
        error: error.message,
        data: {
          views: 0,
          subscribers: 0,
          videos: 0,
          engagement_rate: 0,
          recent_videos: []
        }
      };
    }
  }

  async postYouTubeContent(data) {
    try {
      return await this.apiClient.request('/integrations/youtube/post', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Error posting to YouTube:', error);
      return { success: false, error: error.message };
    }
  }

  // Instagram integration
  async getInstagramAnalytics() {
    try {
      return await this.apiClient.request('/integrations/instagram/analytics');
    } catch (error) {
      console.error('Error fetching Instagram analytics:', error);
      // Return placeholder data
      return {
        success: false,
        error: error.message || 'Instagram integration not implemented yet',
        data: {
          followers: 0,
          posts: 0,
          engagement_rate: 0,
          recent_posts: []
        }
      };
    }
  }

  async postInstagramContent(data) {
    try {
      return await this.apiClient.request('/integrations/instagram/post', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Error posting to Instagram:', error);
      return { success: false, error: error.message || 'Instagram integration not implemented yet' };
    }
  }

  // TikTok integration
  async getTikTokAnalytics() {
    try {
      return await this.apiClient.request('/integrations/tiktok/analytics');
    } catch (error) {
      console.error('Error fetching TikTok analytics:', error);
      // Return placeholder data
      return {
        success: false,
        error: error.message || 'TikTok integration not implemented yet',
        data: {
          followers: 0,
          videos: 0,
          likes: 0,
          views: 0,
          recent_videos: []
        }
      };
    }
  }

  async postTikTokContent(data) {
    try {
      return await this.apiClient.request('/integrations/tiktok/post', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Error posting to TikTok:', error);
      return { success: false, error: error.message || 'TikTok integration not implemented yet' };
    }
  }

  // Twitter/X integration
  async getTwitterAnalytics() {
    try {
      return await this.apiClient.request('/integrations/twitter/analytics');
    } catch (error) {
      console.error('Error fetching Twitter analytics:', error);
      // Return placeholder data
      return {
        success: false,
        error: error.message || 'Twitter analytics not implemented yet',
        data: {
          followers: 0,
          tweets: 0,
          engagement_rate: 0,
          recent_tweets: []
        }
      };
    }
  }

  async postTweet(data) {
    try {
      return await this.apiClient.request('/integrations/twitter/post', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Error posting to Twitter:', error);
      return { success: false, error: error.message || 'Twitter integration not implemented yet' };
    }
  }

  // Facebook integration
  async getFacebookAnalytics() {
    try {
      return await this.apiClient.request('/integrations/facebook/analytics');
    } catch (error) {
      console.error('Error fetching Facebook analytics:', error);
      // Return placeholder data
      return {
        success: false,
        error: error.message || 'Facebook integration not implemented yet',
        data: {
          followers: 0,
          posts: 0,
          engagement_rate: 0,
          recent_posts: []
        }
      };
    }
  }

  async postFacebookContent(data) {
    try {
      return await this.apiClient.request('/integrations/facebook/post', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Error posting to Facebook:', error);
      return { success: false, error: error.message || 'Facebook integration not implemented yet' };
    }
  }

  // Threads integration
  async getThreadsAnalytics() {
    try {
      return await this.apiClient.request('/integrations/threads/analytics');
    } catch (error) {
      console.error('Error fetching Threads analytics:', error);
      // Return placeholder data
      return {
        success: false,
        error: error.message || 'Threads integration not implemented yet',
        data: {
          followers: 0,
          posts: 0,
          engagement_rate: 0,
          recent_posts: []
        }
      };
    }
  }

  async postThreadsContent(data) {
    try {
      return await this.apiClient.request('/integrations/threads/post', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Error posting to Threads:', error);
      return { success: false, error: error.message || 'Threads integration not implemented yet' };
    }
  }

  // Spotify integration
  async getSpotifyAnalytics() {
    try {
      return await this.apiClient.request('/integrations/spotify/analytics');
    } catch (error) {
      console.error('Error fetching Spotify analytics:', error);
      // Return placeholder data
      return {
        success: false,
        error: error.message,
        data: {
          listeners: 0,
          streams: 0,
          followers: 0,
          top_tracks: []
        }
      };
    }
  }

  // Apple Music integration
  async getAppleMusicAnalytics() {
    try {
      return await this.apiClient.request('/integrations/apple-music/analytics');
    } catch (error) {
      console.error('Error fetching Apple Music analytics:', error);
      // Return placeholder data
      return {
        success: false,
        error: error.message,
        data: {
          listeners: 0,
          plays: 0,
          top_tracks: []
        }
      };
    }
  }
}

// Export a singleton instance
const integrationsAPI = new IntegrationsAPI(apiClient);
export default integrationsAPI;

// Export individual platform APIs for direct use
export const YouTube = {
  getAnalytics: () => integrationsAPI.getYouTubeAnalytics(),
  post: (data) => integrationsAPI.postYouTubeContent(data)
};

export const Instagram = {
  getAnalytics: () => integrationsAPI.getInstagramAnalytics(),
  post: (data) => integrationsAPI.postInstagramContent(data)
};

export const TikTok = {
  getAnalytics: () => integrationsAPI.getTikTokAnalytics(),
  post: (data) => integrationsAPI.postTikTokContent(data)
};

export const Twitter = {
  getAnalytics: () => integrationsAPI.getTwitterAnalytics(),
  post: (data) => integrationsAPI.postTweet(data)
};

export const Facebook = {
  getAnalytics: () => integrationsAPI.getFacebookAnalytics(),
  post: (data) => integrationsAPI.postFacebookContent(data)
};

export const Threads = {
  getAnalytics: () => integrationsAPI.getThreadsAnalytics(),
  post: (data) => integrationsAPI.postThreadsContent(data)
};

export const Spotify = {
  getAnalytics: () => integrationsAPI.getSpotifyAnalytics()
};

export const AppleMusic = {
  getAnalytics: () => integrationsAPI.getAppleMusicAnalytics()
};






