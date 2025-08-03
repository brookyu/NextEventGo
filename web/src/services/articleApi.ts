import { 
  Article, 
  ArticleCategory, 
  ArticleTag, 
  CreateArticleRequest, 
  UpdateArticleRequest,
  ArticleListOptions,
  ArticleGetOptions,
  BulkOperation,
  BulkOperationResult,
  WeChatQRCode,
  WeChatContentResponse,
  ArticleAnalytics,
  PaginationResponse,
  ApiResponse
} from '@/types/article'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v2'

class ArticleApiService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('auth-token')
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const data: ApiResponse<T> = await response.json()
    
    if (!data.success) {
      throw new Error(data.message || 'API request failed')
    }

    return data.data
  }

  // Article CRUD operations
  async getArticles(options: ArticleListOptions = {}): Promise<PaginationResponse<Article>> {
    const params = new URLSearchParams()
    
    if (options.page) params.append('page', options.page.toString())
    if (options.limit) params.append('limit', options.limit.toString())
    if (options.search) params.append('search', options.search)
    if (options.categoryId) params.append('categoryId', options.categoryId)
    if (options.status && options.status !== 'all') params.append('status', options.status)
    if (options.sortBy) params.append('sortBy', options.sortBy)
    if (options.sortOrder) params.append('sortOrder', options.sortOrder)
    if (options.includeCategory) params.append('include_category', 'true')
    if (options.includeTags) params.append('include_tags', 'true')
    if (options.includeImages) params.append('include_images', 'true')

    const queryString = params.toString()
    return this.request<PaginationResponse<Article>>(
      `/articles${queryString ? `?${queryString}` : ''}`
    )
  }

  async getArticle(id: string, options: ArticleGetOptions = {}): Promise<Article> {
    const params = new URLSearchParams()
    
    if (options.includeCategory) params.append('include_category', 'true')
    if (options.includeTags) params.append('include_tags', 'true')
    if (options.includeImages) params.append('include_images', 'true')
    if (options.trackView) params.append('track_view', 'true')

    const queryString = params.toString()
    return this.request<Article>(
      `/articles/${id}${queryString ? `?${queryString}` : ''}`
    )
  }

  async getArticleByPromotionCode(code: string, options: ArticleGetOptions = {}): Promise<Article> {
    const params = new URLSearchParams()
    
    if (options.trackView !== false) params.append('track_view', 'true')

    const queryString = params.toString()
    return this.request<Article>(
      `/articles/promo/${code}${queryString ? `?${queryString}` : ''}`
    )
  }

  async createArticle(data: CreateArticleRequest): Promise<Article> {
    return this.request<Article>('/articles', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateArticle(id: string, data: UpdateArticleRequest): Promise<Article> {
    return this.request<Article>(`/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteArticle(id: string): Promise<void> {
    await this.request<void>(`/articles/${id}`, {
      method: 'DELETE',
    })
  }

  async publishArticle(id: string): Promise<Article> {
    return this.request<Article>(`/articles/${id}/publish`, {
      method: 'POST',
    })
  }

  async unpublishArticle(id: string): Promise<Article> {
    return this.request<Article>(`/articles/${id}/unpublish`, {
      method: 'POST',
    })
  }

  async bulkOperation(operation: BulkOperation): Promise<BulkOperationResult> {
    return this.request<BulkOperationResult>('/articles/bulk', {
      method: 'POST',
      body: JSON.stringify(operation),
    })
  }

  // WeChat Integration
  async generateWeChatQRCode(articleId: string, type: 'permanent' | 'temporary'): Promise<WeChatQRCode> {
    return this.request<WeChatQRCode>(`/articles/${articleId}/wechat/qrcode?type=${type}`, {
      method: 'POST',
    })
  }

  async getWeChatQRCodes(articleId: string): Promise<WeChatQRCode[]> {
    return this.request<WeChatQRCode[]>(`/articles/${articleId}/wechat/qrcodes`)
  }

  async revokeWeChatQRCode(qrCodeId: string): Promise<void> {
    await this.request<void>(`/articles/wechat/qrcodes/${qrCodeId}/revoke`, {
      method: 'POST',
    })
  }

  async getWeChatContent(articleId: string): Promise<WeChatContentResponse> {
    return this.request<WeChatContentResponse>(`/articles/${articleId}/wechat/share-info`)
  }

  async trackQRCodeScan(qrCodeId: string, scanData: any): Promise<void> {
    await this.request<void>(`/articles/wechat/qrcodes/${qrCodeId}/scan`, {
      method: 'POST',
      body: JSON.stringify(scanData),
    })
  }

  // Analytics
  async getAnalytics(articleId: string, timeRange: string = '30d'): Promise<ArticleAnalytics> {
    return this.request<ArticleAnalytics>(`/articles/${articleId}/analytics?range=${timeRange}`)
  }

  async getAnalyticsSummary(): Promise<any> {
    return this.request<any>('/articles/analytics/summary')
  }

  // Categories
  async getCategories(): Promise<ArticleCategory[]> {
    return this.request<ArticleCategory[]>('/categories')
  }

  async getCategory(id: string): Promise<ArticleCategory> {
    return this.request<ArticleCategory>(`/categories/${id}`)
  }

  async createCategory(data: Omit<ArticleCategory, 'id' | 'createdAt' | 'updatedAt' | 'articleCount'>): Promise<ArticleCategory> {
    return this.request<ArticleCategory>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCategory(id: string, data: Partial<ArticleCategory>): Promise<ArticleCategory> {
    return this.request<ArticleCategory>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteCategory(id: string): Promise<void> {
    await this.request<void>(`/categories/${id}`, {
      method: 'DELETE',
    })
  }

  // Tags
  async getTags(): Promise<ArticleTag[]> {
    return this.request<ArticleTag[]>('/tags')
  }

  async getTag(id: string): Promise<ArticleTag> {
    return this.request<ArticleTag>(`/tags/${id}`)
  }

  async createTag(data: Omit<ArticleTag, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<ArticleTag> {
    return this.request<ArticleTag>('/tags', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTag(id: string, data: Partial<ArticleTag>): Promise<ArticleTag> {
    return this.request<ArticleTag>(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteTag(id: string): Promise<void> {
    await this.request<void>(`/tags/${id}`, {
      method: 'DELETE',
    })
  }

  async searchTags(query: string): Promise<ArticleTag[]> {
    return this.request<ArticleTag[]>(`/tags/search?q=${encodeURIComponent(query)}`)
  }

  // Search
  async searchArticles(query: string, options: ArticleListOptions = {}): Promise<PaginationResponse<Article>> {
    const params = new URLSearchParams()
    params.append('q', query)
    
    if (options.page) params.append('page', options.page.toString())
    if (options.limit) params.append('limit', options.limit.toString())
    if (options.categoryId) params.append('categoryId', options.categoryId)
    if (options.status && options.status !== 'all') params.append('status', options.status)

    return this.request<PaginationResponse<Article>>(`/articles/search?${params.toString()}`)
  }

  // File upload (for images)
  async uploadImage(file: File): Promise<{ id: string; url: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const token = localStorage.getItem('auth-token')
    
    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to upload image')
    }

    const data: ApiResponse<{ id: string; url: string }> = await response.json()
    
    if (!data.success) {
      throw new Error(data.message || 'Image upload failed')
    }

    return data.data
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/articles/health')
  }

  // WeChat health check
  async wechatHealthCheck(): Promise<{ status: string; features: Record<string, boolean> }> {
    return this.request<{ status: string; features: Record<string, boolean> }>('/articles/wechat/health')
  }
}

export const articleApi = new ArticleApiService()
export default articleApi
