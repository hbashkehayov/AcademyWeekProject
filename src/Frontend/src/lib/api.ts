import axios, { AxiosInstance, AxiosResponse } from 'axios';
import type {
  User,
  Role,
  Organization,
  AiTool,
  Category,
  ToolRating,
  UserToolUsage,
  ApiResponse,
  PaginatedResponse,
  LoginCredentials,
  RegisterData,
  ToolFilters,
  RecommendationFilters,
  Recipe,
  RecipeFilters,
} from '@/types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: true,
    });

    // Add request interceptor for session-based authentication
    this.api.interceptors.request.use(
      (config) => {
        // For session-based auth, we don't need to set Authorization header
        // The cookies will be sent automatically with credentials: 'include'
        config.withCredentials = true;
        
        // Add CSRF token if available
        const getCsrfToken = () => {
          const cookies = document.cookie.split(';');
          for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'XSRF-TOKEN') {
              return decodeURIComponent(value);
            }
          }
          return null;
        };
        
        const csrfToken = getCsrfToken();
        if (csrfToken) {
          config.headers['X-XSRF-TOKEN'] = csrfToken;
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 419) {
          // 401 = Unauthorized, 419 = Session expired/CSRF mismatch
          this.clearAuth();
          // Redirect to login if not already there
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/')) {
            window.location.href = '/';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth management for session-based authentication
  private getAuthUser(): any | null {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem('sanctum_user');
    return userData ? JSON.parse(userData) : null;
  }

  private setAuthUser(user: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sanctum_user', JSON.stringify(user));
    }
  }

  private clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sanctum_user');
      localStorage.removeItem('auth_token'); // Legacy cleanup
    }
  }

  // Public method to clear user data without redirecting
  public clearUserData(): void {
    this.clearAuth();
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return this.getAuthUser() !== null;
  }

  // Get current authenticated user
  public getUser(): any | null {
    return this.getAuthUser();
  }

  // CSRF token management
  async getCsrfCookie(): Promise<void> {
    // Remove /api from the URL for sanctum csrf-cookie endpoint
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace('/api', '');
    console.log('ApiService: Getting CSRF cookie from:', `${baseUrl}/sanctum/csrf-cookie`);
    try {
      // Use direct fetch instead of axios to avoid baseURL issues
      const response = await fetch(`${baseUrl}/sanctum/csrf-cookie`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      console.log('ApiService: CSRF cookie response:', response.status);
      if (!response.ok) {
        throw new Error(`CSRF cookie request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('ApiService: Error getting CSRF cookie:', error);
      throw error;
    }
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<{ user: User }> {
    await this.getCsrfCookie();
    const response: AxiosResponse<{ user: User; message: string }> = await this.api.post('/login', credentials);
    const { user } = response.data;
    this.setAuthUser(user);
    return { user };
  }

  async register(data: RegisterData): Promise<{ user: User }> {
    await this.getCsrfCookie();
    const response: AxiosResponse<{ user: User; message: string }> = await this.api.post('/register', data);
    const { user } = response.data;
    this.setAuthUser(user);
    return { user };
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/logout');
    } finally {
      this.clearAuth();
      // Redirect to home page after logout
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get('/user');
    return response.data;
  }

  // Profile Management
  async getUserProfile(): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get('/profile');
    return response.data;
  }

  async updateUserProfile(data: {
    name: string;
    display_name: string;
    email: string;
    phone_number?: string;
  }): Promise<User> {
    await this.getCsrfCookie();
    const response: AxiosResponse<User> = await this.api.put('/profile', data);
    return response.data;
  }

  async changePassword(data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<void> {
    await this.getCsrfCookie();
    await this.api.post('/profile/change-password', data);
  }

  async getAllRoles(): Promise<Role[]> {
    const response: AxiosResponse<Role[]> = await this.api.get('/roles');
    return response.data;
  }

  // Role Change Requests
  async requestRoleChange(data: {
    requested_role_id: string;
    reason: string;
  }): Promise<void> {
    await this.getCsrfCookie();
    await this.api.post('/profile/request-role-change', data);
  }

  async getUserRoleChangeRequests(): Promise<any[]> {
    const response: AxiosResponse<any[]> = await this.api.get('/profile/role-change-requests');
    return response.data;
  }

  // Admin: Role Change Request Management
  async getAllPendingRoleChangeRequests(): Promise<any[]> {
    const response: AxiosResponse<any[]> = await this.api.get('/admin/role-change-requests');
    return response.data;
  }

  async processRoleChangeRequest(requestId: string, action: 'approve' | 'reject', adminComment?: string): Promise<void> {
    await this.getCsrfCookie();
    await this.api.post(`/admin/role-change-requests/${requestId}/process`, {
      action,
      admin_comment: adminComment
    });
  }

  // Tools
  async getTools(filters?: ToolFilters): Promise<PaginatedResponse<AiTool>> {
    // Request more items per page to avoid missing tools
    const params = { ...filters, per_page: 100 };
    const response: AxiosResponse<PaginatedResponse<AiTool>> = await this.api.get('/tools', { params });
    return response.data;
  }

  async getTool(slug: string): Promise<AiTool> {
    const response: AxiosResponse<AiTool> = await this.api.get(`/tools/${slug}`);
    return response.data;
  }

  async searchTools(query: string): Promise<AiTool[]> {
    const response: AxiosResponse<AiTool[]> = await this.api.get('/tools/search', { params: { q: query } });
    return response.data;
  }

  async createTool(data: Partial<AiTool>): Promise<AiTool> {
    console.log('ApiService: createTool called with data:', data);
    
    try {
      // Get CSRF token before making the request
      console.log('ApiService: Getting CSRF token...');
      await this.getCsrfCookie();
      
      console.log('ApiService: Making POST request to /tools...');
      const response: AxiosResponse<AiTool> = await this.api.post('/tools', data);
      console.log('ApiService: POST request successful, response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('ApiService: Error in createTool:', error);
      
      if (error.response) {
        console.error('ApiService: Error response status:', error.response.status);
        console.error('ApiService: Error response data:', error.response.data);
        console.error('ApiService: Error response headers:', error.response.headers);
      }
      
      throw error;
    }
  }

  async updateTool(id: string, data: Partial<AiTool>): Promise<AiTool> {
    const response: AxiosResponse<AiTool> = await this.api.put(`/tools/${id}`, data);
    return response.data;
  }

  async deleteTool(id: string): Promise<void> {
    await this.api.delete(`/tools/${id}`);
  }

  async approveTool(id: string): Promise<AiTool> {
    await this.getCsrfCookie();
    const response: AxiosResponse<AiTool> = await this.api.post(`/admin/tools/${id}/approve`);
    return response.data;
  }

  async rejectTool(id: string, reason?: string): Promise<void> {
    await this.getCsrfCookie();
    await this.api.post(`/admin/tools/${id}/reject`, { reason });
  }

  async getUsers(): Promise<User[]> {
    const response: AxiosResponse<{ data: User[] }> = await this.api.get('/admin/users');
    return response.data.data;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.getCsrfCookie();
    await this.api.delete(`/admin/users/${userId}`);
  }

  async getAdminStats(): Promise<any> {
    const response: AxiosResponse<{ data: any }> = await this.api.get('/admin/stats');
    return response.data.data;
  }

  async rateTool(toolId: string, rating: number, comment?: string): Promise<ToolRating> {
    const response: AxiosResponse<ToolRating> = await this.api.post(`/tools/${toolId}/rate`, { rating, comment });
    return response.data;
  }

  async toggleFavoriteTool(toolId: string): Promise<{ is_favorite: boolean }> {
    const response: AxiosResponse<{ is_favorite: boolean }> = await this.api.post(`/tools/${toolId}/favorite`);
    return response.data;
  }

  async trackToolUsage(toolId: string): Promise<UserToolUsage> {
    const response: AxiosResponse<UserToolUsage> = await this.api.post(`/tools/${toolId}/usage`);
    return response.data;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const response: AxiosResponse<Category[]> = await this.api.get('/categories');
    return response.data;
  }

  async getCategory(slug: string): Promise<Category> {
    const response: AxiosResponse<Category> = await this.api.get(`/categories/${slug}`);
    return response.data;
  }

  // Roles
  async getRoles(): Promise<Role[]> {
    const response: AxiosResponse<Role[]> = await this.api.get('/roles');
    return response.data;
  }

  async getRoleTools(roleId: string): Promise<AiTool[]> {
    const response: AxiosResponse<AiTool[]> = await this.api.get(`/roles/${roleId}/tools`);
    return response.data;
  }

  // Recommendations
  async getRecommendations(filters?: RecommendationFilters): Promise<AiTool[]> {
    const response: AxiosResponse<AiTool[]> = await this.api.get('/recommendations', { params: filters });
    return response.data;
  }

  async getRoleBasedRecommendations(roleId?: string): Promise<AiTool[]> {
    const response: AxiosResponse<AiTool[]> = await this.api.get('/api/recommendations/role-based', { 
      params: roleId ? { role_id: roleId } : undefined 
    });
    return response.data;
  }

  // User Tools
  async getFavoriteTools(): Promise<AiTool[]> {
    const response: AxiosResponse<AiTool[]> = await this.api.get('/user/favorites');
    return response.data;
  }

  async getToolHistory(): Promise<UserToolUsage[]> {
    const response: AxiosResponse<UserToolUsage[]> = await this.api.get('/user/history');
    return response.data;
  }

  // 2FA Methods
  async complete2FASetup(userId: number, verificationCode: string): Promise<{ recovery_codes: string[] }> {
    await this.getCsrfCookie();
    const response: AxiosResponse<{ recovery_codes: string[] }> = await this.api.post('/2fa/complete-setup', {
      user_id: userId,
      verification_code: verificationCode
    });
    return response.data;
  }

  async sendEmailCode(email: string): Promise<void> {
    await this.getCsrfCookie();
    await this.api.post('/2fa/send-email-code', { email });
  }

  async verify2FALogin(email: string, code: string, method: 'totp' | 'email' | 'recovery'): Promise<{ user: User }> {
    await this.getCsrfCookie();
    const response: AxiosResponse<{ user: User }> = await this.api.post('/2fa/verify-login', {
      email,
      code,
      method
    });
    return response.data;
  }

  async get2FAAvailableMethods(email: string): Promise<{ methods: string[] }> {
    const response: AxiosResponse<{ methods: string[] }> = await this.api.post('/2fa/available-methods', { email });
    return response.data;
  }

  async resend2FAQrCode(userId: number): Promise<{ secret: string; qr_code_url: string; qr_code_image: string }> {
    await this.getCsrfCookie();
    const response: AxiosResponse<{ secret: string; qr_code_url: string; qr_code_image: string }> = 
      await this.api.post('/2fa/resend-qr', { user_id: userId });
    return response.data;
  }

  // AI Assistant - Utility methods for context gathering
  async getToolsForContext(): Promise<AiTool[]> {
    const response: AxiosResponse<PaginatedResponse<AiTool>> = await this.api.get('/tools', { 
      params: { per_page: 50 } 
    });
    return response.data.data;
  }

  async getUserContextForAI(): Promise<{user: User, favoriteTools: AiTool[], recentTools: UserToolUsage[]}> {
    try {
      const [user, favoriteTools, recentTools] = await Promise.all([
        this.getCurrentUser(),
        this.getFavoriteTools(),
        this.getToolHistory()
      ]);
      
      return { user, favoriteTools, recentTools };
    } catch (error) {
      // Return minimal context if user is not authenticated
      return { 
        user: {} as User, 
        favoriteTools: [], 
        recentTools: [] 
      };
    }
  }

  // Recipe API methods
  async getRecipes(filters?: RecipeFilters): Promise<ApiResponse<Recipe[]>> {
    const response: AxiosResponse<ApiResponse<Recipe[]>> = await this.api.get('/recipes', {
      params: filters
    });
    return response.data;
  }

  async getFeaturedRecipes(): Promise<ApiResponse<Recipe[]>> {
    const response: AxiosResponse<ApiResponse<Recipe[]>> = await this.api.get('/recipes/featured');
    return response.data;
  }

  async getPopularRecipes(): Promise<ApiResponse<Recipe[]>> {
    const response: AxiosResponse<ApiResponse<Recipe[]>> = await this.api.get('/recipes/popular');
    return response.data;
  }

  async getRecipe(id: string): Promise<ApiResponse<Recipe>> {
    const response: AxiosResponse<ApiResponse<Recipe>> = await this.api.get(`/recipes/${id}`);
    return response.data;
  }

  async createRecipe(recipeData: Partial<Recipe>): Promise<Recipe> {
    const response: AxiosResponse<ApiResponse<Recipe>> = await this.api.post('/recipes', recipeData);
    return response.data.data;
  }

  async updateRecipe(id: string, recipeData: Partial<Recipe>): Promise<Recipe> {
    const response: AxiosResponse<ApiResponse<Recipe>> = await this.api.put(`/recipes/${id}`, recipeData);
    return response.data.data;
  }

  async deleteRecipe(id: string): Promise<void> {
    await this.api.delete(`/recipes/${id}`);
  }

  async incrementRecipeUses(id: string): Promise<void> {
    await this.api.post(`/recipes/${id}/increment-uses`);
  }
}

// Create and export singleton instance
export const apiService = new ApiService();
export default apiService;