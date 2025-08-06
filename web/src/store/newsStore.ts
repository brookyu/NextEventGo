import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import {
  NewsPublication,
  NewsListItem,
  NewsFilter,
  NewsAnalytics,
} from '../types/news'

interface NewsState {
  // News list state
  newsList: NewsListItem[]
  totalCount: number
  currentPage: number
  pageSize: number
  totalPages: number
  loading: boolean
  error: string | null

  // Current news state
  currentNews: NewsPublication | null
  currentNewsLoading: boolean
  currentNewsError: string | null

  // Analytics state
  analytics: Record<string, NewsAnalytics>
  analyticsLoading: boolean
  analyticsError: string | null

  // Filter state
  filters: NewsFilter
  
  // Selection state (for bulk operations)
  selectedNewsIds: string[]
  
  // UI state
  viewMode: 'list' | 'grid' | 'table'
  showFilters: boolean
  showAnalytics: boolean

  // Actions
  setNewsList: (news: NewsListItem[], totalCount: number, currentPage: number, totalPages: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  setCurrentNews: (news: NewsPublication | null) => void
  setCurrentNewsLoading: (loading: boolean) => void
  setCurrentNewsError: (error: string | null) => void
  
  setAnalytics: (newsId: string, analytics: NewsAnalytics) => void
  setAnalyticsLoading: (loading: boolean) => void
  setAnalyticsError: (error: string | null) => void
  
  setFilters: (filters: Partial<NewsFilter>) => void
  clearFilters: () => void
  
  setSelectedNewsIds: (ids: string[]) => void
  toggleNewsSelection: (id: string) => void
  selectAllNews: () => void
  clearSelection: () => void
  
  setViewMode: (mode: 'list' | 'grid' | 'table') => void
  setShowFilters: (show: boolean) => void
  setShowAnalytics: (show: boolean) => void
  
  // Computed getters
  getSelectedNews: () => NewsListItem[]
  isNewsSelected: (id: string) => boolean
  hasSelection: () => boolean
  
  // Reset functions
  reset: () => void
  resetCurrentNews: () => void
  resetAnalytics: () => void
}

const initialFilters: NewsFilter = {
  page: 1,
  pageSize: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc',
}

export const useNewsStore = create<NewsState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        newsList: [],
        totalCount: 0,
        currentPage: 1,
        pageSize: 20,
        totalPages: 0,
        loading: false,
        error: null,

        currentNews: null,
        currentNewsLoading: false,
        currentNewsError: null,

        analytics: {},
        analyticsLoading: false,
        analyticsError: null,

        filters: initialFilters,
        selectedNewsIds: [],
        
        viewMode: 'list',
        showFilters: false,
        showAnalytics: false,

        // Actions
        setNewsList: (news, totalCount, currentPage, totalPages) =>
          set({
            newsList: news,
            totalCount,
            currentPage,
            totalPages,
            error: null,
          }),

        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error, loading: false }),

        setCurrentNews: (news) => set({ currentNews: news, currentNewsError: null }),
        setCurrentNewsLoading: (loading) => set({ currentNewsLoading: loading }),
        setCurrentNewsError: (error) => set({ currentNewsError: error, currentNewsLoading: false }),

        setAnalytics: (newsId, analytics) =>
          set((state) => ({
            analytics: { ...state.analytics, [newsId]: analytics },
            analyticsError: null,
          })),

        setAnalyticsLoading: (loading) => set({ analyticsLoading: loading }),
        setAnalyticsError: (error) => set({ analyticsError: error, analyticsLoading: false }),

        setFilters: (newFilters) =>
          set((state) => ({
            filters: { ...state.filters, ...newFilters },
            // Reset to first page when filters change (except when explicitly setting page)
            ...(newFilters.page === undefined && { currentPage: 1 }),
          })),

        clearFilters: () =>
          set({
            filters: initialFilters,
            currentPage: 1,
          }),

        setSelectedNewsIds: (ids) => set({ selectedNewsIds: ids }),

        toggleNewsSelection: (id) =>
          set((state) => ({
            selectedNewsIds: state.selectedNewsIds.includes(id)
              ? state.selectedNewsIds.filter((selectedId) => selectedId !== id)
              : [...state.selectedNewsIds, id],
          })),

        selectAllNews: () =>
          set((state) => ({
            selectedNewsIds: state.newsList.map((news) => news.id),
          })),

        clearSelection: () => set({ selectedNewsIds: [] }),

        setViewMode: (mode) => set({ viewMode: mode }),
        setShowFilters: (show) => set({ showFilters: show }),
        setShowAnalytics: (show) => set({ showAnalytics: show }),

        // Computed getters
        getSelectedNews: () => {
          const { newsList, selectedNewsIds } = get()
          return newsList.filter((news) => selectedNewsIds.includes(news.id))
        },

        isNewsSelected: (id) => {
          const { selectedNewsIds } = get()
          return selectedNewsIds.includes(id)
        },

        hasSelection: () => {
          const { selectedNewsIds } = get()
          return selectedNewsIds.length > 0
        },

        // Reset functions
        reset: () =>
          set({
            newsList: [],
            totalCount: 0,
            currentPage: 1,
            totalPages: 0,
            loading: false,
            error: null,
            currentNews: null,
            currentNewsLoading: false,
            currentNewsError: null,
            analytics: {},
            analyticsLoading: false,
            analyticsError: null,
            filters: initialFilters,
            selectedNewsIds: [],
          }),

        resetCurrentNews: () =>
          set({
            currentNews: null,
            currentNewsLoading: false,
            currentNewsError: null,
          }),

        resetAnalytics: () =>
          set({
            analytics: {},
            analyticsLoading: false,
            analyticsError: null,
          }),
      }),
      {
        name: 'news-store',
        // Only persist UI preferences, not data
        partialize: (state) => ({
          viewMode: state.viewMode,
          showFilters: state.showFilters,
          pageSize: state.pageSize,
          filters: {
            sortBy: state.filters.sortBy,
            sortOrder: state.filters.sortOrder,
            pageSize: state.filters.pageSize,
          },
        }),
      }
    ),
    {
      name: 'news-store',
    }
  )
)
