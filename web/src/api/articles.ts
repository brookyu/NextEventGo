import { apiClient } from './client';

// Types
export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  categoryId: string;
  siteImageId?: string;
  promotionPicId?: string;
  jumpResourceId?: string;
  promotionCode: string;
  frontCoverImageUrl: string;
  isPublished: boolean;
  publishedAt?: string;
  viewCount: number;
  readCount: number;
  category?: Category;
  coverImage?: Image;
  promotionImage?: Image;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CategoryWithStats extends Category {
  articleCount: number;
  publishedCount: number;
  draftCount: number;
}

export interface Image {
  id: string;
  name: string;
  url: string;
  fileSize: number;
  mimeType: string;
}

export interface CreateArticleRequest {
  title: string;
  summary: string;
  content: string;
  author: string;
  categoryId: string;
  siteImageId?: string;
  promotionPicId?: string;
  jumpResourceId?: string;
  frontCoverImageUrl: string;
  isPublished: boolean;
}

export interface UpdateArticleRequest {
  title?: string;
  summary?: string;
  content?: string;
  author?: string;
  categoryId?: string;
  siteImageId?: string;
  promotionPicId?: string;
  jumpResourceId?: string;
  frontCoverImageUrl?: string;
  isPublished?: boolean;
}

export interface ArticleListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  author?: string;
  isPublished?: boolean;
  sortBy?: 'title' | 'created_at' | 'view_count' | 'read_count';
  sortOrder?: 'asc' | 'desc';
  includeCategory?: boolean;
  includeImages?: boolean;
}

export interface ArticleListResponse {
  data: Article[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ArticleTrackingData {
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  promotionCode?: string;
  readDuration?: number;
  readPercentage?: number;
  scrollDepth?: number;
  country?: string;
  city?: string;
  deviceType?: string;
  platform?: string;
  browser?: string;
  weChatOpenId?: string;
  weChatUnionId?: string;
}

export interface ArticleAnalytics {
  articleId: string;
  totalViews: number;
  totalReads: number;
  uniqueUsers: number;
  avgReadTime: number;
  readingRate: number;
  topReferrers: Array<{ referrer: string; count: number }>;
  dailyStats: Array<{
    date: string;
    views: number;
    reads: number;
    uniqueUsers: number;
    avgReadTime: number;
    completionRate: number;
  }>;
  geographicStats: Array<{ country: string; city: string; count: number }>;
  deviceStats: Array<{ deviceType: string; platform: string; count: number }>;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
  sortOrder?: number;
  isActive?: boolean;
  color?: string;
  icon?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
  color?: string;
  icon?: string;
}

// Article API functions
export const articlesApi = {
  // Article CRUD
  getArticles: (params?: ArticleListParams): Promise<ArticleListResponse> =>
    apiClient.get('/articles', { params }),

  getArticle: (id: string): Promise<Article> =>
    apiClient.get(`/articles/${id}`),

  createArticle: (data: CreateArticleRequest): Promise<Article> =>
    apiClient.post('/articles', data),

  updateArticle: (id: string, data: UpdateArticleRequest): Promise<Article> =>
    apiClient.put(`/articles/${id}`, data),

  deleteArticle: (id: string): Promise<void> =>
    apiClient.delete(`/articles/${id}`),

  // Publishing
  publishArticle: (id: string): Promise<Article> =>
    apiClient.post(`/articles/${id}/publish`),

  unpublishArticle: (id: string): Promise<Article> =>
    apiClient.post(`/articles/${id}/unpublish`),

  publishMultipleArticles: (articleIds: string[]): Promise<{ success: string[]; failed: string[] }> =>
    apiClient.post('/articles/publish', { articleIds }),

  // Analytics
  trackView: (id: string, data: ArticleTrackingData): Promise<void> =>
    apiClient.post(`/articles/${id}/track/view`, data),

  trackRead: (id: string, data: ArticleTrackingData): Promise<void> =>
    apiClient.post(`/articles/${id}/track/read`, data),

  getAnalytics: (id: string, days?: number): Promise<ArticleAnalytics> =>
    apiClient.get(`/articles/${id}/analytics`, { params: { days } }),

  // Public access
  getPublishedArticles: (params?: ArticleListParams): Promise<ArticleListResponse> =>
    apiClient.get('/public/articles', { params }),

  getPublishedArticle: (id: string): Promise<Article> =>
    apiClient.get(`/public/articles/${id}`),
};

// Category API functions
export const categoriesApi = {
  getCategories: (includeStats?: boolean): Promise<Category[] | CategoryWithStats[]> =>
    apiClient.get('/categories', { params: { includeStats } }),

  getCategory: (id: string): Promise<Category> =>
    apiClient.get(`/categories/${id}`),

  createCategory: (data: CreateCategoryRequest): Promise<Category> =>
    apiClient.post('/categories', data),

  updateCategory: (id: string, data: UpdateCategoryRequest): Promise<Category> =>
    apiClient.put(`/categories/${id}`, data),

  deleteCategory: (id: string): Promise<void> =>
    apiClient.delete(`/categories/${id}`),

  // Public access
  getActiveCategories: (): Promise<Category[]> =>
    apiClient.get('/public/categories'),
};

// Utility functions
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  let deviceType = 'desktop';
  let platform = 'unknown';
  let browser = 'unknown';

  // Device type detection
  if (/Mobile|Android|iPhone/.test(userAgent)) {
    deviceType = 'mobile';
  } else if (/Tablet|iPad/.test(userAgent)) {
    deviceType = 'tablet';
  }

  // Platform detection
  if (/Windows/.test(userAgent)) {
    platform = 'Windows';
  } else if (/Mac|macOS/.test(userAgent)) {
    platform = 'macOS';
  } else if (/Linux/.test(userAgent)) {
    platform = 'Linux';
  } else if (/Android/.test(userAgent)) {
    platform = 'Android';
  } else if (/iOS|iPhone|iPad/.test(userAgent)) {
    platform = 'iOS';
  }

  // Browser detection
  if (/Chrome/.test(userAgent)) {
    browser = 'Chrome';
  } else if (/Firefox/.test(userAgent)) {
    browser = 'Firefox';
  } else if (/Safari/.test(userAgent)) {
    browser = 'Safari';
  } else if (/Edge/.test(userAgent)) {
    browser = 'Edge';
  } else if (/MicroMessenger/.test(userAgent)) {
    browser = 'WeChat';
  }

  return { deviceType, platform, browser };
};

export const createTrackingData = (additionalData?: Partial<ArticleTrackingData>): ArticleTrackingData => {
  const deviceInfo = getDeviceInfo();
  
  return {
    sessionId: generateSessionId(),
    userAgent: navigator.userAgent,
    referrer: document.referrer,
    ...deviceInfo,
    ...additionalData,
  };
};
