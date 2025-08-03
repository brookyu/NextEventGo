import { api } from './client'
import type { LoginCredentials, LoginResponse, User } from '@/types/auth'

export const authApi = {
  // Login
  login: (credentials: LoginCredentials) => {
    return api.post<LoginResponse>('/auth/login', credentials)
  },

  // Logout
  logout: () => {
    return api.post('/auth/logout')
  },

  // Refresh token
  refreshToken: () => {
    return api.post<LoginResponse>('/auth/refresh')
  },

  // Get current user
  getCurrentUser: () => {
    return api.get<User>('/auth/me')
  },

  // Update profile
  updateProfile: (data: Partial<User>) => {
    return api.put<User>('/auth/profile', data)
  },

  // Change password
  changePassword: (data: { currentPassword: string; newPassword: string }) => {
    return api.post('/auth/change-password', data)
  },

  // Forgot password
  forgotPassword: (email: string) => {
    return api.post('/auth/forgot-password', { email })
  },

  // Reset password
  resetPassword: (data: { token: string; password: string }) => {
    return api.post('/auth/reset-password', data)
  },

  // Set token in API client
  setToken: (token: string) => {
    api.setToken(token)
  },

  // Clear token from API client
  clearToken: () => {
    api.clearToken()
  },
}
