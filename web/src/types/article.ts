export type ArticleStatus = 'draft' | 'published' | 'archived';

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
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  
  // Related data (included based on options)
  category?: ArticleCategory;
  coverImage?: ArticleImage;
  promotionImage?: ArticleImage;
  analytics?: ArticleAnalytics;
  qrCode?: QRCode;
}

export interface ArticleCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  
  // Statistics (included when requested)
  articleCount?: number;
}

export interface ArticleImage {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  url: string;
  thumbnailUrl: string;
  createdAt: string;
  updatedAt?: string;
}

export interface QRCode {
  id: string;
  code: string;
  url: string;
  imageUrl: string;
  expiresAt?: string;
  createdAt: string;
}

export interface ArticleAnalytics {
  articleId: string;
  viewCount: number;
  readCount: number;
  readingRate: number;
  averageReadTime: number;
  bounceRate: number;
  shareCount: number;
  viewsOverTime: TimeSeriesPoint[];
  readsOverTime: TimeSeriesPoint[];
  topReferrers: ReferrerStats[];
  deviceBreakdown: Record<string, number>;
  locationBreakdown: Record<string, number>;
  lastUpdated: string;
}

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
}

export interface ReferrerStats {
  referrer: string;
  count: number;
  rate: number;
}

// Request/Response Types

export interface ArticleCreateRequest {
  title: string;
  summary?: string;
  content: string;
  author: string;
  categoryId: string;
  siteImageId?: string;
  promotionPicId?: string;
  jumpResourceId?: string;
  frontCoverImageUrl?: string;
  isPublished?: boolean;
  tags?: string[];
}

export interface ArticleUpdateRequest {
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
  tags?: string[];
}

export interface ArticleSearchRequest {
  query?: string;
  categoryId?: string;
  author?: string;
  published?: boolean;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  
  // Pagination
  page?: number;
  limit?: number;
  
  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  
  // Include options
  includeCategory?: boolean;
  includeImages?: boolean;
  includeAnalytics?: boolean;
}

export interface ArticleListResponse {
  articles: Article[];
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Category Types

export interface CategoryCreateRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CategoryUpdateRequest {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
}

// Analytics Types

export interface ArticleViewTrackingData {
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  deviceType?: string;
  location?: string;
  sessionId?: string;
  userId?: string;
  metadata?: Record<string, string>;
}

export interface ArticleReadTrackingData extends ArticleViewTrackingData {
  readTime: number; // in seconds
  scrollDepth: number; // percentage
  readProgress: number; // percentage
}

// WeChat Integration Types

export interface WeChatPublishRequest {
  articleId: string;
  createDraft?: boolean;
  publishDirect?: boolean;
  scheduleTime?: string;
}

export interface WeChatPublishResponse {
  success: boolean;
  draftId?: string;
  publishId?: string;
  qrCodeUrl?: string;
  wechatUrl?: string;
  publishedAt: string;
  message: string;
}

// Bulk Operations Types

export interface BulkOperationRequest {
  articleIds: string[];
  action: 'publish' | 'unpublish' | 'delete' | 'updateCategory';
  data?: any;
}

export interface BulkOperationResponse {
  success: boolean;
  processed: number;
  failed: number;
  errors?: string[];
  message: string;
}

// Template Types

export interface ArticleTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  thumbnail?: string;
  category: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
}

export interface TemplateCreateRequest {
  name: string;
  description?: string;
  content: string;
  thumbnail?: string;
  category: string;
  isPublic?: boolean;
}

export interface TemplateUpdateRequest {
  name?: string;
  description?: string;
  content?: string;
  thumbnail?: string;
  category?: string;
  isPublic?: boolean;
}

// Media Types

export interface MediaFile {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number; // for videos
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
}

export interface MediaUploadRequest {
  file: File;
  category?: string;
  description?: string;
  tags?: string[];
}

export interface MediaUploadResponse {
  success: boolean;
  media: MediaFile;
  message: string;
}

// Content Validation Types

export interface ContentValidationRequest {
  title: string;
  content: string;
  checkPlagiarism?: boolean;
  checkGrammar?: boolean;
  checkSEO?: boolean;
}

export interface ContentValidationResponse {
  isValid: boolean;
  issues: ValidationIssue[];
  suggestions: string[];
  seoScore?: number;
  readabilityScore?: number;
}

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  category: 'plagiarism' | 'grammar' | 'seo' | 'content' | 'formatting';
  message: string;
  line?: number;
  column?: number;
  suggestion?: string;
}

// Author Settings Types

export interface AuthorSettings {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  socialLinks?: Record<string, string>;
  defaultCategory?: string;
  autoPublish?: boolean;
  emailNotifications?: boolean;
  wechatIntegration?: boolean;
  preferences: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthorSettingsUpdateRequest {
  displayName?: string;
  bio?: string;
  avatar?: string;
  socialLinks?: Record<string, string>;
  defaultCategory?: string;
  autoPublish?: boolean;
  emailNotifications?: boolean;
  wechatIntegration?: boolean;
  preferences?: Record<string, any>;
}
