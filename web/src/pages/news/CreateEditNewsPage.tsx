import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import { useNewsForEditing, useCreateNews, useUpdateNews } from '../../hooks/useNews'
import NewsForm from '../../components/news/NewsForm'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { NewsCreateRequest, NewsUpdateRequest } from '../../types/news'

export default function CreateEditNewsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = id && id !== 'create'

  // Hooks
  const { data: newsData, isLoading: loadingNews, error } = useNewsForEditing(id || '', {
    enabled: !!isEditing,
  })


  const createMutation = useCreateNews()
  const updateMutation = useUpdateNews()

  const loading = loadingNews || createMutation.isPending || updateMutation.isPending

  // Handle form submission
  const handleSubmit = async (data: NewsCreateRequest | NewsUpdateRequest) => {
    try {
      if (isEditing && id) {
        await updateMutation.mutateAsync({
          id,
          data: data as NewsUpdateRequest,
        })
        navigate('/news')
      } else {
        const newNews = await createMutation.mutateAsync(data as NewsCreateRequest)
        navigate(`/news/${newNews.id}/edit`)
      }
    } catch (error) {
      console.error('Failed to save news:', error)
    }
  }

  const handleCancel = () => {
    navigate('/news')
  }

  const handlePreview = () => {
    if (isEditing && id) {
      navigate(`/news/${id}/preview`)
    }
  }

  // Loading state
  if (isEditing && loadingNews) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading news...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (isEditing && error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-12 h-12 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load news</h3>
          <p className="text-gray-500 mb-6">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
          <Button onClick={() => navigate('/news')}>
            Back to News
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/news')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to News
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit News' : 'Create News'}
            </h1>
            {isEditing && newsData && (
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {new Date(newsData.updatedAt || newsData.createdAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Status Badge */}
          {isEditing && newsData && (
            <Badge
              className={
                newsData.status === 'published'
                  ? 'bg-green-100 text-green-800'
                  : newsData.status === 'archived'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }
            >
              {newsData.status}
            </Badge>
          )}

          {/* Preview Button */}
          {isEditing && (
            <Button
              variant="outline"
              onClick={handlePreview}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          )}

          {/* Note: Submit button is in the form itself to avoid duplicate submissions */}
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardContent className="p-6">
          <NewsForm
            key={newsData?.id || 'new'} // Force re-render when data changes
            mode={isEditing ? 'edit' : 'create'}
            initialData={newsData ? {
              title: newsData.title,
              featuredImageId: newsData.featuredImageId,
              selectedArticleIds: newsData.selectedArticleIds || [],
              scheduledAt: newsData.scheduledAt,
              expiresAt: newsData.expiresAt,
            } : undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Additional Info for Editing */}
      {isEditing && newsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Views:</span>
                  <span className="text-sm font-medium">{(newsData.viewCount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Shares:</span>
                  <span className="text-sm font-medium">{(newsData.shareCount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Engagements:</span>
                  <span className="text-sm font-medium">{(newsData.engagementCount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Articles:</span>
                  <span className="text-sm font-medium">{newsData.articles?.length || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Created:</span>
                  <span className="text-sm font-medium">
                    {new Date(newsData.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {newsData.publishedAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Published:</span>
                    <span className="text-sm font-medium">
                      {new Date(newsData.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {newsData.authorName && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Author:</span>
                    <span className="text-sm font-medium">{newsData.authorName}</span>
                  </div>
                )}
                {newsData.categoryNames && newsData.categoryNames.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-500">Categories:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {newsData.categoryNames.map((category) => (
                        <Badge key={category} variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
