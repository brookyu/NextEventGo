// Image management types

export interface ImageCategory {
  id: string
  name: string
  description: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface Image {
  id: string
  name: string
  siteUrl: string
  url: string
  mediaId: string
  categoryId: string
  createdAt: string
  updatedAt: string
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

export interface ImageUploadProgress {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  result?: Image
}

export interface ImageFilters {
  categoryId?: string
  name?: string
}

export interface PaginationParams {
  offset: number
  limit: number
}

export interface PaginationInfo extends PaginationParams {
  totalCount: number
  hasMore: boolean
}
