import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { 
  Article, 
  ArticleCategory, 
  ArticleTag, 
  ArticleFilters, 
  CreateArticleRequest, 
  UpdateArticleRequest,
  BulkOperation,
  BulkOperationResult,
  ArticleListOptions,
  ArticleGetOptions
} from '@/types/article'
import { articleApi } from '@/services/articleApi'

interface ArticleState {
  // State
  articles: Article[]
  currentArticle: Article | null
  categories: ArticleCategory[]
  tags: ArticleTag[]
  isLoading: boolean
  error: string | null
  filters: ArticleFilters
  selectedArticles: string[]
  
  // Pagination
  total: number
  page: number
  limit: number
  hasMore: boolean

  // UI State
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  lastFetch: number | null
}

interface ArticleActions {
  // Article CRUD
  fetchArticles: (options?: ArticleListOptions) => Promise<void>
  fetchArticle: (id: string, options?: ArticleGetOptions) => Promise<void>
  createArticle: (data: CreateArticleRequest) => Promise<Article>
  updateArticle: (id: string, data: UpdateArticleRequest) => Promise<Article>
  deleteArticle: (id: string) => Promise<void>
  publishArticle: (id: string) => Promise<Article>
  unpublishArticle: (id: string) => Promise<Article>
  
  // Bulk operations
  bulkOperation: (operation: BulkOperation) => Promise<BulkOperationResult>
  
  // Categories
  fetchCategories: () => Promise<void>
  createCategory: (data: Omit<ArticleCategory, 'id' | 'createdAt' | 'updatedAt' | 'articleCount'>) => Promise<ArticleCategory>
  updateCategory: (id: string, data: Partial<ArticleCategory>) => Promise<ArticleCategory>
  deleteCategory: (id: string) => Promise<void>
  
  // Tags
  fetchTags: () => Promise<void>
  createTag: (data: Omit<ArticleTag, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => Promise<ArticleTag>
  updateTag: (id: string, data: Partial<ArticleTag>) => Promise<ArticleTag>
  deleteTag: (id: string) => Promise<void>
  
  // Filters and selection
  setFilters: (filters: Partial<ArticleFilters>) => void
  clearFilters: () => void
  setSelectedArticles: (ids: string[]) => void
  toggleArticleSelection: (id: string) => void
  selectAllArticles: () => void
  clearSelection: () => void
  
  // Pagination
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  loadMore: () => Promise<void>
  
  // Utilities
  clearError: () => void
  setCurrentArticle: (article: Article | null) => void
  refreshArticles: () => Promise<void>
  invalidateCache: () => void
}

type ArticleStore = ArticleState & ArticleActions

const defaultFilters: ArticleFilters = {
  search: '',
  categoryId: '',
  tagIds: [],
  status: 'all',
  author: '',
  sortBy: 'createdAt',
  sortOrder: 'desc'
}

export const useArticleStore = create<ArticleStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        articles: [],
        currentArticle: null,
        categories: [],
        tags: [],
        isLoading: false,
        error: null,
        filters: defaultFilters,
        selectedArticles: [],
        total: 0,
        page: 1,
        limit: 20,
        hasMore: false,
        isCreating: false,
        isUpdating: false,
        isDeleting: false,
        lastFetch: null,

        // Article CRUD actions
        fetchArticles: async (options?: ArticleListOptions) => {
          set({ isLoading: true, error: null })
          try {
            const { filters, page, limit } = get()
            const queryOptions = {
              page,
              limit,
              ...filters,
              ...options
            }
            
            const response = await articleApi.getArticles(queryOptions)
            
            set({
              articles: response.data,
              total: response.total,
              hasMore: response.hasNext,
              isLoading: false,
              lastFetch: Date.now()
            })
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to fetch articles', 
              isLoading: false 
            })
          }
        },

        fetchArticle: async (id: string, options?: ArticleGetOptions) => {
          set({ isLoading: true, error: null })
          try {
            const article = await articleApi.getArticle(id, options)
            set({ 
              currentArticle: article, 
              isLoading: false 
            })
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to fetch article', 
              isLoading: false 
            })
          }
        },

        createArticle: async (data: CreateArticleRequest) => {
          set({ isCreating: true, error: null })
          try {
            const article = await articleApi.createArticle(data)
            set(state => ({
              articles: [article, ...state.articles],
              total: state.total + 1,
              isCreating: false
            }))
            return article
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to create article', 
              isCreating: false 
            })
            throw error
          }
        },

        updateArticle: async (id: string, data: UpdateArticleRequest) => {
          set({ isUpdating: true, error: null })
          try {
            const article = await articleApi.updateArticle(id, data)
            set(state => ({
              articles: state.articles.map(a => a.id === id ? article : a),
              currentArticle: state.currentArticle?.id === id ? article : state.currentArticle,
              isUpdating: false
            }))
            return article
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to update article', 
              isUpdating: false 
            })
            throw error
          }
        },

        deleteArticle: async (id: string) => {
          set({ isDeleting: true, error: null })
          try {
            await articleApi.deleteArticle(id)
            set(state => ({
              articles: state.articles.filter(a => a.id !== id),
              selectedArticles: state.selectedArticles.filter(aid => aid !== id),
              total: state.total - 1,
              currentArticle: state.currentArticle?.id === id ? null : state.currentArticle,
              isDeleting: false
            }))
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to delete article', 
              isDeleting: false 
            })
            throw error
          }
        },

        publishArticle: async (id: string) => {
          set({ isUpdating: true, error: null })
          try {
            const article = await articleApi.publishArticle(id)
            set(state => ({
              articles: state.articles.map(a => a.id === id ? article : a),
              currentArticle: state.currentArticle?.id === id ? article : state.currentArticle,
              isUpdating: false
            }))
            return article
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to publish article', 
              isUpdating: false 
            })
            throw error
          }
        },

        unpublishArticle: async (id: string) => {
          set({ isUpdating: true, error: null })
          try {
            const article = await articleApi.unpublishArticle(id)
            set(state => ({
              articles: state.articles.map(a => a.id === id ? article : a),
              currentArticle: state.currentArticle?.id === id ? article : state.currentArticle,
              isUpdating: false
            }))
            return article
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to unpublish article', 
              isUpdating: false 
            })
            throw error
          }
        },

        bulkOperation: async (operation: BulkOperation) => {
          set({ isLoading: true, error: null })
          try {
            const result = await articleApi.bulkOperation(operation)
            
            // Refresh articles after bulk operation
            await get().fetchArticles()
            
            set({ isLoading: false })
            return result
          } catch (error: any) {
            set({ 
              error: error.message || 'Bulk operation failed', 
              isLoading: false 
            })
            throw error
          }
        },

        // Categories
        fetchCategories: async () => {
          try {
            const categories = await articleApi.getCategories()
            set({ categories })
          } catch (error: any) {
            set({ error: error.message || 'Failed to fetch categories' })
          }
        },

        createCategory: async (data) => {
          try {
            const category = await articleApi.createCategory(data)
            set(state => ({
              categories: [...state.categories, category]
            }))
            return category
          } catch (error: any) {
            set({ error: error.message || 'Failed to create category' })
            throw error
          }
        },

        updateCategory: async (id: string, data) => {
          try {
            const category = await articleApi.updateCategory(id, data)
            set(state => ({
              categories: state.categories.map(c => c.id === id ? category : c)
            }))
            return category
          } catch (error: any) {
            set({ error: error.message || 'Failed to update category' })
            throw error
          }
        },

        deleteCategory: async (id: string) => {
          try {
            await articleApi.deleteCategory(id)
            set(state => ({
              categories: state.categories.filter(c => c.id !== id)
            }))
          } catch (error: any) {
            set({ error: error.message || 'Failed to delete category' })
            throw error
          }
        },

        // Tags
        fetchTags: async () => {
          try {
            const tags = await articleApi.getTags()
            set({ tags })
          } catch (error: any) {
            set({ error: error.message || 'Failed to fetch tags' })
          }
        },

        createTag: async (data) => {
          try {
            const tag = await articleApi.createTag(data)
            set(state => ({
              tags: [...state.tags, tag]
            }))
            return tag
          } catch (error: any) {
            set({ error: error.message || 'Failed to create tag' })
            throw error
          }
        },

        updateTag: async (id: string, data) => {
          try {
            const tag = await articleApi.updateTag(id, data)
            set(state => ({
              tags: state.tags.map(t => t.id === id ? tag : t)
            }))
            return tag
          } catch (error: any) {
            set({ error: error.message || 'Failed to update tag' })
            throw error
          }
        },

        deleteTag: async (id: string) => {
          try {
            await articleApi.deleteTag(id)
            set(state => ({
              tags: state.tags.filter(t => t.id !== id)
            }))
          } catch (error: any) {
            set({ error: error.message || 'Failed to delete tag' })
            throw error
          }
        },

        // Filters and selection
        setFilters: (newFilters: Partial<ArticleFilters>) => {
          set(state => ({
            filters: { ...state.filters, ...newFilters },
            page: 1 // Reset to first page when filters change
          }))
        },

        clearFilters: () => {
          set({ 
            filters: defaultFilters,
            page: 1
          })
        },

        setSelectedArticles: (ids: string[]) => {
          set({ selectedArticles: ids })
        },

        toggleArticleSelection: (id: string) => {
          set(state => ({
            selectedArticles: state.selectedArticles.includes(id)
              ? state.selectedArticles.filter(aid => aid !== id)
              : [...state.selectedArticles, id]
          }))
        },

        selectAllArticles: () => {
          set(state => ({
            selectedArticles: state.articles.map(a => a.id)
          }))
        },

        clearSelection: () => {
          set({ selectedArticles: [] })
        },

        // Pagination
        setPage: (page: number) => {
          set({ page })
        },

        setLimit: (limit: number) => {
          set({ limit, page: 1 })
        },

        loadMore: async () => {
          const { page, hasMore, isLoading } = get()
          if (!hasMore || isLoading) return
          
          set({ page: page + 1 })
          await get().fetchArticles()
        },

        // Utilities
        clearError: () => {
          set({ error: null })
        },

        setCurrentArticle: (article: Article | null) => {
          set({ currentArticle: article })
        },

        refreshArticles: async () => {
          await get().fetchArticles()
        },

        invalidateCache: () => {
          set({ lastFetch: null })
        }
      }),
      {
        name: 'article-store',
        partialize: (state) => ({
          filters: state.filters,
          page: state.page,
          limit: state.limit,
          categories: state.categories,
          tags: state.tags
        }),
      }
    ),
    {
      name: 'article-store',
    }
  )
)
