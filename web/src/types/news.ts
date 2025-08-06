export interface NewsPublication {
  id: string
  title: string
  summary?: string
  description?: string
  type: 'breaking' | 'regular' | 'announcement' | 'update'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'draft' | 'published' | 'archived'
  isPublished: boolean
  publishedAt?: string
  scheduledAt?: string
  expiresAt?: string
  featuredImageUrl?: string
  thumbnailUrl?: string
  authorId?: string
  authorName?: string
  categoryIds?: string[]
  categoryNames?: string[]
  tagIds?: string[]
  tagNames?: string[]
  viewCount: number
  shareCount: number
  engagementCount: number
  readTime?: number
  isBreaking: boolean
  isFeatured: boolean
  isSticky: boolean
  allowComments: boolean
  requiresAuth: boolean
  targetAudience?: string[]
  wechatSettings?: NewsWeChatSettings
  seoSettings?: NewsSEOSettings
  articles: NewsArticle[]
  createdAt: string
  updatedAt?: string
}

export interface NewsArticle {
  id: string
  articleId: string
  newsId: string
  title: string
  summary?: string
  content?: string
  displayOrder: number
  isMainStory: boolean
  isFeatured: boolean
  isVisible: boolean
  section?: string
  featuredImageUrl?: string
  thumbnailUrl?: string
  readTime?: number
  wordCount?: number
  isPublished: boolean
  publishedAt?: string
  createdAt: string
  updatedAt?: string
}

export interface NewsWeChatSettings {
  enabled: boolean
  autoPost: boolean
  customTitle?: string
  customSummary?: string
  customImage?: string
  postTime?: string
  targetGroups?: string[]
}

export interface NewsSEOSettings {
  metaTitle?: string
  metaDescription?: string
  keywords?: string[]
  canonicalUrl?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
}

export interface NewsListItem {
  id: string
  title: string
  summary?: string
  type: string
  priority: string
  status: string
  isPublished: boolean
  publishedAt?: string
  featuredImageUrl?: string
  authorName?: string
  categoryNames?: string[]
  articleCount: number
  viewCount: number
  shareCount: number
  createdAt: string
  updatedAt?: string
}

export interface NewsListResponse {
  items: NewsListItem[]
  totalCount: number
  pageSize: number
  pageNumber: number
  totalPages: number
}

export interface NewsCreateRequest {
  title: string
  featuredImageId?: string
  scheduledAt?: string
  expiresAt?: string
  selectedArticleIds?: string[]
}

export interface NewsUpdateRequest extends Partial<NewsCreateRequest> {
  id: string
}

export interface NewsPublishRequest {
  publishedAt?: string
  scheduledAt?: string
}

export interface NewsFilter {
  search?: string
  type?: string
  priority?: string
  status?: string
  authorId?: string
  categoryId?: string
  tagId?: string
  isBreaking?: boolean
  isFeatured?: boolean
  isSticky?: boolean
  publishedAfter?: string
  publishedBefore?: string
  createdAfter?: string
  createdBefore?: string
  sortBy?: 'title' | 'publishedAt' | 'createdAt' | 'viewCount' | 'shareCount'
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

// Analytics Types
export interface NewsAnalytics {
  newsId: string
  title: string
  overallStats: NewsOverallStats
  dailyStats: NewsDailyStats[]
  geographicData: NewsGeographicData
  deviceData: NewsDeviceData
  referrerData: NewsReferrerData
  engagementData: NewsEngagementData
  wechatData?: NewsWeChatData
  articleStats: NewsArticleStats[]
  lastUpdated: string
}

export interface NewsOverallStats {
  totalViews: number
  totalReads: number
  totalShares: number
  totalEngagements: number
  uniqueVisitors: number
  avgReadTime: number
  bounceRate: number
  conversionRate: number
}

export interface NewsDailyStats {
  date: string
  views: number
  reads: number
  shares: number
  engagements: number
  uniqueVisitors: number
  avgReadTime: number
}

export interface NewsGeographicData {
  countries: CountryStats[]
  cities: CityStats[]
}

export interface CountryStats {
  country: string
  count: number
}

export interface CityStats {
  city: string
  country: string
  count: number
}

export interface NewsDeviceData {
  devices: DeviceStats[]
  platforms: PlatformStats[]
  browsers: BrowserStats[]
}

export interface DeviceStats {
  device: string
  count: number
}

export interface PlatformStats {
  platform: string
  count: number
}

export interface BrowserStats {
  browser: string
  count: number
}

export interface NewsReferrerData {
  referrers: ReferrerStats[]
  socialMedia: SocialMediaStats[]
  searchEngines: SearchEngineStats[]
}

export interface ReferrerStats {
  referrer: string
  views: number
  reads: number
  uniqueUsers: number
}

export interface SocialMediaStats {
  platform: string
  count: number
}

export interface SearchEngineStats {
  engine: string
  count: number
}

export interface NewsEngagementData {
  likes: number
  comments: number
  shares: number
  bookmarks: number
  downloads: number
  clickThroughs: number
}

export interface NewsWeChatData {
  views: number
  shares: number
  likes: number
  comments: number
  forwards: number
  groupShares: number
}

export interface NewsArticleStats {
  articleId: string
  title: string
  views: number
  reads: number
  shares: number
  avgReadTime: number
  completionRate: number
}

// Tracking Types
export interface NewsViewTrackingData {
  newsId: string
  userId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  referrer?: string
  promotionCode?: string
  country?: string
  city?: string
  deviceType?: string
  platform?: string
  browser?: string
  wechatOpenId?: string
  wechatUnionId?: string
}

export interface NewsReadTrackingData extends NewsViewTrackingData {
  readDuration: number
  readPercentage: number
  scrollDepth: number
}

export interface NewsShareTrackingData extends NewsViewTrackingData {
  sharePlatform: string
  shareType: string
}

export interface NewsEngagementTrackingData extends NewsViewTrackingData {
  engagementType: string
  engagementValue: string
}
