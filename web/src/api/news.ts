import axios from 'axios'

// Create a separate client for v2 API
const v2Client = axios.create({
  baseURL: '/api/v2',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})
import {
  NewsPublication,
  NewsListResponse,
  NewsCreateRequest,
  NewsUpdateRequest,
  NewsPublishRequest,
  NewsFilter,
  NewsAnalytics,
  NewsViewTrackingData,
  NewsReadTrackingData,
  NewsShareTrackingData,
  NewsEngagementTrackingData,
} from '../types/news'

// Base URL for news API (using v2 for new news system)
const NEWS_BASE_URL = '/news'

// News CRUD Operations
export const newsApi = {
  // List news with filtering and pagination
  async getNews(filter?: NewsFilter): Promise<NewsListResponse> {
    const params = new URLSearchParams()
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
    }
    
    const response = await v2Client.get(
      `${NEWS_BASE_URL}${params.toString() ? `?${params.toString()}` : ''}`
    )

    // Handle the nested response structure from our backend
    if (response.data && response.data.data) {
      return response.data.data
    }
    return response.data
  },

  // Get single news publication by ID
  async getNewsById(id: string): Promise<NewsPublication> {
    const response = await v2Client.get<{success: boolean, message: string, data: NewsPublication}>(`${NEWS_BASE_URL}/${id}`)
    return response.data.data
  },

  // Get news for editing (includes all articles and settings)
  async getNewsForEditing(id: string): Promise<NewsPublication> {
    const response = await v2Client.get<{success: boolean, message: string, data: NewsPublication}>(`${NEWS_BASE_URL}/${id}/for-editing`)
    return response.data.data
  },

  // Create new news publication
  async createNews(data: NewsCreateRequest): Promise<NewsPublication> {
    const response = await v2Client.post<NewsPublication>(NEWS_BASE_URL, data)
    return response.data
  },

  // Update existing news publication
  async updateNews(id: string, data: Partial<NewsUpdateRequest>): Promise<NewsPublication> {
    const response = await v2Client.put<{success: boolean, message: string, data: NewsPublication}>(`${NEWS_BASE_URL}/${id}`, data)
    return response.data.data
  },

  // Delete news publication
  async deleteNews(id: string): Promise<void> {
    await v2Client.delete(`${NEWS_BASE_URL}/${id}`)
  },

  // Publish news
  async publishNews(id: string, data?: NewsPublishRequest): Promise<NewsPublication> {
    const response = await v2Client.post<NewsPublication>(`${NEWS_BASE_URL}/${id}/publish`, data)
    return response.data
  },

  // Unpublish news
  async unpublishNews(id: string): Promise<NewsPublication> {
    const response = await v2Client.post<NewsPublication>(`${NEWS_BASE_URL}/${id}/unpublish`)
    return response.data
  },

  // Archive news
  async archiveNews(id: string): Promise<NewsPublication> {
    const response = await v2Client.post<NewsPublication>(`${NEWS_BASE_URL}/${id}/archive`)
    return response.data
  },

  // Article and Image Selection for News Creation
  async searchArticlesForSelection(params: {
    query?: string
    categoryId?: string
    author?: string
    isPublished?: boolean
    page?: number
    pageSize?: number
    sortBy?: string
    sortOrder?: string
  }): Promise<{
    articles: Array<{
      id: string
      title: string
      summary: string
      author: string
      categoryId?: string
      categoryName?: string
      frontCoverImageUrl?: string
      isPublished: boolean
      publishedAt?: string
      viewCount: number
      readCount: number
      tags: string[]
      createdAt: string
      updatedAt?: string
      isSelected: boolean
    }>
    pagination: {
      page: number
      pageSize: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value))
      }
    })

    const response = await v2Client.get(
      `${NEWS_BASE_URL}/articles/search?${searchParams.toString()}`
    )
    return response.data
  },

  async searchImagesForSelection(params: {
    query?: string
    mimeType?: string
    minWidth?: number
    maxWidth?: number
    minHeight?: number
    maxHeight?: number
    page?: number
    pageSize?: number
    sortBy?: string
    sortOrder?: string
  }): Promise<{
    images: Array<{
      id: string
      filename: string
      originalUrl: string
      thumbnailUrl: string
      fileSize: number
      mimeType: string
      width: number
      height: number
      altText: string
      description: string
      createdAt: string
      isSelected: boolean
    }>
    pagination: {
      page: number
      pageSize: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value))
      }
    })

    const response = await v2Client.get(
      `${NEWS_BASE_URL}/images/search?${searchParams.toString()}`
    )
    return response.data
  },

  // Create news with selected articles and images
  async createNewsWithSelectors(data: {
    title: string
    subtitle?: string
    summary?: string
    description?: string
    type: string
    priority: string
    featuredImageId?: string
    thumbnailImageId?: string
    selectedArticleIds: string[]
    categoryIds?: string[]
    allowComments?: boolean
    allowSharing?: boolean
    isFeatured?: boolean
    isBreaking?: boolean
    requireAuth?: boolean
    scheduledAt?: string
    expiresAt?: string
  }): Promise<{
    id: string
    title: string
    status: string
    message: string
    createdArticles: number
    processedImages: number
    weChatDraftId?: string
    weChatDraftStatus?: string
    scheduledAt?: string
    expiresAt?: string
  }> {
    const response = await v2Client.post(`${NEWS_BASE_URL}/create-with-selectors`, data)
    return response.data
  },

  // Duplicate news
  async duplicateNews(id: string, title?: string): Promise<NewsPublication> {
    const response = await v2Client.post<NewsPublication>(`${NEWS_BASE_URL}/${id}/duplicate`, { title })
    return response.data
  },

  // Bulk operations
  async bulkPublish(ids: string[]): Promise<void> {
    await v2Client.post(`${NEWS_BASE_URL}/bulk/publish`, { ids })
  },

  async bulkUnpublish(ids: string[]): Promise<void> {
    await v2Client.post(`${NEWS_BASE_URL}/bulk/unpublish`, { ids })
  },

  async bulkArchive(ids: string[]): Promise<void> {
    await v2Client.post(`${NEWS_BASE_URL}/bulk/archive`, { ids })
  },

  async bulkDelete(ids: string[]): Promise<void> {
    await v2Client.post(`${NEWS_BASE_URL}/bulk/delete`, { ids })
  },
}

// News Analytics API
export const newsAnalyticsApi = {
  // Get comprehensive analytics for a news publication
  async getNewsAnalytics(newsId: string, days: number = 30): Promise<NewsAnalytics> {
    const response = await v2Client.get<NewsAnalytics>(`${NEWS_BASE_URL}/${newsId}/analytics?days=${days}`)
    return response.data
  },

  // Track news view
  async trackView(data: NewsViewTrackingData): Promise<void> {
    await v2Client.post(`${NEWS_BASE_URL}/${data.newsId}/track/view`, data)
  },

  // Track news read
  async trackRead(data: NewsReadTrackingData): Promise<void> {
    await v2Client.post(`${NEWS_BASE_URL}/${data.newsId}/track/read`, data)
  },

  // Track news share
  async trackShare(data: NewsShareTrackingData): Promise<void> {
    await v2Client.post(`${NEWS_BASE_URL}/${data.newsId}/track/share`, data)
  },

  // Track news engagement
  async trackEngagement(data: NewsEngagementTrackingData): Promise<void> {
    await v2Client.post(`${NEWS_BASE_URL}/${data.newsId}/track/engagement`, data)
  },

  // Get analytics summary for dashboard
  async getAnalyticsSummary(days: number = 30): Promise<{
    totalViews: number
    totalReads: number
    totalShares: number
    totalEngagements: number
    topNews: Array<{
      id: string
      title: string
      views: number
      reads: number
      shares: number
    }>
    recentActivity: Array<{
      date: string
      views: number
      reads: number
      shares: number
    }>
  }> {
    const response = await v2Client.get(`${NEWS_BASE_URL}/analytics/summary?days=${days}`)
    return response.data
  },
}

// News Categories API (if needed)
export const newsCategoriesApi = {
  async getCategories(): Promise<Array<{ id: string; name: string; description?: string }>> {
    const response = await v2Client.get('/news/categories')
    return response.data
  },

  async createCategory(data: { name: string; description?: string }): Promise<{ id: string; name: string; description?: string }> {
    const response = await v2Client.post('/news/categories', data)
    return response.data
  },

  async updateCategory(id: string, data: { name?: string; description?: string }): Promise<{ id: string; name: string; description?: string }> {
    const response = await v2Client.put(`/news/categories/${id}`, data)
    return response.data
  },

  async deleteCategory(id: string): Promise<void> {
    await v2Client.delete(`/news/categories/${id}`)
  },
}

// News Tags API (if needed)
export const newsTagsApi = {
  async getTags(): Promise<Array<{ id: string; name: string; color?: string }>> {
    const response = await v2Client.get('/news/tags')
    return response.data
  },

  async createTag(data: { name: string; color?: string }): Promise<{ id: string; name: string; color?: string }> {
    const response = await v2Client.post('/news/tags', data)
    return response.data
  },

  async updateTag(id: string, data: { name?: string; color?: string }): Promise<{ id: string; name: string; color?: string }> {
    const response = await v2Client.put(`/news/tags/${id}`, data)
    return response.data
  },

  async deleteTag(id: string): Promise<void> {
    await v2Client.delete(`/news/tags/${id}`)
  },
}

// Export all APIs
export default {
  news: newsApi,
  analytics: newsAnalyticsApi,
  categories: newsCategoriesApi,
  tags: newsTagsApi,
}
