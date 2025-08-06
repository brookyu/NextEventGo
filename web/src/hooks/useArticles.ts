import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { articlesApi, Article, ArticleListParams, CreateArticleRequest, UpdateArticleRequest } from '../api/articles'

// Query keys
export const articleQueryKeys = {
  all: ['articles'] as const,
  lists: () => [...articleQueryKeys.all, 'list'] as const,
  list: (filter: ArticleListParams) => [...articleQueryKeys.lists(), filter] as const,
  details: () => [...articleQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...articleQueryKeys.details(), id] as const,
}

// Articles list hook
export function useArticles(filter: ArticleListParams = {}) {
  return useQuery({
    queryKey: articleQueryKeys.list(filter),
    queryFn: async () => {
      const response = await articlesApi.getArticles(filter)
      return {
        items: response.data,
        totalCount: response.pagination.total,
        pageNumber: response.pagination.page,
        totalPages: response.pagination.totalPages,
        hasNextPage: response.pagination.hasNext,
        hasPrevPage: response.pagination.hasPrev,
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Single article hook
export function useArticle(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: articleQueryKeys.detail(id),
    queryFn: () => articlesApi.getArticle(id),
    enabled: options?.enabled !== false && !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// Create article mutation
export function useCreateArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateArticleRequest) => articlesApi.createArticle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleQueryKeys.lists() })
    },
  })
}

// Update article mutation
export function useUpdateArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateArticleRequest }) =>
      articlesApi.updateArticle(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: articleQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: articleQueryKeys.detail(id) })
    },
  })
}

// Delete article mutation
export function useDeleteArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => articlesApi.deleteArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleQueryKeys.lists() })
    },
  })
}
