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
} from '@/types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api',
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

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return this.getAuthUser() !== null;
  }

  // Get current authenticated user
  public getUser(): any | null {
    return this.getAuthUser();
  }

  // CSRF token management
  private async getCsrfCookie(): Promise<void> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
    console.log('ApiService: Getting CSRF cookie from:', `${baseUrl}/sanctum/csrf-cookie`);
    try {
      const response = await this.api.get(`${baseUrl}/sanctum/csrf-cookie`);
      console.log('ApiService: CSRF cookie response:', response.status);
      console.log('ApiService: CSRF cookie headers:', response.headers);
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

  // Tools
  async getTools(filters?: ToolFilters): Promise<PaginatedResponse<AiTool>> {
    const response: AxiosResponse<PaginatedResponse<AiTool>> = await this.api.get('/tools', { params: filters });
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
    const response: AxiosResponse<AiTool[]> = await this.api.get('/recommendations/role-based', { 
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
}

// Create and export singleton instance
export const apiService = new ApiService();
export default apiService;