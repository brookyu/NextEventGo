import React from 'react'
import { Search, Filter, X, Calendar, User, Tag, Globe } from 'lucide-react'
import { NewsFilter } from '../../types/news'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'

interface NewsFiltersProps {
  filters: NewsFilter
  onFiltersChange: (filters: Partial<NewsFilter>) => void
  onClearFilters: () => void
  categories?: Array<{ id: string; name: string }>
  authors?: Array<{ id: string; name: string }>
  tags?: Array<{ id: string; name: string }>
  className?: string
}

export default function NewsFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  categories = [],
  authors = [],
  tags = [],
  className = '',
}: NewsFiltersProps) {
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'page' || key === 'pageSize' || key === 'sortBy' || key === 'sortOrder') {
      return false
    }
    return value !== undefined && value !== null && value !== ''
  })

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'page' || key === 'pageSize' || key === 'sortBy' || key === 'sortOrder') {
        return false
      }
      return value !== undefined && value !== null && value !== ''
    }).length
  }

  const clearFilter = (key: keyof NewsFilter) => {
    onFiltersChange({ [key]: undefined })
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search news by title, summary, or content..."
          value={filters.search || ''}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
          className="pl-10 pr-4"
        />
        {filters.search && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearFilter('search')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4">
        {/* Type Filter */}
        <div className="min-w-[150px]">
          <Select
            value={filters.type || ''}
            onValueChange={(value) => onFiltersChange({ type: value || undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="breaking">Breaking News</SelectItem>
              <SelectItem value="regular">Regular News</SelectItem>
              <SelectItem value="announcement">Announcement</SelectItem>
              <SelectItem value="update">Update</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="min-w-[150px]">
          <Select
            value={filters.status || ''}
            onValueChange={(value) => onFiltersChange({ status: value || undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority Filter */}
        <div className="min-w-[150px]">
          <Select
            value={filters.priority || ''}
            onValueChange={(value) => onFiltersChange({ priority: value || undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="min-w-[150px]">
            <Select
              value={filters.categoryId || ''}
              onValueChange={(value) => onFiltersChange({ categoryId: value || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Author Filter */}
        {authors.length > 0 && (
          <div className="min-w-[150px]">
            <Select
              value={filters.authorId || ''}
              onValueChange={(value) => onFiltersChange({ authorId: value || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Authors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Authors</SelectItem>
                {authors.map((author) => (
                  <SelectItem key={author.id} value={author.id}>
                    {author.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Sort By */}
        <div className="min-w-[150px]">
          <Select
            value={filters.sortBy || 'createdAt'}
            onValueChange={(value) => onFiltersChange({ sortBy: value as any })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Created Date</SelectItem>
              <SelectItem value="publishedAt">Published Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="viewCount">View Count</SelectItem>
              <SelectItem value="shareCount">Share Count</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Order */}
        <div className="min-w-[120px]">
          <Select
            value={filters.sortOrder || 'desc'}
            onValueChange={(value) => onFiltersChange({ sortOrder: value as 'asc' | 'desc' })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest First</SelectItem>
              <SelectItem value="asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Clear Filters</span>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-1">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Search className="w-3 h-3" />
              <span>Search: {filters.search}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFilter('search')}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}

          {filters.type && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Globe className="w-3 h-3" />
              <span>Type: {filters.type}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFilter('type')}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}

          {filters.status && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Filter className="w-3 h-3" />
              <span>Status: {filters.status}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFilter('status')}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}

          {filters.priority && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Filter className="w-3 h-3" />
              <span>Priority: {filters.priority}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFilter('priority')}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}

          {filters.categoryId && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Tag className="w-3 h-3" />
              <span>
                Category: {categories.find(c => c.id === filters.categoryId)?.name || filters.categoryId}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFilter('categoryId')}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}

          {filters.authorId && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>
                Author: {authors.find(a => a.id === filters.authorId)?.name || filters.authorId}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFilter('authorId')}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
