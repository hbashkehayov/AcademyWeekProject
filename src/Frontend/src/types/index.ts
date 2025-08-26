export interface User {
  id: string;
  name: string;
  email: string;
  display_name?: string;
  phone_number?: string;
  role_id?: string;
  organization_id?: string;
  role?: Role;
  organization?: Organization;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  website?: string;
  created_at: string;
  updated_at: string;
}

export interface AiTool {
  id: string;
  name: string;
  slug: string;
  description: string;
  detailed_description?: string;
  website_url: string;
  api_endpoint?: string;
  logo_url?: string;
  pricing_model?: PricingModel;
  features?: string[];
  integration_type: 'redirect' | 'api' | 'webhook';
  status: 'active' | 'pending' | 'inactive';
  submitted_by?: string;
  approved_by?: string;
  suggested_for_role?: string;
  average_rating?: number;
  categories?: Category[];
  roles?: Role[];
  submitted_by_user?: User;
  approved_by_user?: User;
  suggested_for_role_data?: Role;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string;
  description?: string;
  icon?: string;
  parent?: Category;
  children?: Category[];
  tools_count?: number;
  created_at: string;
  updated_at: string;
}

export interface PricingModel {
  type: 'free' | 'freemium' | 'paid' | 'enterprise';
  price?: number;
  currency?: string;
  billing_cycle?: 'monthly' | 'yearly' | 'one_time';
  free_tier?: boolean;
  trial_days?: number;
  details?: string;
}

export interface ToolRating {
  id: string;
  user_id: string;
  tool_id: string;
  rating: number;
  comment?: string;
  user?: User;
  tool?: AiTool;
  created_at: string;
  updated_at: string;
}

export interface UserToolUsage {
  id: string;
  user_id: string;
  tool_id: string;
  usage_count: number;
  last_used_at: string;
  is_favorite: boolean;
  user?: User;
  tool?: AiTool;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev?: string;
    next?: string;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  display_name?: string;
  phone_number?: string;
  role_id?: string;
  organization_id?: string;
}

export interface ToolFilters {
  category?: string;
  role?: string;
  status?: string;
  search?: string;
  pricing_type?: string;
}

export interface RecommendationFilters {
  role_id?: string;
  limit?: number;
}