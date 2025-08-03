import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const API_TIMEOUT = 30000; // 30 seconds

// Token management
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, queue the request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => {
              return this.client(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const response = await this.refreshAuthToken(refreshToken);
              const { token, refreshToken: newRefreshToken } = response.data;
              
              this.setToken(token);
              this.setRefreshToken(newRefreshToken);
              
              // Process failed queue
              this.processQueue(null);
              
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            this.processQueue(refreshError);
            this.clearTokens();
            // Redirect to login or emit auth error event
            this.handleAuthError();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: any) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
    
    this.failedQueue = [];
  }

  private async refreshAuthToken(refreshToken: string) {
    return this.client.post('/auth/refresh', { refreshToken });
  }

  private handleAuthError() {
    // Emit custom event for auth error
    window.dispatchEvent(new CustomEvent('auth:error', {
      detail: { message: 'Authentication failed' }
    }));
  }

  // Token management methods
  public setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  public getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  public setRefreshToken(refreshToken: string) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  public clearTokens() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // HTTP methods
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  // File upload method
  public async uploadFile<T = any>(
    url: string, 
    file: File, 
    onUploadProgress?: (progressEvent: any) => void,
    additionalData?: Record<string, any>
  ): Promise<AxiosResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  }

  // Download file method
  public async downloadFile(url: string, filename?: string): Promise<void> {
    const response = await this.client.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  // Request cancellation
  public createCancelToken() {
    return axios.CancelToken.source();
  }

  public isCancel(error: any): boolean {
    return axios.isCancel(error);
  }

  // Error handling utilities
  public handleApiError(error: AxiosError): string {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return (data as any)?.message || 'Bad request';
        case 401:
          return 'Unauthorized access';
        case 403:
          return 'Access forbidden';
        case 404:
          return 'Resource not found';
        case 422:
          return (data as any)?.message || 'Validation error';
        case 429:
          return 'Too many requests. Please try again later.';
        case 500:
          return 'Internal server error';
        case 503:
          return 'Service unavailable';
        default:
          return (data as any)?.message || `Server error (${status})`;
      }
    } else if (error.request) {
      // Request was made but no response received
      return 'Network error. Please check your connection.';
    } else {
      // Something else happened
      return error.message || 'An unexpected error occurred';
    }
  }

  // Health check
  public async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/health');
      return true;
    } catch (error) {
      return false;
    }
  }

  // Set custom headers
  public setDefaultHeader(key: string, value: string) {
    this.client.defaults.headers.common[key] = value;
  }

  public removeDefaultHeader(key: string) {
    delete this.client.defaults.headers.common[key];
  }

  // Update base URL
  public setBaseURL(baseURL: string) {
    this.client.defaults.baseURL = baseURL;
  }

  // Update timeout
  public setTimeout(timeout: number) {
    this.client.defaults.timeout = timeout;
  }

  // Get current configuration
  public getConfig() {
    return {
      baseURL: this.client.defaults.baseURL,
      timeout: this.client.defaults.timeout,
      headers: this.client.defaults.headers,
    };
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();

// Export types for use in other files
export type { AxiosResponse, AxiosError, AxiosRequestConfig };

// Export utility functions
export const createApiError = (message: string, status?: number) => {
  const error = new Error(message) as any;
  error.status = status;
  return error;
};

export const isNetworkError = (error: any): boolean => {
  return error.code === 'NETWORK_ERROR' || error.message === 'Network Error';
};

export const isTimeoutError = (error: any): boolean => {
  return error.code === 'ECONNABORTED' || error.message.includes('timeout');
};

// Request/Response logging for development
if (process.env.NODE_ENV === 'development') {
  apiClient.get('/').catch(() => {}); // Initialize interceptors
  
  // Add request logging
  (apiClient as any).client.interceptors.request.use((config: any) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      params: config.params,
    });
    return config;
  });

  // Add response logging
  (apiClient as any).client.interceptors.response.use(
    (response: any) => {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`, {
        data: response.data,
      });
      return response;
    },
    (error: any) => {
      console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, {
        error: error.response?.data,
        message: error.message,
      });
      return Promise.reject(error);
    }
  );
}
