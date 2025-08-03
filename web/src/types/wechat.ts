export interface WeChatMessage {
  id: string
  fromUser: string
  toUser: string
  messageType: 'text' | 'image' | 'voice' | 'video' | 'music' | 'news' | 'event'
  content: string
  mediaId?: string
  picUrl?: string
  msgId: string
  createTime: string
  status: 'received' | 'processed' | 'replied' | 'failed'
  direction: 'inbound' | 'outbound'
  responseTime?: number
  errorMessage?: string
  metadata?: Record<string, any>
  
  // Relations
  wechatUser?: WeChatUser
  relatedEvent?: string
}

export interface WeChatUser {
  openId: string
  unionId?: string
  nickname: string
  sex: number
  city: string
  country: string
  province: string
  language: string
  headImgUrl: string
  subscribeTime: string
  unsubscribeTime?: string
  isSubscribed: boolean
  remark?: string
  groupId?: string
  tagIdList: number[]
  subscribeScene: string
  qrScene?: string
  qrSceneStr?: string
  
  // Computed fields
  messageCount: number
  lastMessageTime?: string
  isActive: boolean
  engagementScore: number
}

export interface WeChatConfig {
  appId: string
  appSecret: string
  token: string
  encodingAESKey: string
  webhookUrl: string
  isEnabled: boolean
  
  // Menu configuration
  menuConfig?: any
  
  // Auto-reply settings
  autoReplyEnabled: boolean
  welcomeMessage?: string
  defaultReply?: string
  
  // Security settings
  ipWhitelist: string[]
  rateLimitEnabled: boolean
  maxRequestsPerMinute: number
  
  // Logging settings
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  logRetentionDays: number
}

export interface WeChatStatistics {
  totalMessages: number
  totalUsers: number
  activeUsers: number
  newUsers: number
  messagesByType: { type: string; count: number; percentage: number }[]
  messagesByStatus: { status: string; count: number; percentage: number }[]
  messageTrend: { date: string; inbound: number; outbound: number }[]
  userGrowthTrend: { date: string; subscribed: number; unsubscribed: number; net: number }[]
  responseMetrics: {
    averageResponseTime: number
    responseRate: number
    successRate: number
  }
  topUsers: {
    openId: string
    nickname: string
    messageCount: number
    lastMessageTime: string
  }[]
  peakHours: { hour: number; messageCount: number }[]
  geographicDistribution: { region: string; userCount: number; percentage: number }[]
}

export interface WeChatWebhookStatus {
  isActive: boolean
  lastHeartbeat: string
  responseTime: number
  successRate: number
  errorRate: number
  totalRequests: number
  failedRequests: number
  lastError?: {
    message: string
    timestamp: string
    details?: any
  }
  uptime: number
  downtimeEvents: {
    startTime: string
    endTime?: string
    duration?: number
    reason?: string
  }[]
}

export interface MessageFilters {
  search?: string
  messageType?: 'text' | 'image' | 'voice' | 'video' | 'music' | 'news' | 'event' | 'all'
  status?: 'received' | 'processed' | 'replied' | 'failed' | 'all'
  direction?: 'inbound' | 'outbound' | 'all'
  dateRange?: {
    start: string
    end: string
  }
  fromUser?: string
  hasResponse?: boolean
  sortBy?: 'createTime' | 'responseTime' | 'messageType'
  sortOrder?: 'asc' | 'desc'
}

export interface WeChatIntegrationHealth {
  status: 'healthy' | 'warning' | 'error'
  apiStatus: 'connected' | 'disconnected' | 'error'
  webhookStatus: 'active' | 'inactive' | 'error'
  accessTokenStatus: 'valid' | 'expired' | 'invalid'
  lastHeartbeat: string
  responseTime: number
  errorRate: number
  uptime: number
  issues: {
    type: 'warning' | 'error'
    category: 'api' | 'webhook' | 'token' | 'config'
    message: string
    timestamp: string
    resolved?: boolean
  }[]
  recommendations: string[]
}

export interface WeChatMenu {
  button: WeChatMenuButton[]
}

export interface WeChatMenuButton {
  type?: 'click' | 'view' | 'scancode_push' | 'scancode_waitmsg' | 'pic_sysphoto' | 'pic_photo_or_album' | 'pic_weixin' | 'location_select' | 'media_id' | 'view_limited'
  name: string
  key?: string
  url?: string
  media_id?: string
  appid?: string
  pagepath?: string
  sub_button?: WeChatMenuButton[]
}

export interface QRCodeInfo {
  ticket: string
  expireSeconds: number
  url: string
  qrCodeUrl: string
  sceneStr: string
  actionName: string
  createdAt: string
  expiresAt?: string
  scanCount: number
  lastScannedAt?: string
}
