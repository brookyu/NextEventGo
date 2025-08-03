import { apiClient } from './client';

// Sharing Types
export interface ShareLink {
  id: string;
  articleId: string;
  promotionCode: string;
  shareUrl: string;
  shortUrl: string;
  qrCodeUrl: string;
  platform: SharePlatform;
  title: string;
  description: string;
  imageUrl?: string;
  expiresAt?: string;
  isActive: boolean;
  clickCount: number;
  conversionCount: number;
  createdAt: string;
  createdBy: string;
}

export interface ShareStats {
  totalShares: number;
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  topPlatforms: Array<{
    platform: SharePlatform;
    shares: number;
    clicks: number;
    conversions: number;
  }>;
  recentShares: ShareLink[];
  performanceByDay: Array<{
    date: string;
    shares: number;
    clicks: number;
    conversions: number;
  }>;
}

export interface PromotionCode {
  id: string;
  code: string;
  articleId: string;
  title: string;
  description?: string;
  type: 'referral' | 'campaign' | 'social' | 'email' | 'qr';
  platform?: SharePlatform;
  isActive: boolean;
  expiresAt?: string;
  maxUses?: number;
  currentUses: number;
  clickCount: number;
  conversionCount: number;
  conversionRate: number;
  createdAt: string;
  createdBy: string;
  metadata?: Record<string, any>;
}

export interface SocialShareConfig {
  platform: SharePlatform;
  title: string;
  description: string;
  imageUrl?: string;
  hashtags?: string[];
  mentions?: string[];
  customMessage?: string;
}

export interface WeChatShareConfig {
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl: string;
  qrCodeSize?: 'small' | 'medium' | 'large';
  qrCodeStyle?: 'default' | 'branded' | 'custom';
  templateId?: string;
}

export interface ShareTemplate {
  id: string;
  name: string;
  platform: SharePlatform;
  title: string;
  description: string;
  imageUrl?: string;
  hashtags?: string[];
  customFields?: Record<string, string>;
  isDefault: boolean;
  createdAt: string;
}

export type SharePlatform = 
  | 'wechat' 
  | 'weibo' 
  | 'qq' 
  | 'douyin' 
  | 'xiaohongshu'
  | 'facebook' 
  | 'twitter' 
  | 'linkedin' 
  | 'instagram'
  | 'email' 
  | 'sms' 
  | 'copy' 
  | 'qr'
  | 'direct';

export interface ShareRequest {
  articleId: string;
  platform: SharePlatform;
  title?: string;
  description?: string;
  imageUrl?: string;
  promotionCode?: string;
  expiresAt?: string;
  customMessage?: string;
  hashtags?: string[];
  mentions?: string[];
  templateId?: string;
}

export interface BulkShareRequest {
  articleIds: string[];
  platforms: SharePlatform[];
  title?: string;
  description?: string;
  imageUrl?: string;
  promotionCode?: string;
  expiresAt?: string;
  templateId?: string;
}

export interface ShareAnalytics {
  shareId: string;
  articleId: string;
  platform: SharePlatform;
  promotionCode: string;
  clicks: number;
  conversions: number;
  conversionRate: number;
  topReferrers: Array<{
    referrer: string;
    clicks: number;
    conversions: number;
  }>;
  geographicData: Array<{
    country: string;
    city?: string;
    clicks: number;
    conversions: number;
  }>;
  deviceData: Array<{
    deviceType: string;
    platform: string;
    clicks: number;
    conversions: number;
  }>;
  timeSeriesData: Array<{
    timestamp: string;
    clicks: number;
    conversions: number;
  }>;
}

// Sharing API functions
export const sharingApi = {
  // Share Link Management
  createShareLink: (request: ShareRequest): Promise<ShareLink> =>
    apiClient.post('/sharing/links', request),

  getShareLinks: (articleId?: string, platform?: SharePlatform): Promise<ShareLink[]> =>
    apiClient.get('/sharing/links', { params: { articleId, platform } }),

  getShareLink: (id: string): Promise<ShareLink> =>
    apiClient.get(`/sharing/links/${id}`),

  updateShareLink: (id: string, updates: Partial<ShareLink>): Promise<ShareLink> =>
    apiClient.put(`/sharing/links/${id}`, updates),

  deleteShareLink: (id: string): Promise<void> =>
    apiClient.delete(`/sharing/links/${id}`),

  toggleShareLink: (id: string): Promise<ShareLink> =>
    apiClient.post(`/sharing/links/${id}/toggle`),

  // Bulk Sharing
  createBulkShares: (request: BulkShareRequest): Promise<ShareLink[]> =>
    apiClient.post('/sharing/bulk', request),

  // Promotion Code Management
  generatePromotionCode: (articleId: string, type: PromotionCode['type'], options?: {
    customCode?: string;
    expiresAt?: string;
    maxUses?: number;
    platform?: SharePlatform;
    description?: string;
  }): Promise<PromotionCode> =>
    apiClient.post('/sharing/promotion-codes', { articleId, type, ...options }),

  getPromotionCodes: (articleId?: string): Promise<PromotionCode[]> =>
    apiClient.get('/sharing/promotion-codes', { params: { articleId } }),

  getPromotionCode: (code: string): Promise<PromotionCode> =>
    apiClient.get(`/sharing/promotion-codes/${code}`),

  updatePromotionCode: (id: string, updates: Partial<PromotionCode>): Promise<PromotionCode> =>
    apiClient.put(`/sharing/promotion-codes/${id}`, updates),

  deletePromotionCode: (id: string): Promise<void> =>
    apiClient.delete(`/sharing/promotion-codes/${id}`),

  // WeChat Integration
  generateWeChatQR: (config: WeChatShareConfig): Promise<{
    qrCodeUrl: string;
    shortUrl: string;
    expiresAt: string;
  }> =>
    apiClient.post('/sharing/wechat/qr', config),

  shareToWeChatMoments: (articleId: string, config: WeChatShareConfig): Promise<{
    success: boolean;
    shareId: string;
    message?: string;
  }> =>
    apiClient.post('/sharing/wechat/moments', { articleId, ...config }),

  // Social Media Integration
  shareToSocialMedia: (platform: SharePlatform, config: SocialShareConfig): Promise<{
    success: boolean;
    shareUrl: string;
    shareId: string;
    message?: string;
  }> =>
    apiClient.post(`/sharing/social/${platform}`, config),

  getSocialShareUrl: (platform: SharePlatform, config: SocialShareConfig): Promise<{
    shareUrl: string;
    directUrl: string;
  }> =>
    apiClient.post(`/sharing/social/${platform}/url`, config),

  // Share Templates
  getShareTemplates: (platform?: SharePlatform): Promise<ShareTemplate[]> =>
    apiClient.get('/sharing/templates', { params: { platform } }),

  createShareTemplate: (template: Omit<ShareTemplate, 'id' | 'createdAt'>): Promise<ShareTemplate> =>
    apiClient.post('/sharing/templates', template),

  updateShareTemplate: (id: string, updates: Partial<ShareTemplate>): Promise<ShareTemplate> =>
    apiClient.put(`/sharing/templates/${id}`, updates),

  deleteShareTemplate: (id: string): Promise<void> =>
    apiClient.delete(`/sharing/templates/${id}`),

  // Analytics and Tracking
  getShareStats: (articleId?: string, startDate?: string, endDate?: string): Promise<ShareStats> =>
    apiClient.get('/sharing/stats', { params: { articleId, startDate, endDate } }),

  getShareAnalytics: (shareId: string, startDate?: string, endDate?: string): Promise<ShareAnalytics> =>
    apiClient.get(`/sharing/analytics/${shareId}`, { params: { startDate, endDate } }),

  trackShareClick: (shareId: string, metadata?: Record<string, any>): Promise<void> =>
    apiClient.post(`/sharing/track/click/${shareId}`, { metadata }),

  trackShareConversion: (shareId: string, metadata?: Record<string, any>): Promise<void> =>
    apiClient.post(`/sharing/track/conversion/${shareId}`, { metadata }),

  // Share Performance
  getTopPerformingShares: (limit?: number, startDate?: string, endDate?: string): Promise<Array<{
    shareLink: ShareLink;
    analytics: ShareAnalytics;
    performance: {
      clickThroughRate: number;
      conversionRate: number;
      engagementScore: number;
    };
  }>> =>
    apiClient.get('/sharing/performance/top', { params: { limit, startDate, endDate } }),

  compareSharePerformance: (shareIds: string[], startDate?: string, endDate?: string): Promise<{
    comparison: Array<{
      shareId: string;
      platform: SharePlatform;
      metrics: {
        clicks: number;
        conversions: number;
        conversionRate: number;
        engagementScore: number;
      };
    }>;
    insights: {
      bestPerforming: string;
      recommendations: string[];
    };
  }> =>
    apiClient.post('/sharing/performance/compare', { shareIds, startDate, endDate }),

  // Batch Operations
  bulkUpdateShares: (shareIds: string[], updates: Partial<ShareLink>): Promise<ShareLink[]> =>
    apiClient.put('/sharing/bulk/update', { shareIds, updates }),

  bulkDeleteShares: (shareIds: string[]): Promise<void> =>
    apiClient.delete('/sharing/bulk/delete', { data: { shareIds } }),

  // Export and Reporting
  exportShareData: (format: 'csv' | 'xlsx' | 'json' = 'csv', filters?: {
    articleId?: string;
    platform?: SharePlatform;
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> =>
    apiClient.get('/sharing/export', { 
      params: { format, ...filters },
      responseType: 'blob'
    }),

  generateShareReport: (reportType: 'summary' | 'detailed' | 'performance' = 'summary', filters?: {
    articleId?: string;
    platform?: SharePlatform;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    reportId: string;
    downloadUrl: string;
    generatedAt: string;
  }> =>
    apiClient.post('/sharing/reports', { reportType, filters }),
};

// Utility functions
export const getPlatformIcon = (platform: SharePlatform): string => {
  const icons: Record<SharePlatform, string> = {
    wechat: '💬',
    weibo: '🐦',
    qq: '🐧',
    douyin: '🎵',
    xiaohongshu: '📖',
    facebook: '📘',
    twitter: '🐦',
    linkedin: '💼',
    instagram: '📷',
    email: '📧',
    sms: '💬',
    copy: '📋',
    qr: '📱',
    direct: '🔗',
  };
  return icons[platform] || '🔗';
};

export const getPlatformName = (platform: SharePlatform): string => {
  const names: Record<SharePlatform, string> = {
    wechat: 'WeChat',
    weibo: 'Weibo',
    qq: 'QQ',
    douyin: 'Douyin',
    xiaohongshu: 'XiaoHongShu',
    facebook: 'Facebook',
    twitter: 'Twitter',
    linkedin: 'LinkedIn',
    instagram: 'Instagram',
    email: 'Email',
    sms: 'SMS',
    copy: 'Copy Link',
    qr: 'QR Code',
    direct: 'Direct Link',
  };
  return names[platform] || platform;
};

export const getPlatformColor = (platform: SharePlatform): string => {
  const colors: Record<SharePlatform, string> = {
    wechat: '#07C160',
    weibo: '#E6162D',
    qq: '#12B7F5',
    douyin: '#000000',
    xiaohongshu: '#FF2442',
    facebook: '#1877F2',
    twitter: '#1DA1F2',
    linkedin: '#0A66C2',
    instagram: '#E4405F',
    email: '#EA4335',
    sms: '#34A853',
    copy: '#6B7280',
    qr: '#374151',
    direct: '#8B5CF6',
  };
  return colors[platform] || '#6B7280';
};

export const formatShareUrl = (baseUrl: string, promotionCode: string, platform: SharePlatform): string => {
  const url = new URL(baseUrl);
  url.searchParams.set('ref', promotionCode);
  url.searchParams.set('utm_source', platform);
  url.searchParams.set('utm_medium', 'social');
  url.searchParams.set('utm_campaign', 'article_share');
  return url.toString();
};

export const generateShareText = (title: string, description: string, hashtags?: string[]): string => {
  let text = `${title}\n\n${description}`;
  if (hashtags && hashtags.length > 0) {
    text += `\n\n${hashtags.map(tag => `#${tag}`).join(' ')}`;
  }
  return text;
};
