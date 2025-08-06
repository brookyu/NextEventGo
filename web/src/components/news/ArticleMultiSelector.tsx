import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, FileText, X } from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { newsApi } from '../../api/news'

interface Article {
  id: string
  title: string
  summary: string
  author: string
  categoryName?: string
  viewCount: number
  createdAt: string
  isSelected: boolean
}

interface ArticleMultiSelectorProps {
  selectedArticleIds: string[]
  onSelectionChange: (articleIds: string[]) => void
  className?: string
}

export default function ArticleMultiSelector({
  selectedArticleIds,
  onSelectionChange,
  className = '',
}: ArticleMultiSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedArticles, setSelectedArticles] = useState<Map<string, Article>>(new Map())

  // Fetch articles with search and pagination
  const { data: articlesData, isLoading, error } = useQuery({
    queryKey: ['news-articles-selection', searchQuery, currentPage],
    queryFn: () => newsApi.searchArticlesForSelection({
      query: searchQuery,
      page: currentPage,
      pageSize: 12,
      sortBy: 'created_at',
      sortOrder: 'desc',
    }),
    staleTime: 30000, // 30 seconds
  })

  // Update selected articles map when selection changes
  useEffect(() => {
    if (articlesData?.articles) {
      const newSelectedMap = new Map(selectedArticles)
      articlesData.articles.forEach(article => {
        if (selectedArticleIds.includes(article.id)) {
          newSelectedMap.set(article.id, article)
        }
      })
      setSelectedArticles(newSelectedMap)
    }
  }, [articlesData, selectedArticleIds])

  const handleArticleToggle = (article: Article) => {
    const newSelectedIds = selectedArticleIds.includes(article.id)
      ? selectedArticleIds.filter(id => id !== article.id)
      : [...selectedArticleIds, article.id]
    
    // Update the selected articles map
    const newSelectedMap = new Map(selectedArticles)
    if (newSelectedIds.includes(article.id)) {
      newSelectedMap.set(article.id, article)
    } else {
      newSelectedMap.delete(article.id)
    }
    setSelectedArticles(newSelectedMap)
    
    onSelectionChange(newSelectedIds)
  }

  const handleSelectAll = () => {
    if (!articlesData?.articles) return
    
    const allIds = articlesData.articles.map(article => article.id)
    const newSelectedIds = [...new Set([...selectedArticleIds, ...allIds])]
    
    // Update the selected articles map
    const newSelectedMap = new Map(selectedArticles)
    articlesData.articles.forEach(article => {
      newSelectedMap.set(article.id, article)
    })
    setSelectedArticles(newSelectedMap)
    
    onSelectionChange(newSelectedIds)
  }

  const handleClearAll = () => {
    setSelectedArticles(new Map())
    onSelectionChange([])
  }

  const handleRemoveSelected = (articleId: string) => {
    const newSelectedIds = selectedArticleIds.filter(id => id !== articleId)
    const newSelectedMap = new Map(selectedArticles)
    newSelectedMap.delete(articleId)
    setSelectedArticles(newSelectedMap)
    onSelectionChange(newSelectedIds)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search articles by title..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Selection Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {selectedArticleIds.length} selected
          </Badge>
          {articlesData?.pagination && (
            <span className="text-sm text-gray-500">
              of {articlesData.pagination.total} total
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={isLoading || !articlesData?.articles?.length}
          >
            Select All
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            disabled={selectedArticleIds.length === 0}
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="border rounded-lg max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            Loading articles...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            Error loading articles. Please try again.
          </div>
        ) : !articlesData?.articles?.length ? (
          <div className="p-8 text-center text-gray-500">
            No articles found. {searchQuery && 'Try adjusting your search.'}
          </div>
        ) : (
          <div className="divide-y">
            {articlesData.articles.map((article) => (
              <div
                key={article.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedArticleIds.includes(article.id) ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => handleArticleToggle(article)}
              >
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={selectedArticleIds.includes(article.id)}
                    onCheckedChange={() => handleArticleToggle(article)}
                    className="mt-1"
                  />
                  <FileText className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                      {article.title}
                    </h4>
                    {article.summary && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                        {article.summary}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span>By {article.author || 'Unknown'}</span>
                      <span>Views: {article.viewCount}</span>
                      <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                      {article.categoryName && (
                        <Badge variant="outline" className="text-xs">
                          {article.categoryName}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {articlesData?.pagination && articlesData.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={!articlesData.pagination.hasPrev}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-500">
            Page {articlesData.pagination.page} of {articlesData.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={!articlesData.pagination.hasNext}
          >
            Next
          </Button>
        </div>
      )}

      {/* Selected Articles Preview */}
      {selectedArticleIds.length > 0 && (
        <div className="mt-6">
          <Label className="text-sm font-medium">Selected Articles ({selectedArticleIds.length})</Label>
          <div className="mt-2 p-3 bg-blue-50 rounded-lg border">
            <p className="text-sm text-blue-700 mb-3">
              These articles will be combined into the news publication:
            </p>
            <div className="space-y-2">
              {Array.from(selectedArticles.values()).map((article, index) => (
                <div key={article.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-blue-800">{index + 1}.</span>
                    <span className="line-clamp-1">{article.title}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSelected(article.id)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
