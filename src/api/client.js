const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://lucy-backend.herokuapp.com/api';
const BACKEND_URL = 'https://lucy-backend.herokuapp.com/api';

console.log('API client initialized with base URL:', API_BASE_URL);

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
    
    // Log initial token state
    console.log('API client initialized with token:', this.token ? 'present' : 'null');
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
      credentials: 'include' // Include cookies if any
    };

    try {
      console.log(`Making API request to ${url}`);
      const response = await fetch(url, config);
      
      // Log response status
      console.log(`API response status: ${response.status}`);
      
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
            this.setToken(null);
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
        // Try to parse error message from response
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
        } catch (parseError) {
          // If we can't parse JSON, use status text
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
      }
      
      // For successful responses, try to parse JSON
      try {
        return await response.json();
      } catch (parseError) {
        console.warn('Response is not valid JSON:', parseError);
        return { success: true };
      }
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
      // First try with Supabase directly
      const { supabase } = await import('@/api/supabase-auth');
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
      // First try with Supabase directly
      const { supabase } = await import('@/api/supabase-auth');
      await supabase.auth.signOut();
      
      // Also try with backend API
      try {
        await this.request('/auth/signout', {
          method: 'POST',
        });
      } catch (backendError) {
        console.error('Backend signout error (ignoring):', backendError);
      }
      
      this.setToken(null);
      return { success: true };
    } catch (error) {
      console.error('Signout error:', error);
      // Even if there's an error, clear the token
      this.setToken(null);
      throw error;
    }
  }

  async getCurrentUser() {
    console.log('Getting current user, token available:', !!this.token);
    
    if (!this.token) {
      throw new Error('No authentication token available');
    }
    
    try {
      // First try with Supabase directly
      const { supabase } = await import('@/api/supabase-auth');
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Supabase getUser error:', userError);
        // Fall back to backend API
        return await this.request('/auth/me');
      }
      
      if (userData && userData.user) {
        console.log('User data obtained from Supabase:', userData.user);
        return { user: userData.user };
      } else {
        console.log('No user data in Supabase response');
        // Fall back to backend API
        return await this.request('/auth/me');
      }
    } catch (error) {
      // If it's a 401 error, the user is not authenticated
      if (error.message.includes('401') || error.message.includes('No token provided')) {
        console.log('Authentication failed:', error.message);
        throw new Error('Not authenticated');
      }
      // Only log unexpected errors
      console.error('API request failed:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken) {
    console.log('Attempting to refresh token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      // First try with Supabase directly
      const { supabase } = await import('@/api/supabase-auth');
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
      
      return {
        user: data.user,
        session: data.session
      };
    } catch (error) {
      console.error('Token refresh failed:', error);
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
}

const apiClient = new ApiClient();
export default apiClient;
