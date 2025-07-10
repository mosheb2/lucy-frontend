import apiClient from './client';

class AdminAPI {
  constructor() {
    this.apiClient = apiClient;
  }

  // Check if current user is admin
  async isAdmin() {
    try {
      const userData = await this.apiClient.getCurrentUser();
      return userData.user?.role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  // Check if current user is moderator or admin
  async isModerator() {
    try {
      const userData = await this.apiClient.getCurrentUser();
      const role = userData.user?.role;
      return role === 'admin' || role === 'moderator';
    } catch (error) {
      console.error('Error checking moderator status:', error);
      return false;
    }
  }

  // Get admin dashboard statistics
  async getDashboardStats() {
    try {
      return await this.apiClient.request('/admin/stats');
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Get users with pagination
  async getUsers(page = 1, limit = 20) {
    try {
      return await this.apiClient.request(`/admin/users?page=${page}&limit=${limit}`);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Get total user count
  async getTotalUserCount() {
    try {
      const response = await this.apiClient.request('/admin/users/count');
      return response.count;
    } catch (error) {
      console.error('Error fetching total user count:', error);
      throw error;
    }
  }

  // Update user role
  async updateUserRole(userId, newRole) {
    try {
      return await this.apiClient.request(`/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole }),
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  // Delete user (admin only)
  async deleteUser(userId) {
    try {
      return await this.apiClient.request(`/admin/users/${userId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Get admin analytics
  async getAnalytics(daysBack = 30) {
    try {
      return await this.apiClient.request(`/admin/analytics?days=${daysBack}`);
    } catch (error) {
      console.error('Error fetching admin analytics:', error);
      throw error;
    }
  }

  // Log admin action
  async logAction(actionName, targetType, targetId = null, details = {}) {
    try {
      return await this.apiClient.request('/admin/logs', {
        method: 'POST',
        body: JSON.stringify({
          action: actionName,
          target_type: targetType,
          target_id: targetId,
          details: details
        }),
      });
    } catch (error) {
      console.error('Error logging admin action:', error);
      throw error;
    }
  }

  // Get admin notifications
  async getNotifications(limit = 50) {
    try {
      return await this.apiClient.request(`/admin/notifications?limit=${limit}`);
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markNotificationRead(notificationId) {
    try {
      return await this.apiClient.request(`/admin/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Get recent activity
  async getRecentActivity() {
    try {
      return await this.apiClient.request('/admin/activity');
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }

  // Get audit logs
  async getAuditLogs(page = 1, limit = 50) {
    try {
      return await this.apiClient.request(`/admin/audit-logs?page=${page}&limit=${limit}`);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  }

  // Get support requests
  async getSupportRequests(status = null, page = 1, limit = 20) {
    try {
      let url = `/admin/support-requests?page=${page}&limit=${limit}`;
      if (status) {
        url += `&status=${status}`;
      }
      return await this.apiClient.request(url);
    } catch (error) {
      console.error('Error fetching support requests:', error);
      throw error;
    }
  }

  // Update support request
  async updateSupportRequest(requestId, status, adminResponse = null) {
    try {
      return await this.apiClient.request(`/admin/support-requests/${requestId}`, {
        method: 'PUT',
        body: JSON.stringify({
          status,
          admin_response: adminResponse
        }),
      });
    } catch (error) {
      console.error('Error updating support request:', error);
      throw error;
    }
  }

  // Get content statistics
  async getContentStats() {
    try {
      return await this.apiClient.request('/admin/content-stats');
    } catch (error) {
      console.error('Error fetching content stats:', error);
      throw error;
    }
  }

  // Get user growth data
  async getUserGrowth(days = 30) {
    try {
      return await this.apiClient.request(`/admin/user-growth?days=${days}`);
    } catch (error) {
      console.error('Error fetching user growth:', error);
      throw error;
    }
  }

  // Delete content
  async deleteContent(contentType, contentId) {
    try {
      return await this.apiClient.request(`/admin/content/${contentType}/${contentId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
  }

  // Toggle user ban
  async toggleUserBan(userId, isBanned, reason = null) {
    try {
      return await this.apiClient.request(`/admin/users/${userId}/ban`, {
        method: 'PUT',
        body: JSON.stringify({
          banned: isBanned,
          reason: reason
        }),
      });
    } catch (error) {
      console.error('Error toggling user ban:', error);
      throw error;
    }
  }

  // Get system health
  async getSystemHealth() {
    try {
      return await this.apiClient.request('/admin/health');
    } catch (error) {
      console.error('Error fetching system health:', error);
      throw error;
    }
  }
}

export const adminAPI = new AdminAPI();
export default adminAPI; 