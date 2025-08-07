import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/api/client'

interface User {
  id: string
  username: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
  initialize: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null })

        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'
          const response = await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Login failed')
          }

          const data = await response.json()

          // Set token in API client
          api.setToken(data.token)

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Login failed',
          })
          throw error
        }
      },

      logout: () => {
        // Clear token from API client
        api.clearToken()

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        })
      },

      clearError: () => {
        set({ error: null })
      },

      initialize: () => {
        // Set token in API client if it exists in storage
        const authStorage = localStorage.getItem('auth-storage')
        if (authStorage) {
          try {
            const authData = JSON.parse(authStorage)
            const token = authData.state?.token
            if (token) {
              api.setToken(token)
            }
          } catch (e) {
            console.warn('Failed to parse auth storage during initialization:', e)
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
