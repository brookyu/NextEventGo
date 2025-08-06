import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { newsApi, newsAnalyticsApi } from '../api/news'
import { useNewsStore } from '../store/newsStore'
import {
  NewsFilter,
  NewsCreateRequest,
  NewsUpdateRequest,
  NewsPublishRequest,
  NewsViewTrackingData,
  NewsReadTrackingData,
  NewsShareTrackingData,
  NewsEngagementTrackingData,
} from '../types/news'

// Query keys
export const newsQueryKeys = {
  all: ['news'] as const,
  lists: () => [...newsQueryKeys.all, 'list'] as const,
  list: (filter: NewsFilter) => [...newsQueryKeys.lists(), filter] as const,
  details: () => [...newsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...newsQueryKeys.details(), id] as const,
  editing: (id: string) => [...newsQueryKeys.details(), id, 'editing'] as const,
  analytics: () => [...newsQueryKeys.all, 'analytics'] as const,
  analyticsDetail: (id: string, days: number) => [...newsQueryKeys.analytics(), id, days] as const,
  analyticsSummary: (days: number) => [...newsQueryKeys.analytics(), 'summary', days] as const,
}

// News list hook
export function useNewsList(filter?: NewsFilter) {
  const { setNewsList, setLoading, setError, filters } = useNewsStore()
  const finalFilter = { ...filters, ...filter }

  return useQuery({
    queryKey: newsQueryKeys.list(finalFilter),
    queryFn: async () => {
      setLoading(true)
      try {
        const response = await newsApi.getNews(finalFilter)
        // Handle the nested response structure from our API
        const result = response.data || response
        setNewsList(result.items, result.totalCount, result.pageNumber, result.totalPages)
        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch news'
        setError(errorMessage)
        throw error
      } finally {
        setLoading(false)
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Single news detail hook
export function useNewsDetail(id: string) {
  const { setCurrentNews, setCurrentNewsLoading, setCurrentNewsError } = useNewsStore()

  return useQuery({
    queryKey: newsQueryKeys.detail(id),
    queryFn: async () => {
      setCurrentNewsLoading(true)
      try {
        const result = await newsApi.getNewsById(id)
        setCurrentNews(result)
        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch news'
        setCurrentNewsError(errorMessage)
        throw error
      } finally {
        setCurrentNewsLoading(false)
      }
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// News for editing hook
export function useNewsForEditing(id: string, options?: { enabled?: boolean }) {
  const { setCurrentNews, setCurrentNewsLoading, setCurrentNewsError } = useNewsStore()

  return useQuery({
    queryKey: newsQueryKeys.editing(id),
    queryFn: async () => {
      setCurrentNewsLoading(true)
      try {
        const result = await newsApi.getNewsForEditing(id)
        setCurrentNews(result)
        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch news for editing'
        setCurrentNewsError(errorMessage)
        throw error
      } finally {
        setCurrentNewsLoading(false)
      }
    },
    enabled: options?.enabled !== false && !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// News analytics hook
export function useNewsAnalytics(newsId: string, days: number = 30) {
  const { setAnalytics, setAnalyticsLoading, setAnalyticsError } = useNewsStore()

  return useQuery({
    queryKey: newsQueryKeys.analyticsDetail(newsId, days),
    queryFn: async () => {
      setAnalyticsLoading(true)
      try {
        const result = await newsAnalyticsApi.getNewsAnalytics(newsId, days)
        setAnalytics(newsId, result)
        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch analytics'
        setAnalyticsError(errorMessage)
        throw error
      } finally {
        setAnalyticsLoading(false)
      }
    },
    enabled: !!newsId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Analytics summary hook
export function useAnalyticsSummary(days: number = 30) {
  return useQuery({
    queryKey: newsQueryKeys.analyticsSummary(days),
    queryFn: () => newsAnalyticsApi.getAnalyticsSummary(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Create news mutation
export function useCreateNews() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: NewsCreateRequest) => {
      // Convert NewsCreateRequest to createNewsWithSelectors format
      const selectorsData = {
        title: data.title,
        subtitle: data.subtitle,
        summary: data.summary,
        description: data.description,
        type: data.type || 'regular',
        priority: data.priority || 'normal',
        featuredImageId: data.featuredImageId,
        thumbnailImageId: data.thumbnailImageId,
        selectedArticleIds: data.selectedArticleIds || [],
        categoryIds: data.categoryIds,
        allowComments: data.allowComments,
        allowSharing: data.allowSharing,
        isFeatured: data.isFeatured,
        isBreaking: data.isBreaking,
        requireAuth: data.requireAuth,
        scheduledAt: data.scheduledAt,
        expiresAt: data.expiresAt,
      }

      // Call the working endpoint
      const result = await newsApi.createNewsWithSelectors(selectorsData)

      // Convert the response to match NewsPublication format
      return {
        id: result.id,
        title: result.title,
        subtitle: data.subtitle || '',
        summary: data.summary || '',
        description: data.description || '',
        content: '',
        status: result.status as any,
        type: data.type || 'regular',
        priority: data.priority || 'normal',
        slug: '',
        featuredImageId: data.featuredImageId,
        thumbnailImageId: data.thumbnailImageId,
        authorId: '',
        editorId: null,
        categoryIds: data.categoryIds || [],
        tags: [],
        allowComments: data.allowComments || false,
        allowSharing: data.allowSharing || false,
        isFeatured: data.isFeatured || false,
        isBreaking: data.isBreaking || false,
        requireAuth: data.requireAuth || false,
        viewCount: 0,
        shareCount: 0,
        commentCount: 0,
        publishedAt: null,
        scheduledAt: data.scheduledAt || null,
        expiresAt: data.expiresAt || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        selectedArticleIds: data.selectedArticleIds || [],
        weChatDraftId: result.weChatDraftId,
        weChatDraftStatus: result.weChatDraftStatus,
      }
    },
    onSuccess: (newNews) => {
      // Invalidate and refetch news lists
      queryClient.invalidateQueries({ queryKey: newsQueryKeys.lists() })
      toast.success('News created successfully!')
      return newNews
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create news'
      toast.error(errorMessage)
    },
  })
}

// Update news mutation
export function useUpdateNews() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NewsUpdateRequest> }) =>
      newsApi.updateNews(id, data),
    onSuccess: (updatedNews, { id }) => {
      // Update specific news in cache
      queryClient.setQueryData(newsQueryKeys.detail(id), updatedNews)
      queryClient.setQueryData(newsQueryKeys.editing(id), updatedNews)
      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: newsQueryKeys.lists() })
      toast.success('News updated successfully!')
      return updatedNews
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update news'
      toast.error(errorMessage)
    },
  })
}

// Delete news mutation
export function useDeleteNews() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => newsApi.deleteNews(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: newsQueryKeys.detail(id) })
      queryClient.removeQueries({ queryKey: newsQueryKeys.editing(id) })
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: newsQueryKeys.lists() })
      toast.success('News deleted successfully!')
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete news'
      toast.error(errorMessage)
    },
  })
}

// Publish news mutation
export function usePublishNews() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: NewsPublishRequest }) =>
      newsApi.publishNews(id, data),
    onSuccess: (publishedNews, { id }) => {
      // Update caches
      queryClient.setQueryData(newsQueryKeys.detail(id), publishedNews)
      queryClient.setQueryData(newsQueryKeys.editing(id), publishedNews)
      queryClient.invalidateQueries({ queryKey: newsQueryKeys.lists() })
      toast.success('News published successfully!')
      return publishedNews
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to publish news'
      toast.error(errorMessage)
    },
  })
}

// Unpublish news mutation
export function useUnpublishNews() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => newsApi.unpublishNews(id),
    onSuccess: (unpublishedNews, id) => {
      queryClient.setQueryData(newsQueryKeys.detail(id), unpublishedNews)
      queryClient.setQueryData(newsQueryKeys.editing(id), unpublishedNews)
      queryClient.invalidateQueries({ queryKey: newsQueryKeys.lists() })
      toast.success('News unpublished successfully!')
      return unpublishedNews
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unpublish news'
      toast.error(errorMessage)
    },
  })
}

// Bulk operations mutations
export function useBulkPublishNews() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => newsApi.bulkPublish(ids),
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: newsQueryKeys.lists() })
      toast.success(`${ids.length} news items published successfully!`)
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to publish news items'
      toast.error(errorMessage)
    },
  })
}

export function useBulkDeleteNews() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => newsApi.bulkDelete(ids),
    onSuccess: (_, ids) => {
      // Remove from cache
      ids.forEach((id) => {
        queryClient.removeQueries({ queryKey: newsQueryKeys.detail(id) })
        queryClient.removeQueries({ queryKey: newsQueryKeys.editing(id) })
      })
      queryClient.invalidateQueries({ queryKey: newsQueryKeys.lists() })
      toast.success(`${ids.length} news items deleted successfully!`)
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete news items'
      toast.error(errorMessage)
    },
  })
}

// Tracking mutations (fire and forget)
export function useTrackNewsView() {
  return useMutation({
    mutationFn: (data: NewsViewTrackingData) => newsAnalyticsApi.trackView(data),
    onError: () => {
      // Silent fail for tracking
      console.warn('Failed to track news view')
    },
  })
}

export function useTrackNewsRead() {
  return useMutation({
    mutationFn: (data: NewsReadTrackingData) => newsAnalyticsApi.trackRead(data),
    onError: () => {
      console.warn('Failed to track news read')
    },
  })
}

export function useTrackNewsShare() {
  return useMutation({
    mutationFn: (data: NewsShareTrackingData) => newsAnalyticsApi.trackShare(data),
    onError: () => {
      console.warn('Failed to track news share')
    },
  })
}

export function useTrackNewsEngagement() {
  return useMutation({
    mutationFn: (data: NewsEngagementTrackingData) => newsAnalyticsApi.trackEngagement(data),
    onError: () => {
      console.warn('Failed to track news engagement')
    },
  })
}
