import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import toast from 'react-hot-toast'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response time in development
    if (import.meta.env.DEV && response.config.metadata) {
      const endTime = new Date()
      const duration = endTime.getTime() - response.config.metadata.startTime.getTime()
      console.log(`API ${response.config.method?.toUpperCase()} ${response.config.url}: ${duration}ms`)
    }

    return response
  },
  (error) => {
    // Handle common error scenarios
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          toast.error('Session expired. Please login again.')
          // Clear auth storage
          localStorage.removeItem('auth-storage')
          window.location.href = '/auth/login'
          break

        case 403:
          // Forbidden
          toast.error('You do not have permission to perform this action.')
          break

        case 404:
          // Not found
          toast.error('The requested resource was not found.')
          break

        case 422:
          // Validation error
          if (data.errors) {
            // Handle validation errors
            Object.values(data.errors).forEach((error: any) => {
              toast.error(error[0] || 'Validation error')
            })
          } else {
            toast.error(data.message || 'Validation failed')
          }
          break

        case 429:
          // Rate limit
          toast.error('Too many requests. Please try again later.')
          break

        case 500:
          // Server error
          toast.error('Server error. Please try again later.')
          break

        default:
          // Generic error
          toast.error(data.message || 'An unexpected error occurred')
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.')
    } else {
      // Other error
      toast.error('An unexpected error occurred')
    }

    return Promise.reject(error)
  }
)

// API client wrapper with common methods
export class ApiClient {
  private client: AxiosInstance

  constructor(client: AxiosInstance) {
    this.client = client
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config)
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config)
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config)
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config)
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config)
  }

  setToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  clearToken() {
    delete this.client.defaults.headers.common['Authorization']
  }
}

export const api = new ApiClient(apiClient)
export default apiClient
