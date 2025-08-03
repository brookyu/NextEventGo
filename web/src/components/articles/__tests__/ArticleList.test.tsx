import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'

import { ArticleList } from '../ArticleList'
import { useArticleStore } from '@/store/articleStore'
import { Article } from '@/types/article'

// Mock the store
vi.mock('@/store/articleStore')
const mockUseArticleStore = vi.mocked(useArticleStore)

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

// Test data
const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Test Article 1',
    summary: 'This is a test article summary',
    content: '<p>Test content</p>',
    author: 'Test Author',
    categoryId: 'cat-1',
    promotionCode: 'TEST123',
    isPublished: true,
    viewCount: 150,
    readCount: 120,
    shareCount: 25,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    category: {
      id: 'cat-1',
      name: 'Technology',
      description: 'Tech articles',
      sortOrder: 1,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  },
  {
    id: '2',
    title: 'Test Article 2',
    summary: 'Another test article',
    content: '<p>More test content</p>',
    author: 'Another Author',
    categoryId: 'cat-2',
    promotionCode: 'TEST456',
    isPublished: false,
    viewCount: 75,
    readCount: 50,
    shareCount: 10,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
]

const mockStoreState = {
  articles: mockArticles,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    categoryId: '',
    tagIds: [],
    status: 'all' as const,
    author: '',
    sortBy: 'createdAt' as const,
    sortOrder: 'desc' as const,
  },
  setFilters: vi.fn(),
  fetchArticles: vi.fn(),
  deleteArticle: vi.fn(),
  publishArticle: vi.fn(),
}

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('ArticleList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseArticleStore.mockReturnValue(mockStoreState)
  })

  it('renders article list correctly', () => {
    render(
      <TestWrapper>
        <ArticleList />
      </TestWrapper>
    )

    expect(screen.getByText('Articles')).toBeInTheDocument()
    expect(screen.getByText('Manage your articles and content')).toBeInTheDocument()
    expect(screen.getByText('Test Article 1')).toBeInTheDocument()
    expect(screen.getByText('Test Article 2')).toBeInTheDocument()
  })

  it('displays article information correctly', () => {
    render(
      <TestWrapper>
        <ArticleList />
      </TestWrapper>
    )

    // Check first article
    expect(screen.getByText('Test Article 1')).toBeInTheDocument()
    expect(screen.getByText('This is a test article summary')).toBeInTheDocument()
    expect(screen.getByText('Test Author')).toBeInTheDocument()
    expect(screen.getByText('Published')).toBeInTheDocument()
    expect(screen.getByText('Technology')).toBeInTheDocument()

    // Check second article
    expect(screen.getByText('Test Article 2')).toBeInTheDocument()
    expect(screen.getByText('Another test article')).toBeInTheDocument()
    expect(screen.getByText('Another Author')).toBeInTheDocument()
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('handles search input correctly', async () => {
    render(
      <TestWrapper>
        <ArticleList />
      </TestWrapper>
    )

    const searchInput = screen.getByPlaceholderText('Search articles...')
    fireEvent.change(searchInput, { target: { value: 'test search' } })

    await waitFor(() => {
      expect(mockStoreState.setFilters).toHaveBeenCalledWith({ search: 'test search' })
    })
  })

  it('handles filter changes correctly', async () => {
    render(
      <TestWrapper>
        <ArticleList />
      </TestWrapper>
    )

    // Find and click the status filter
    const statusFilter = screen.getByRole('combobox', { name: /status/i })
    fireEvent.click(statusFilter)

    // Wait for dropdown to appear and select "Published"
    await waitFor(() => {
      const publishedOption = screen.getByText('Published')
      fireEvent.click(publishedOption)
    })

    expect(mockStoreState.setFilters).toHaveBeenCalledWith({ status: 'published' })
  })

  it('calls onCreateNew when New Article button is clicked', () => {
    const mockOnCreateNew = vi.fn()
    
    render(
      <TestWrapper>
        <ArticleList onCreateNew={mockOnCreateNew} />
      </TestWrapper>
    )

    const newArticleButton = screen.getByText('New Article')
    fireEvent.click(newArticleButton)

    expect(mockOnCreateNew).toHaveBeenCalled()
  })

  it('calls onEditArticle when edit action is triggered', async () => {
    const mockOnEditArticle = vi.fn()
    
    render(
      <TestWrapper>
        <ArticleList onEditArticle={mockOnEditArticle} />
      </TestWrapper>
    )

    // Find the first article card and hover to show actions
    const articleCard = screen.getByText('Test Article 1').closest('.group')
    expect(articleCard).toBeInTheDocument()

    // Find and click the more actions button
    const moreButton = articleCard?.querySelector('button[aria-haspopup="menu"]')
    if (moreButton) {
      fireEvent.click(moreButton)
    }

    // Wait for dropdown menu and click edit
    await waitFor(() => {
      const editButton = screen.getByText('Edit')
      fireEvent.click(editButton)
    })

    expect(mockOnEditArticle).toHaveBeenCalledWith(mockArticles[0])
  })

  it('calls onViewArticle when article title is clicked', () => {
    const mockOnViewArticle = vi.fn()
    
    render(
      <TestWrapper>
        <ArticleList onViewArticle={mockOnViewArticle} />
      </TestWrapper>
    )

    const articleTitle = screen.getByText('Test Article 1')
    fireEvent.click(articleTitle)

    expect(mockOnViewArticle).toHaveBeenCalledWith(mockArticles[0])
  })

  it('shows loading state correctly', () => {
    mockUseArticleStore.mockReturnValue({
      ...mockStoreState,
      isLoading: true,
      articles: [],
    })

    render(
      <TestWrapper>
        <ArticleList />
      </TestWrapper>
    )

    // Should show skeleton loading state
    expect(screen.getByTestId('article-list-skeleton') || document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('shows error state correctly', () => {
    mockUseArticleStore.mockReturnValue({
      ...mockStoreState,
      error: 'Failed to load articles',
      articles: [],
    })

    render(
      <TestWrapper>
        <ArticleList />
      </TestWrapper>
    )

    expect(screen.getByText('Failed to load articles')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('shows empty state when no articles', () => {
    mockUseArticleStore.mockReturnValue({
      ...mockStoreState,
      articles: [],
    })

    render(
      <TestWrapper>
        <ArticleList />
      </TestWrapper>
    )

    expect(screen.getByText('No articles found')).toBeInTheDocument()
    expect(screen.getByText('Get started by creating your first article')).toBeInTheDocument()
  })

  it('shows search empty state when search has no results', () => {
    mockUseArticleStore.mockReturnValue({
      ...mockStoreState,
      articles: [],
      filters: {
        ...mockStoreState.filters,
        search: 'no results',
      },
    })

    render(
      <TestWrapper>
        <ArticleList />
      </TestWrapper>
    )

    expect(screen.getByText('No articles found')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your search terms')).toBeInTheDocument()
  })

  it('handles delete article correctly', async () => {
    const mockDeleteArticle = vi.fn().mockResolvedValue(undefined)
    mockUseArticleStore.mockReturnValue({
      ...mockStoreState,
      deleteArticle: mockDeleteArticle,
    })

    render(
      <TestWrapper>
        <ArticleList />
      </TestWrapper>
    )

    // Find the first article card and open actions menu
    const articleCard = screen.getByText('Test Article 1').closest('.group')
    const moreButton = articleCard?.querySelector('button[aria-haspopup="menu"]')
    if (moreButton) {
      fireEvent.click(moreButton)
    }

    // Click delete
    await waitFor(() => {
      const deleteButton = screen.getByText('Delete')
      fireEvent.click(deleteButton)
    })

    expect(mockDeleteArticle).toHaveBeenCalledWith('1')
  })

  it('handles publish article correctly', async () => {
    const mockPublishArticle = vi.fn().mockResolvedValue(mockArticles[1])
    mockUseArticleStore.mockReturnValue({
      ...mockStoreState,
      publishArticle: mockPublishArticle,
    })

    render(
      <TestWrapper>
        <ArticleList />
      </TestWrapper>
    )

    // Find the second article (draft) and open actions menu
    const articleCard = screen.getByText('Test Article 2').closest('.group')
    const moreButton = articleCard?.querySelector('button[aria-haspopup="menu"]')
    if (moreButton) {
      fireEvent.click(moreButton)
    }

    // Click publish
    await waitFor(() => {
      const publishButton = screen.getByText('Publish')
      fireEvent.click(publishButton)
    })

    expect(mockPublishArticle).toHaveBeenCalledWith('2')
  })
})
