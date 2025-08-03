import { api } from './client'
import type { User, CreateUserRequest, UpdateUserRequest, UserFilters, UserActivity } from '@/types/users'

export const usersApi = {
  // Get all users with pagination and filters
  getUsers: (params?: {
    offset?: number
    limit?: number
    search?: string
    role?: string
    status?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => {
    return api.get<{
      users: User[]
      pagination: {
        offset: number
        limit: number
        count: number
        total: number
      }
    }>('/users', { params })
  },

  // Get user by ID
  getUser: (id: string) => {
    return api.get<User>(`/users/${id}`)
  },

  // Create new user
  createUser: (data: CreateUserRequest) => {
    return api.post<User>('/users', data)
  },

  // Update user
  updateUser: (id: string, data: UpdateUserRequest) => {
    return api.put<User>(`/users/${id}`, data)
  },

  // Delete user
  deleteUser: (id: string) => {
    return api.delete(`/users/${id}`)
  },

  // Update user status
  updateUserStatus: (id: string, status: 'active' | 'inactive' | 'suspended') => {
    return api.patch(`/users/${id}/status`, { status })
  },

  // Reset user password
  resetUserPassword: (id: string) => {
    return api.post(`/users/${id}/reset-password`)
  },

  // Get user activity
  getUserActivity: (id: string, params?: {
    offset?: number
    limit?: number
    dateRange?: { start: string; end: string }
  }) => {
    return api.get<{
      activities: UserActivity[]
      pagination: {
        offset: number
        limit: number
        count: number
        total: number
      }
    }>(`/users/${id}/activity`, { params })
  },

  // Get user statistics
  getUserStatistics: () => {
    return api.get<{
      totalUsers: number
      activeUsers: number
      newUsersToday: number
      newUsersThisWeek: number
      usersByRole: { role: string; count: number }[]
      usersByStatus: { status: string; count: number }[]
      activityTrend: { date: string; count: number }[]
    }>('/users/statistics')
  },

  // Bulk operations
  bulkUpdateUsers: (userIds: string[], updates: Partial<UpdateUserRequest>) => {
    return api.post('/users/bulk-update', { userIds, updates })
  },

  bulkDeleteUsers: (userIds: string[]) => {
    return api.post('/users/bulk-delete', { userIds })
  },

  // Export users
  exportUsers: (params?: {
    format?: 'csv' | 'xlsx' | 'pdf'
    userIds?: string[]
    filters?: UserFilters
  }) => {
    return api.post('/users/export', params, {
      responseType: 'blob'
    })
  },

  // Role management
  getRoles: () => {
    return api.get<{
      id: string
      name: string
      description: string
      permissions: string[]
    }[]>('/roles')
  },

  updateUserRoles: (userId: string, roleIds: string[]) => {
    return api.put(`/users/${userId}/roles`, { roleIds })
  },

  // Permission management
  getPermissions: () => {
    return api.get<{
      id: string
      name: string
      description: string
      category: string
    }[]>('/permissions')
  },

  getUserPermissions: (userId: string) => {
    return api.get<string[]>(`/users/${userId}/permissions`)
  },
}
