import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Newspaper,
  Plus,
  Grid3X3,
  List,
  Table,
  Filter,
  BarChart3,
  Settings,
  Download,
  Upload,
  Trash2,
  Archive,
  Globe,
  Clock
} from 'lucide-react'

// Import our new components and hooks
import { useNewsList, useDeleteNews, useBulkDeleteNews, useBulkPublishNews } from '../../hooks/useNews'
import { useNewsStore } from '../../store/newsStore'
import NewsListView from '../../components/news/NewsListView'
import NewsFilters from '../../components/news/NewsFilters'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'

export default function NewsPage() {
  const navigate = useNavigate()

  // Store state
  const {
    newsList,
    totalCount,
    currentPage,
    totalPages,
    loading,
    error,
    filters,
    selectedNewsIds,
    viewMode,
    showFilters,
    setFilters,
    clearFilters,
    setSelectedNewsIds,
    toggleNewsSelection,
    selectAllNews,
    clearSelection,
    setViewMode,
    setShowFilters,
    getSelectedNews,
    hasSelection,
  } = useNewsStore()

  // Hooks
  const { data: newsData, isLoading, error: queryError } = useNewsList()
  const deleteNewsMutation = useDeleteNews()
  const bulkDeleteMutation = useBulkDeleteNews()
  const bulkPublishMutation = useBulkPublishNews()

  // Local state for bulk operations
  const [showBulkActions, setShowBulkActions] = useState(false)

  // Event handlers
  const handleCreateNews = () => {
    navigate('/news/create')
  }

  const handleEditNews = (id: string) => {
    if (id === 'new') {
      handleCreateNews()
    } else {
      navigate(`/news/${id}/edit`)
    }
  }

  const handleDeleteNews = async (id: string) => {
    if (confirm('Are you sure you want to delete this news item?')) {
      await deleteNewsMutation.mutateAsync(id)
      clearSelection()
    }
  }

  const handleViewAnalytics = (id: string) => {
    navigate(`/news/${id}/analytics`)
  }

  const handleDuplicate = (id: string) => {
    // TODO: Implement duplicate functionality
    console.log('Duplicate news:', id)
  }

  const handlePublish = (id: string) => {
    // TODO: Implement publish functionality
    console.log('Publish news:', id)
  }

  const handleUnpublish = (id: string) => {
    // TODO: Implement unpublish functionality
    console.log('Unpublish news:', id)
  }

  const handleArchive = (id: string) => {
    // TODO: Implement archive functionality
    console.log('Archive news:', id)
  }

  // Bulk operations
  const handleBulkDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedNewsIds.length} news items?`)) {
      await bulkDeleteMutation.mutateAsync(selectedNewsIds)
      clearSelection()
      setShowBulkActions(false)
    }
  }

  const handleBulkPublish = async () => {
    await bulkPublishMutation.mutateAsync(selectedNewsIds)
    clearSelection()
    setShowBulkActions(false)
  }

  // Stats calculation
  const stats = {
    total: totalCount,
    published: newsList.filter(item => item.status === 'published').length,
    draft: newsList.filter(item => item.status === 'draft').length,
    archived: newsList.filter(item => item.status === 'archived').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">News Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create, manage, and publish news articles and announcements
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <Table className="w-4 h-4" />
            </Button>
          </div>

          {/* Filter Toggle */}
          <Button
            variant={showFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>

          {/* Create Button */}
          <Button onClick={handleCreateNews}>
            <Plus className="w-4 h-4 mr-2" />
            Create News
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NewsFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={clearFilters}
              // TODO: Add categories, authors, tags from API
              categories={[]}
              authors={[]}
              tags={[]}
            />
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions */}
      {hasSelection() && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedNewsIds.length} item(s) selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                >
                  Clear Selection
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkPublish}
                  disabled={bulkPublishMutation.isPending}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Publish
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {/* TODO: Bulk archive */}}
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={bulkDeleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Newspaper className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total News</dt>
                  <dd className="text-2xl font-bold text-gray-900">{stats.total}</dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Globe className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Published</dt>
                  <dd className="text-2xl font-bold text-gray-900">{stats.published}</dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Draft</dt>
                  <dd className="text-2xl font-bold text-gray-900">{stats.draft}</dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Archive className="h-8 w-8 text-gray-600" />
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Archived</dt>
                  <dd className="text-2xl font-bold text-gray-900">{stats.archived}</dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* News Content */}
      <Card>
        <CardContent className="p-0">
          <NewsListView
            news={newsList}
            loading={isLoading || loading}
            selectedIds={selectedNewsIds}
            onSelect={toggleNewsSelection}
            onSelectAll={selectAllNews}
            onEdit={handleEditNews}
            onDelete={handleDeleteNews}
            onDuplicate={handleDuplicate}
            onPublish={handlePublish}
            onUnpublish={handleUnpublish}
            onArchive={handleArchive}
            onViewAnalytics={handleViewAnalytics}
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Showing {((currentPage - 1) * filters.pageSize!) + 1} to{' '}
              {Math.min(currentPage * filters.pageSize!, totalCount)} of {totalCount} results
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ page: currentPage - 1 })}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ page: currentPage + 1 })}
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
