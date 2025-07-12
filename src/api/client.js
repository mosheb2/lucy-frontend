const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.lucysounds.com/api';
const BACKEND_URL = 'https://api.lucysounds.com/api';

console.log('API client initialized with base URL:', API_BASE_URL);

// Import the fixed supabase client
import { supabase } from './supabase-auth-fixed';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token) {
    console.log('Setting token:', token ? 'present' : 'null');
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
      console.log('Token saved to localStorage');
    } else {
      localStorage.removeItem('auth_token');
      console.log('Token removed from localStorage');
    }
  }

  clearToken() {
    console.log('Clearing token');
    this.token = null;
    localStorage.removeItem('auth_token');
    console.log('Token removed from localStorage');
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
      console.log('Adding Authorization header with token');
    } else {
      console.log('No token available for Authorization header');
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
      mode: 'cors',
    };

    try {
      console.log(`Making API request to ${url}`);
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized errors by attempting to refresh the token
      if (response.status === 401) {
        console.log('Received 401 Unauthorized, attempting to refresh token...');
        
        // Try to refresh the token if we're not already trying to refresh
        if (!endpoint.includes('/auth/refresh')) {
          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const refreshResponse = await this.refreshToken(refreshToken);
              if (refreshResponse && refreshResponse.session?.access_token) {
                // Successfully refreshed, retry the original request
                console.log('Token refreshed successfully, retrying original request');
                return this.request(endpoint, options);
              }
            }
          } catch (refreshError) {
            console.error('Failed to refresh token:', refreshError);
            // Clear auth data on refresh failure
            this.clearToken();
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_authenticated');
            localStorage.removeItem('user_id');
            throw new Error('Authentication expired. Please log in again.');
          }
        }
        
        // If we reach here, refresh failed or wasn't possible
        throw new Error('Invalid token');
      }
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      // Don't log authentication errors as they're expected
      if (!error.message.includes('401') && !error.message.includes('No token provided')) {
        console.error('API request failed:', error);
      }
      throw error;
    }
  }

  // Auth endpoints
  async signUp(userData) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async signIn(credentials) {
    console.log('Attempting signin with credentials:', { email: credentials.email });
    
    try {
      // Use the imported supabase instance directly
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });
      
      if (error) {
        console.error('Supabase signin error:', error);
        // Fall back to backend API
        const response = await this.request('/auth/signin', {
          method: 'POST',
          body: JSON.stringify(credentials),
        });
        
        console.log('Signin response from backend:', response);
        
        if (response.session?.access_token) {
          console.log('Found access token in response, setting token');
          this.setToken(response.session.access_token);
          
          // Also store refresh token if available
          if (response.session?.refresh_token) {
            localStorage.setItem('refresh_token', response.session.refresh_token);
            console.log('Refresh token saved to localStorage');
          }
        } else {
          console.log('No access token found in response');
        }
        
        return response;
      }
      
      console.log('Supabase signin successful:', data);
      
      if (data.session?.access_token) {
        console.log('Found access token in Supabase response, setting token');
        this.setToken(data.session.access_token);
        
        // Also store refresh token if available
        if (data.session?.refresh_token) {
          localStorage.setItem('refresh_token', data.session.refresh_token);
          console.log('Refresh token saved to localStorage');
        }
      } else {
        console.log('No access token found in Supabase response');
      }
      
      return {
        user: data.user,
        session: data.session
      };
    } catch (error) {
      console.error('Signin error:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      // Use the imported supabase instance directly
      await supabase.auth.signOut();
      
      // Also try with backend API
      try {
        await this.request('/auth/signout', {
          method: 'POST',
        });
      } catch (backendError) {
        console.error('Backend signout error (ignoring):', backendError);
      }
      
      this.clearToken();
      return { success: true };
    } catch (error) {
      console.error('Signout error:', error);
      // Even if there's an error, clear the token
      this.clearToken();
      throw error;
    }
  }

  async getCurrentUser() {
    console.log('Getting current user, token available:', !!this.token);
    
    try {
      // Use the imported supabase instance directly
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Supabase get user error:', userError);
        // Fall back to backend API
        return this.request('/users/me');
      }
      
      console.log('Supabase get user successful:', userData);
      return { user: userData.user };
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken) {
    console.log('Attempting to refresh token');
    
    try {
      // Use the imported supabase instance directly
      const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
      
      if (error) {
        console.error('Supabase refresh token error:', error);
        // Fall back to backend API
        const response = await this.request('/auth/refresh', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        
        if (response.session?.access_token) {
          console.log('Found new access token in refresh response, updating token');
          this.setToken(response.session.access_token);
          
          // Also update refresh token if provided
          if (response.session?.refresh_token) {
            localStorage.setItem('refresh_token', response.session.refresh_token);
            console.log('New refresh token saved to localStorage');
          }
        } else {
          console.log('No access token found in refresh response');
        }
        
        return response;
      }
      
      console.log('Supabase refresh token successful:', data);
      
      if (data.session?.access_token) {
        console.log('Found new access token in Supabase refresh response, updating token');
        this.setToken(data.session.access_token);
        
        // Also update refresh token if provided
        if (data.session?.refresh_token) {
          localStorage.setItem('refresh_token', data.session.refresh_token);
          console.log('New refresh token saved to localStorage');
        }
      } else {
        console.log('No access token found in Supabase refresh response');
      }
      
      return data;
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  }

  // User endpoints
  async getUserProfile() {
    return this.request('/users/profile');
  }

  async updateUserProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getUserByUsername(username) {
    return this.request(`/users/${username}`);
  }
  
  async getUserById(userId) {
    try {
      return this.request(`/users/id/${userId}`);
    } catch (error) {
      console.error(`Error fetching user with ID ${userId}:`, error);
      throw error;
    }
  }

  // Generic list and filter methods for entities
  async listUsers(sort = '-created_date', limit = 50) {
    return this.request(`/users?sort=${sort}&limit=${limit}`);
  }

  async filterUsers(criteria, sort = '-created_date', limit = 50) {
    return this.request('/users/filter', {
      method: 'POST',
      body: JSON.stringify({ criteria, sort, limit }),
    });
  }

  async listTracks(sort = '-created_date', limit = 50) {
    return this.request(`/tracks?sort=${sort}&limit=${limit}`);
  }

  async filterTracks(criteria, sort = '-created_date', limit = 50) {
    return this.request('/tracks/filter', {
      method: 'POST',
      body: JSON.stringify({ criteria, sort, limit }),
    });
  }

  async listReleases(sort = '-created_date', limit = 50) {
    return this.request(`/releases?sort=${sort}&limit=${limit}`);
  }

  async filterReleases(criteria, sort = '-created_date', limit = 50) {
    return this.request('/releases/filter', {
      method: 'POST',
      body: JSON.stringify({ criteria, sort, limit }),
    });
  }

  async getRelease(id) {
    return this.request(`/releases/${id}`);
  }

  async listPosts(sort = '-created_date', limit = 50) {
    return this.request(`/posts?sort=${sort}&limit=${limit}`);
  }

  async filterPosts(criteria, sort = '-created_date', limit = 50) {
    return this.request('/posts/filter', {
      method: 'POST',
      body: JSON.stringify({ criteria, sort, limit }),
    });
  }

  async listStories(sort = '-created_date', limit = 50) {
    return this.request(`/stories?sort=${sort}&limit=${limit}`);
  }

  async filterStories(criteria, sort = '-created_date', limit = 50) {
    return this.request('/stories/filter', {
      method: 'POST',
      body: JSON.stringify({ criteria, sort, limit }),
    });
  }

  async getStory(id) {
    return this.request(`/stories/${id}`);
  }

  async listComments(sort = '-created_date', limit = 50) {
    return this.request(`/comments?sort=${sort}&limit=${limit}`);
  }

  async filterComments(criteria, sort = '-created_date', limit = 50) {
    return this.request('/comments/filter', {
      method: 'POST',
      body: JSON.stringify({ criteria, sort, limit }),
    });
  }

  async filterLikes(criteria, sort = '-created_date', limit = 50) {
    return this.request('/likes/filter', {
      method: 'POST',
      body: JSON.stringify({ criteria, sort, limit }),
    });
  }

  async createFollow(data) {
    return this.request('/follows', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteFollow(id) {
    return this.request(`/follows/${id}`, {
      method: 'DELETE',
    });
  }

  async filterFollows(criteria, sort = '-created_date', limit = 50) {
    return this.request('/follows/filter', {
      method: 'POST',
      body: JSON.stringify({ criteria, sort, limit }),
    });
  }

  async createNotification(data) {
    return this.request('/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteNotification(id) {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  async filterNotifications(criteria, sort = '-created_date', limit = 50) {
    return this.request('/notifications/filter', {
      method: 'POST',
      body: JSON.stringify({ criteria, sort, limit }),
    });
  }

  async createSavedPost(data) {
    return this.request('/saved-posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteSavedPost(id) {
    return this.request(`/saved-posts/${id}`, {
      method: 'DELETE',
    });
  }

  async filterSavedPosts(criteria, sort = '-created_date', limit = 50) {
    return this.request('/saved-posts/filter', {
      method: 'POST',
      body: JSON.stringify({ criteria, sort, limit }),
    });
  }

  async createCollaboration(data) {
    return this.request('/collaborations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCollaboration(id, data) {
    return this.request(`/collaborations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCollaboration(id) {
    return this.request(`/collaborations/${id}`, {
      method: 'DELETE',
    });
  }

  async getCollaboration(id) {
    return this.request(`/collaborations/${id}`);
  }

  async filterCollaborations(criteria, sort = '-created_date', limit = 50) {
    return this.request('/collaborations/filter', {
      method: 'POST',
      body: JSON.stringify({ criteria, sort, limit }),
    });
  }

  async createSongRegistration(data) {
    return this.request('/song-registrations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSongRegistration(id, data) {
    return this.request(`/song-registrations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSongRegistration(id) {
    return this.request(`/song-registrations/${id}`, {
      method: 'DELETE',
    });
  }

  async getSongRegistration(id) {
    return this.request(`/song-registrations/${id}`);
  }

  async filterSongRegistrations(criteria, sort = '-created_date', limit = 50) {
    return this.request('/song-registrations/filter', {
      method: 'POST',
      body: JSON.stringify({ criteria, sort, limit }),
    });
  }

  // Web3Drop methods
  async getWeb3Drops() {
    return this.request('/web3-drops');
  }

  async createWeb3Drop(data) {
    return this.request('/web3-drops', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWeb3Drop(id, data) {
    return this.request(`/web3-drops/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async listWeb3Drops(sort = '-created_date', limit = 50) {
    return this.request(`/web3-drops?sort=${sort}&limit=${limit}`);
  }

  async filterWeb3Drops(criteria, sort = '-created_date', limit = 50) {
    return this.request('/web3-drops/filter', {
      method: 'POST',
      body: JSON.stringify({ criteria, sort, limit }),
    });
  }

  // Methods for other entities (DigitalStore, Royalty, Fan, etc.)
  async getDigitalStores() {
    return this.request('/digital-stores');
  }

  async createDigitalStore(data) {
    return this.request('/digital-stores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDigitalStore(id, data) {
    return this.request(`/digital-stores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async listDigitalStores(sort = '-created_date', limit = 50) {
    return this.request(`/digital-stores?sort=${sort}&limit=${limit}`);
  }

  async filterDigitalStores(criteria, sort = '-created_date', limit = 50) {
    return this.request('/digital-stores/filter', {
      method: 'POST',
      body: JSON.stringify({ criteria, sort, limit }),
    });
  }

  // Implement similar methods for other entities
  async getRoyalties() {
    return this.request('/royalties');
  }

  async createRoyalty(data) {
    return this.request('/royalties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRoyalty(id, data) {
    return this.request(`/royalties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async listRoyalties(sort = '-created_date', limit = 50) {
    return this.request(`/royalties?sort=${sort}&limit=${limit}`);
  }

  async filterRoyalties(criteria, sort = '-created_date', limit = 50) {
    return this.request('/royalties/filter', {
      method: 'POST',
      body: JSON.stringify({ criteria, sort, limit }),
    });
  }

  async getFans() {
    return this.request('/fans');
  }

  async createFan(data) {
    return this.request('/fans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFan(id, data) {
    return this.request(`/fans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async listFans(sort = '-created_date', limit = 50) {
    return this.request(`/fans?sort=${sort}&limit=${limit}`);
  }

  async filterFans(criteria, sort = '-created_date', limit = 50) {
    return this.request('/fans/filter', {
      method: 'POST',
      body: JSON.stringify({ criteria, sort, limit }),
    });
  }

  async createPromotion(data) {
    return this.request('/promotions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePromotion(id, data) {
    return this.request(`/promotions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePromotion(id) {
    return this.request(`/promotions/${id}`, {
      method: 'DELETE',
    });
  }

  async listPromotions(sort = '-created_date', limit = 50) {
    return this.request(`/promotions?sort=${sort}&limit=${limit}`);
  }

  async filterPromotions(criteria, sort = '-created_date', limit = 50) {
    return this.request('/promotions/filter', {
      method: 'POST',
      body: JSON.stringify({ criteria, sort, limit }),
    });
  }

  async getReleaseDropPlans() {
    return this.request('/release-drop-plans');
  }

  async createReleaseDropPlan(data) {
    return this.request('/release-drop-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReleaseDropPlan(id, data) {
    return this.request(`/release-drop-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async listReleaseDropPlans(sort = '-created_date', limit = 50) {
    return this.request(`/release-drop-plans?sort=${sort}&limit=${limit}`);
  }

  async filterReleaseDropPlans(criteria, sort = '-created_date', limit = 50) {
    return this.request('/release-drop-plans/filter', {
      method: 'POST',
      body: JSON.stringify({ criteria, sort, limit }),
    });
  }

  async getPreSaves() {
    return this.request('/pre-saves');
  }

  async createPreSave(data) {
    return this.request('/pre-saves', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePreSave(id, data) {
    return this.request(`/pre-saves/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async listPreSaves(sort = '-created_date', limit = 50) {
    return this.request(`/pre-saves?sort=${sort}&limit=${limit}`);
  }

  async filterPreSaves(criteria, sort = '-created_date', limit = 50) {
    return this.request('/pre-saves/filter', {
      method: 'POST',
      body: JSON.stringify({ criteria, sort, limit }),
    });
  }

  async getDistributionServices() {
    return this.request('/distribution-services');
  }

  async createDistributionService(data) {
    return this.request('/distribution-services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDistributionService(id, data) {
    return this.request(`/distribution-services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async listDistributionServices(sort = '-created_date', limit = 50) {
    return this.request(`/distribution-services?sort=${sort}&limit=${limit}`);
  }

  async filterDistributionServices(criteria, sort = '-created_date', limit = 50) {
    return this.request('/distribution-services/filter', {
      method: 'POST',
      body: JSON.stringify({ criteria, sort, limit }),
    });
  }

  async getStats() {
    return this.request('/stats');
  }

  async createStat(data) {
    return this.request('/stats', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStat(id, data) {
    return this.request(`/stats/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async listStats(sort = '-created_date', limit = 50) {
    return this.request(`/stats?sort=${sort}&limit=${limit}`);
  }

  async filterStats(criteria, sort = '-created_date', limit = 50) {
    return this.request('/stats/filter', {
      method: 'POST',
      body: JSON.stringify({ criteria, sort, limit }),
    });
  }

  async getSupportRequests() {
    return this.request('/support-requests');
  }

  async createSupportRequest(data) {
    return this.request('/support-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSupportRequest(id, data) {
    return this.request(`/support-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async listSupportRequests(sort = '-created_date', limit = 50) {
    return this.request(`/support-requests?sort=${sort}&limit=${limit}`);
  }

  async filterSupportRequests(criteria, sort = '-created_date', limit = 50) {
    return this.request('/support-requests/filter', {
      method: 'POST',
      body: JSON.stringify({ criteria, sort, limit }),
    });
  }

  async getMentors() {
    return this.request('/mentors');
  }

  async createMentor(data) {
    return this.request('/mentors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMentor(id, data) {
    return this.request(`/mentors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async listMentors(sort = '-created_date', limit = 50) {
    return this.request(`/mentors?sort=${sort}&limit=${limit}`);
  }

  async filterMentors(criteria, sort = '-created_date', limit = 50) {
    return this.request('/mentors/filter', {
      method: 'POST',
      body: JSON.stringify({ criteria, sort, limit }),
    });
  }

  async createChatRoom(data) {
    return this.request('/chat-rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateChatRoom(id, data) {
    return this.request(`/chat-rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteChatRoom(id) {
    return this.request(`/chat-rooms/${id}`, {
      method: 'DELETE',
    });
  }

  async getChatRoom(id) {
    return this.request(`/chat-rooms/${id}`);
  }

  async filterChatRooms(criteria, sort = '-last_message_at', limit = 50) {
    return this.request('/chat-rooms/filter', {
      method: 'POST',
      body: JSON.stringify({ criteria, sort, limit }),
    });
  }

  async createMessage(data) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteMessage(id) {
    return this.request(`/messages/${id}`, {
      method: 'DELETE',
    });
  }

  async filterMessages(criteria, sort = 'created_date', limit = 100) {
    return this.request('/messages/filter', {
      method: 'POST',
      body: JSON.stringify({ criteria, sort, limit }),
    });
  }

  async followUser(userId) {
    return this.request(`/users/${userId}/follow`, {
      method: 'POST',
    });
  }

  async unfollowUser(userId) {
    return this.request(`/users/${userId}/follow`, {
      method: 'DELETE',
    });
  }

  async getUserFollowers(userId, page = 1, limit = 20) {
    return this.request(`/users/${userId}/followers?page=${page}&limit=${limit}`);
  }

  async getUserFollowing(userId, page = 1, limit = 20) {
    return this.request(`/users/${userId}/following?page=${page}&limit=${limit}`);
  }

  // Track endpoints
  async getTracks(page = 1, limit = 20) {
    return this.request(`/tracks?page=${page}&limit=${limit}`);
  }

  async getTrack(id) {
    return this.request(`/tracks/${id}`);
  }

  async createTrack(trackData) {
    return this.request('/tracks', {
      method: 'POST',
      body: JSON.stringify(trackData),
    });
  }

  async updateTrack(id, trackData) {
    return this.request(`/tracks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(trackData),
    });
  }

  async deleteTrack(id) {
    return this.request(`/tracks/${id}`, {
      method: 'DELETE',
    });
  }

  async getPublicTracks(page = 1, limit = 20, genre, sort = 'latest') {
    const params = new URLSearchParams({ page, limit, sort });
    if (genre) params.append('genre', genre);
    return this.request(`/tracks/public/feed?${params}`);
  }

  async likeTrack(id) {
    return this.request(`/tracks/${id}/like`, {
      method: 'POST',
    });
  }

  async unlikeTrack(id) {
    return this.request(`/tracks/${id}/like`, {
      method: 'DELETE',
    });
  }

  // Release endpoints
  async getReleases(page = 1, limit = 20) {
    return this.request(`/releases?page=${page}&limit=${limit}`);
  }

  async createRelease(releaseData) {
    return this.request('/releases', {
      method: 'POST',
      body: JSON.stringify(releaseData),
    });
  }

  async addTrackToRelease(releaseId, trackId) {
    return this.request(`/releases/${releaseId}/tracks`, {
      method: 'POST',
      body: JSON.stringify({ track_id: trackId }),
    });
  }

  // Post endpoints
  async getPostsFeed(page = 1, limit = 20) {
    return this.request(`/posts/feed?page=${page}&limit=${limit}`);
  }

  async createPost(postData) {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async getPost(id) {
    return this.request(`/posts/${id}`);
  }

  async updatePost(id, postData) {
    return this.request(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  }

  async deletePost(id) {
    return this.request(`/posts/${id}`, {
      method: 'DELETE',
    });
  }

  async likePost(id) {
    return this.request(`/posts/${id}/like`, {
      method: 'POST',
    });
  }

  async unlikePost(id) {
    return this.request(`/posts/${id}/like`, {
      method: 'DELETE',
    });
  }

  async addComment(postId, content) {
    return this.request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Story endpoints
  async getStoriesFeed() {
    return this.request('/stories/feed');
  }

  async createStory(storyData) {
    return this.request('/stories', {
      method: 'POST',
      body: JSON.stringify(storyData),
    });
  }

  async deleteStory(id) {
    return this.request(`/stories/${id}`, {
      method: 'DELETE',
    });
  }

  // Collaboration endpoints
  async getCollaborations() {
    return this.request('/collaborations');
  }

  async createCollaboration(collaborationData) {
    return this.request('/collaborations', {
      method: 'POST',
      body: JSON.stringify(collaborationData),
    });
  }

  async respondToCollaboration(id, response) {
    return this.request(`/collaborations/${id}/respond`, {
      method: 'PUT',
      body: JSON.stringify(response),
    });
  }

  // Notification endpoints
  async getNotifications(page = 1, limit = 20) {
    return this.request(`/notifications?page=${page}&limit=${limit}`);
  }

  async markNotificationAsRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  // Chat endpoints
  async getChatRooms() {
    return this.request('/chat/rooms');
  }

  async getMessages(roomId, page = 1, limit = 50) {
    return this.request(`/chat/rooms/${roomId}/messages?page=${page}&limit=${limit}`);
  }

  async sendMessage(roomId, content) {
    return this.request(`/chat/rooms/${roomId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Analytics endpoints
  async getUserAnalytics(period = '30d') {
    return this.request(`/analytics/user?period=${period}`);
  }

  // Upload endpoints
  async uploadFile(file, type = 'general') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const url = `${this.baseURL}/upload`;
    const config = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  async deleteFile(filename) {
    return this.request(`/upload/${filename}`, {
      method: 'DELETE',
    });
  }

  // Admin endpoints
  async getAdminUsers(page = 1, limit = 20) {
    return this.request(`/admin/users?page=${page}&limit=${limit}`);
  }

  async updateUserRole(userId, role) {
    return this.request(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async getAdminStats() {
    return this.request('/admin/stats');
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient; 