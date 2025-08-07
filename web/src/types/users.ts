export interface User {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  avatar?: string
  role: 'admin' | 'manager' | 'user'
  status: 'active' | 'inactive' | 'suspended'
  permissions: string[]
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
  loginCount: number
  isEmailVerified: boolean
  isTwoFactorEnabled: boolean
  
  // Computed fields
  fullName?: string
  isOnline?: boolean
  lastActivity?: string
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  firstName?: string
  lastName?: string
  role: 'admin' | 'manager' | 'user'
  permissions?: string[]
  sendWelcomeEmail?: boolean
}

export interface UpdateUserRequest {
  username?: string
  email?: string
  firstName?: string
  lastName?: string
  role?: 'admin' | 'manager' | 'user'
  status?: 'active' | 'inactive' | 'suspended'
  permissions?: string[]
  avatar?: string
}

export interface UserFilters {
  search?: string
  role?: 'admin' | 'manager' | 'user' | 'all'
  status?: 'active' | 'inactive' | 'suspended' | 'all'
  dateRange?: {
    start: string
    end: string
  }
  isEmailVerified?: boolean
  isTwoFactorEnabled?: boolean
  sortBy?: 'username' | 'email' | 'createdAt' | 'lastLoginAt' | 'loginCount'
  sortOrder?: 'asc' | 'desc'
}

export interface UserActivity {
  id: string
  userId: string
  action: string
  description: string
  ipAddress: string
  userAgent: string
  metadata?: Record<string, any>
  createdAt: string
}

export interface UserSession {
  id: string
  userId: string
  token: string
  ipAddress: string
  userAgent: string
  isActive: boolean
  expiresAt: string
  createdAt: string
  lastActivityAt: string
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
  userCount: number
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

export interface Permission {
  id: string
  name: string
  description: string
  category: string
  resource: string
  action: string
}

export interface UserStatistics {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  suspendedUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  newUsersThisMonth: number
  usersByRole: { role: string; count: number; percentage: number }[]
  usersByStatus: { status: string; count: number; percentage: number }[]
  activityTrend: { date: string; count: number }[]
  loginTrend: { date: string; count: number }[]
  topActiveUsers: {
    id: string
    username: string
    fullName: string
    loginCount: number
    lastLoginAt: string
  }[]
}

export interface UserFormData {
  username: string
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  role: 'admin' | 'manager' | 'user'
  permissions: string[]
  sendWelcomeEmail: boolean
}

// WeChat User Types
export interface WeChatUser {
  id: string
  openId: string
  unionId?: string
  nickname: string
  realName?: string
  companyName?: string
  position?: string
  email?: string
  mobile?: string
  sex: number // 0: unknown, 1: male, 2: female
  city?: string
  country?: string
  province?: string
  language?: string
  headImgUrl?: string
  subscribe: boolean
  subscribeTime?: string
  groupId?: number
  remark?: string
  isConfirmed?: boolean
  allowTest?: boolean
  isHidden?: boolean
  currentEventId?: string
  telephone?: string
  workAddress?: string
  qrCodeValue?: string
  bizCardSavePath?: string
  createdAt: string
  updatedAt: string
}

export interface CreateWeChatUserRequest {
  openId: string
  unionId?: string
  nickname: string
  realName?: string
  companyName?: string
  position?: string
  email?: string
  mobile?: string
  sex?: number
  city?: string
  country?: string
  province?: string
  language?: string
  headImgUrl?: string
  subscribe?: boolean
  groupId?: number
  remark?: string
  telephone?: string
  workAddress?: string
  qrCodeValue?: string
}

export interface UpdateWeChatUserRequest {
  nickname?: string
  realName?: string
  companyName?: string
  position?: string
  email?: string
  mobile?: string
  sex?: number
  city?: string
  country?: string
  province?: string
  language?: string
  headImgUrl?: string
  subscribe?: boolean
  groupId?: number
  remark?: string
  telephone?: string
  workAddress?: string
  qrCodeValue?: string
}

export interface WeChatUserFilters {
  search?: string
  subscribe?: boolean
  sex?: number
  city?: string
  province?: string
  country?: string
  createdAtStart?: string
  createdAtEnd?: string
  sortBy?: 'nickname' | 'realName' | 'companyName' | 'createdAt' | 'subscribeTime'
  sortOrder?: 'asc' | 'desc'
}

export interface WeChatUserStatistics {
  totalUsers: number
  subscribedUsers: number
  unsubscribedUsers: number
  newUsersThisWeek: number
  newUsersThisMonth: number
  activeUsersToday: number
  activeUsersWeek: number
  maleUsers: number
  femaleUsers: number
  unknownSex: number
  topCities: { city: string; count: number }[]
  topProvinces: { province: string; count: number }[]
  topCountries: { country: string; count: number }[]
}
