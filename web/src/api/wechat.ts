import { api } from './client'
import type { 
  WeChatMessage, 
  WeChatUser, 
  WeChatConfig, 
  WeChatStatistics,
  WeChatWebhookStatus,
  MessageFilters 
} from '@/types/wechat'

export const wechatApi = {
  // Message management
  getMessages: (params?: {
    offset?: number
    limit?: number
    search?: string
    type?: string
    status?: string
    dateRange?: { start: string; end: string }
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => {
    return api.get<{
      messages: WeChatMessage[]
      pagination: {
        offset: number
        limit: number
        count: number
        total: number
      }
    }>('/wechat/messages', { params })
  },

  getMessage: (id: string) => {
    return api.get<WeChatMessage>(`/wechat/messages/${id}`)
  },

  sendMessage: (data: {
    toUser: string
    messageType: 'text' | 'image' | 'voice' | 'video' | 'music' | 'news'
    content: string
    mediaId?: string
  }) => {
    return api.post<WeChatMessage>('/wechat/messages', data)
  },

  // WeChat users
  getWeChatUsers: (params?: {
    offset?: number
    limit?: number
    search?: string
    status?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => {
    return api.get<{
      users: WeChatUser[]
      pagination: {
        offset: number
        limit: number
        count: number
        total: number
      }
    }>('/wechat/users', { params })
  },

  getWeChatUser: (openId: string) => {
    return api.get<WeChatUser>(`/wechat/users/${openId}`)
  },

  updateWeChatUser: (openId: string, data: Partial<WeChatUser>) => {
    return api.put<WeChatUser>(`/wechat/users/${openId}`, data)
  },

  // Statistics and analytics
  getWeChatStatistics: (params?: {
    dateRange?: { start: string; end: string }
    granularity?: 'hour' | 'day' | 'week' | 'month'
  }) => {
    return api.get<WeChatStatistics>('/wechat/statistics', { params })
  },

  getMessageAnalytics: (params?: {
    dateRange?: { start: string; end: string }
    groupBy?: 'type' | 'status' | 'hour' | 'day'
  }) => {
    return api.get<{
      totalMessages: number
      messagesByType: { type: string; count: number }[]
      messagesByStatus: { status: string; count: number }[]
      messageTrend: { date: string; count: number }[]
      responseRate: number
      averageResponseTime: number
    }>('/wechat/analytics/messages', { params })
  },

  getUserEngagement: (params?: {
    dateRange?: { start: string; end: string }
  }) => {
    return api.get<{
      activeUsers: number
      newUsers: number
      returningUsers: number
      engagementRate: number
      userActivityTrend: { date: string; active: number; new: number }[]
      topUsers: { openId: string; nickname: string; messageCount: number }[]
    }>('/wechat/analytics/users', { params })
  },

  // Integration health and monitoring
  getIntegrationHealth: () => {
    return api.get<{
      status: 'healthy' | 'warning' | 'error'
      apiStatus: 'connected' | 'disconnected' | 'error'
      webhookStatus: 'active' | 'inactive' | 'error'
      lastHeartbeat: string
      responseTime: number
      errorRate: number
      uptime: number
      issues: {
        type: 'warning' | 'error'
        message: string
        timestamp: string
      }[]
    }>('/wechat/health')
  },

  getWebhookStatus: () => {
    return api.get<WeChatWebhookStatus>('/wechat/webhook/status')
  },

  testWebhook: () => {
    return api.post('/wechat/webhook/test')
  },

  // Configuration management
  getWeChatConfig: () => {
    return api.get<WeChatConfig>('/wechat/config')
  },

  updateWeChatConfig: (data: Partial<WeChatConfig>) => {
    return api.put<WeChatConfig>('/wechat/config', data)
  },

  rotateApiKeys: () => {
    return api.post('/wechat/config/rotate-keys')
  },

  validateConfig: () => {
    return api.post('/wechat/config/validate')
  },

  // Access token management
  getAccessToken: () => {
    return api.get<{
      accessToken: string
      expiresIn: number
      expiresAt: string
    }>('/wechat/token')
  },

  refreshAccessToken: () => {
    return api.post<{
      accessToken: string
      expiresIn: number
      expiresAt: string
    }>('/wechat/token/refresh')
  },

  // Menu management
  getMenu: () => {
    return api.get('/wechat/menu')
  },

  updateMenu: (menuData: any) => {
    return api.put('/wechat/menu', menuData)
  },

  deleteMenu: () => {
    return api.delete('/wechat/menu')
  },

  // QR code management
  createQRCode: (data: {
    sceneStr: string
    expireSeconds?: number
    actionName: 'QR_SCENE' | 'QR_STR_SCENE' | 'QR_LIMIT_SCENE' | 'QR_LIMIT_STR_SCENE'
  }) => {
    return api.post('/wechat/qrcode', data)
  },

  // Export and reporting
  exportMessages: (params?: {
    format?: 'csv' | 'xlsx' | 'pdf'
    filters?: MessageFilters
    dateRange?: { start: string; end: string }
  }) => {
    return api.post('/wechat/messages/export', params, {
      responseType: 'blob'
    })
  },

  exportUsers: (params?: {
    format?: 'csv' | 'xlsx' | 'pdf'
    filters?: any
  }) => {
    return api.post('/wechat/users/export', params, {
      responseType: 'blob'
    })
  },
}
