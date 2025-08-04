// Image management API client

export interface ImageCategory {
  id: string
  title: string
  type: number
}

export interface Image {
  id: string
  title: string
  alt_text: string
  description: string
  url: string
  thumbnail: string
  author?: string
  format?: string
  size?: number
  width?: number
  height?: number
  created_at: string
  updated_at?: string
  category?: ImageCategory
}

// Alias for compatibility
export type SiteImage = Image

export interface ImagesResponse {
  data: Image[]
  pagination: {
    offset: number
    limit: number
    totalCount: number
  }
}

export interface CategoriesResponse {
  data: ImageCategory[]
  pagination?: {
    totalCount: number
  }
}

export interface CreateCategoryRequest {
  name: string
  description?: string
  sortOrder?: number
}

export interface UpdateCategoryRequest {
  name?: string
  description?: string
  sortOrder?: number
}

export interface UpdateImageRequest {
  name?: string
  categoryId?: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v2'

// Get auth token from localStorage
const getAuthToken = () => {
  const authStorage = localStorage.getItem('auth-storage')
  if (authStorage) {
    const parsed = JSON.parse(authStorage)
    return parsed.state?.token
  }
  return null
}

// Create headers with auth token
const createHeaders = () => {
  const token = getAuthToken()
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  }
}

// Create headers for file upload
const createUploadHeaders = () => {
  const token = getAuthToken()
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    // Don't set Content-Type for FormData, let browser set it with boundary
  }
}

// Image Category API
export const imageCategories = {
  // Get all categories
  getAll: async (ordered = false): Promise<CategoriesResponse> => {
    const url = `${API_BASE_URL}/categories${ordered ? '?ordered=true' : ''}`
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`)
    }

    return response.json()
  },

  // Get category by ID
  getById: async (id: string): Promise<{ data: ImageCategory }> => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'GET',
      headers: createHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch category: ${response.statusText}`)
    }

    return response.json()
  },

  // Create new category
  create: async (category: CreateCategoryRequest): Promise<{ data: ImageCategory }> => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(category),
    })

    if (!response.ok) {
      throw new Error(`Failed to create category: ${response.statusText}`)
    }

    return response.json()
  },

  // Update category
  update: async (id: string, category: UpdateCategoryRequest): Promise<{ data: ImageCategory }> => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(category),
    })

    if (!response.ok) {
      throw new Error(`Failed to update category: ${response.statusText}`)
    }

    return response.json()
  },

  // Delete category
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: createHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to delete category: ${response.statusText}`)
    }

    return response.json()
  },
}

// Images API
export const images = {
  // Get all images with optional filtering
  getAll: async (params?: {
    offset?: number
    limit?: number
    categoryId?: string
    name?: string
  }): Promise<ImagesResponse> => {
    const searchParams = new URLSearchParams()
    
    if (params?.offset !== undefined) searchParams.set('offset', params.offset.toString())
    if (params?.limit !== undefined) searchParams.set('limit', params.limit.toString())
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId)
    if (params?.name) searchParams.set('name', params.name)

    const url = `${API_BASE_URL}/images${searchParams.toString() ? '?' + searchParams.toString() : ''}`
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch images: ${response.statusText}`)
    }

    return response.json()
  },



  // Upload image
  upload: async (file: File, categoryId: string): Promise<{ data: Image }> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('categoryId', categoryId)

    const response = await fetch(`${API_BASE_URL}/images/upload`, {
      method: 'POST',
      headers: createUploadHeaders(),
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Failed to upload image: ${response.statusText}`)
    }

    return response.json()
  },

  // Update image
  update: async (id: string, image: UpdateImageRequest): Promise<{ data: Image }> => {
    const response = await fetch(`${API_BASE_URL}/images/${id}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(image),
    })

    if (!response.ok) {
      throw new Error(`Failed to update image: ${response.statusText}`)
    }

    return response.json()
  },

  // Delete image
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/images/${id}`, {
      method: 'DELETE',
      headers: createHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to delete image: ${response.statusText}`)
    }

    return response.json()
  },
}

// Export as imagesApi for compatibility
export const imagesApi = images
