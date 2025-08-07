import { api } from './client'
import type { WeChatUser, CreateWeChatUserRequest, UpdateWeChatUserRequest, WeChatUserFilters, WeChatUserStatistics } from '@/types/users'

export const usersApi = {
  // Get all WeChat users with pagination and filters
  getUsers: (params?: {
    offset?: number
    limit?: number
    search?: string
    subscribe?: boolean
    sex?: number
    city?: string
    province?: string
    country?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    createdAtStart?: string
    createdAtEnd?: string
  }) => {
    return api.get<{
      users: WeChatUser[]
      pagination: {
        offset: number
        limit: number
        count: number
        total: number
      }
    }>('/users/', { params })
  },

  // Get WeChat user by OpenID
  getUser: (openId: string) => {
    return api.get<WeChatUser>(`/users/${openId}`)
  },

  // Create new WeChat user
  createUser: (data: CreateWeChatUserRequest) => {
    return api.post<WeChatUser>('/users/', data)
  },

  // Update WeChat user
  updateUser: (openId: string, data: UpdateWeChatUserRequest) => {
    return api.put<WeChatUser>(`/users/${openId}`, data)
  },

  // Delete WeChat user
  deleteUser: (openId: string) => {
    return api.delete(`/users/${openId}`)
  },

  // Update WeChat user subscription status
  updateUserSubscription: (openId: string, subscribe: boolean) => {
    return api.patch(`/users/${openId}`, { subscribe })
  },

  // Get WeChat user statistics
  getUserStatistics: () => {
    return api.get<WeChatUserStatistics>('/users/statistics')
  },

  // Bulk operations for WeChat users
  bulkUpdateSubscription: (openIds: string[], subscribe: boolean) => {
    return api.post('/users/bulk-update-subscription', { openIds, subscribe })
  },

  bulkDeleteUsers: (openIds: string[]) => {
    return api.post('/users/bulk-delete', { openIds })
  },

  // Export WeChat users
  exportUsers: (params?: {
    format?: 'csv' | 'xlsx' | 'pdf'
    openIds?: string[]
    filters?: WeChatUserFilters
  }) => {
    return api.post('/users/export', params, {
      responseType: 'blob'
    })
  },

  // Search operations
  searchByNickname: (nickname: string, params?: { offset?: number; limit?: number }) => {
    return api.get<{
      users: WeChatUser[]
      pagination: {
        offset: number
        limit: number
        count: number
        total: number
      }
    }>('/users/search/nickname', { params: { ...params, nickname } })
  },

  searchByRealName: (realName: string, params?: { offset?: number; limit?: number }) => {
    return api.get<{
      users: WeChatUser[]
      pagination: {
        offset: number
        limit: number
        count: number
        total: number
      }
    }>('/users/search/realname', { params: { ...params, realName } })
  },

  searchByCompany: (company: string, params?: { offset?: number; limit?: number }) => {
    return api.get<{
      users: WeChatUser[]
      pagination: {
        offset: number
        limit: number
        count: number
        total: number
      }
    }>('/users/search/company', { params: { ...params, company } })
  },
}
