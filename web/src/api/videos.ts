import { apiClient } from './client';
import type { 
  VideoItem, 
  VideoCategory, 
  VideoSearchRequest, 
  VideoListResponse,
  VideoUploadRequest,
  VideoUploadResponse 
} from '@/types/article';

// Video API endpoints
export const videosApi = {
  // Get videos with filtering and pagination
  getVideos: async (params?: VideoSearchRequest): Promise<VideoListResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params?.search) searchParams.append('search', params.search);
    if (params?.categoryId) searchParams.append('categoryId', params.categoryId);
    if (params?.videoType) searchParams.append('videoType', params.videoType);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.author) searchParams.append('author', params.author);
    if (params?.isOpen !== undefined) searchParams.append('isOpen', params.isOpen.toString());
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
    if (params?.includeCategory) searchParams.append('includeCategory', 'true');
    if (params?.includeAnalytics) searchParams.append('includeAnalytics', 'true');

    const queryString = searchParams.toString();
    const url = `/videos${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<VideoListResponse>(url);
    return response.data;
  },

  // Get single video by ID
  getVideo: async (id: string): Promise<VideoItem> => {
    const response = await apiClient.get<VideoItem>(`/videos/${id}`);
    return response.data;
  },

  // Upload video
  uploadVideo: async (data: VideoUploadRequest): Promise<VideoUploadResponse> => {
    const formData = new FormData();
    formData.append('video', data.file);
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.categoryId) formData.append('categoryId', data.categoryId);
    if (data.videoType) formData.append('videoType', data.videoType);
    if (data.quality) formData.append('quality', data.quality);
    if (data.isOpen !== undefined) formData.append('isOpen', data.isOpen.toString());
    if (data.requireAuth !== undefined) formData.append('requireAuth', data.requireAuth.toString());
    if (data.tags) formData.append('tags', data.tags.join(','));

    const response = await apiClient.post<VideoUploadResponse>('/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get video upload status
  getVideoStatus: async (id: string): Promise<{ status: string; progress?: number; message?: string }> => {
    const response = await apiClient.get<{ status: string; progress?: number; message?: string }>(`/videos/${id}/status`);
    return response.data;
  },

  // Get video categories
  getVideoCategories: async (): Promise<VideoCategory[]> => {
    const response = await apiClient.get<VideoCategory[]>('/videos/categories');
    return response.data;
  },

  // Test upload credentials
  testCredentials: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.get<{ success: boolean; message: string }>('/videos/test-credentials');
    return response.data;
  },

  // Delete video
  deleteVideo: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/videos/${id}`);
    return response.data;
  },

  // Update video
  updateVideo: async (id: string, data: Partial<VideoItem>): Promise<VideoItem> => {
    const response = await apiClient.put<VideoItem>(`/videos/${id}`, data);
    return response.data;
  },

  // Get video analytics
  getVideoAnalytics: async (id: string): Promise<{
    viewCount: number;
    likeCount: number;
    shareCount: number;
    commentCount: number;
    watchTime: number;
    viewsOverTime: Array<{ timestamp: string; value: number }>;
    deviceBreakdown: Record<string, number>;
    locationBreakdown: Record<string, number>;
  }> => {
    const response = await apiClient.get(`/videos/${id}/analytics`);
    return response.data;
  },
};

// Export types for convenience
export type { 
  VideoItem, 
  VideoCategory, 
  VideoSearchRequest, 
  VideoListResponse,
  VideoUploadRequest,
  VideoUploadResponse 
};

export default videosApi;
