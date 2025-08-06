import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Checkbox } from '../ui/checkbox'
import { Badge } from '../ui/badge'
import { NewsCreateRequest, NewsUpdateRequest } from '../../types/news'
import { newsApi } from '../../api/news'
import { articlesApi } from '../../api/articles'
import ArticleSelector from '../articles/ArticleSelector'
import ImageSelector from '../images/ImageSelector'

const newsSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title must be less than 500 characters'),
  featuredImageId: z.string().optional(),
  scheduledAt: z.string().optional(),
  expiresAt: z.string().optional(),
  selectedArticleIds: z.array(z.string()).default([]),
})

type NewsFormData = z.infer<typeof newsSchema>

interface NewsFormProps {
  initialData?: Partial<NewsFormData>
  onSubmit: (data: NewsCreateRequest | NewsUpdateRequest) => void
  onCancel: () => void
  loading?: boolean
  mode: 'create' | 'edit'
}

export default function NewsForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  mode,
}: NewsFormProps) {
  const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>([])
  const [selectedImageId, setSelectedImageId] = useState<string | undefined>()



  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isValid },
  } = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      selectedArticleIds: [],
      ...initialData, // Apply initial data directly to defaultValues
    },
  })

  // Initialize local state from initial data
  useEffect(() => {
    if (initialData?.selectedArticleIds) {
      setSelectedArticleIds(initialData.selectedArticleIds)
    }
    if (initialData?.featuredImageId) {
      setSelectedImageId(initialData.featuredImageId)
    }
  }, [initialData])



  // Handle article selection
  const handleArticleSelectionChange = (articleIds: string[]) => {
    setSelectedArticleIds(articleIds)
    setValue('selectedArticleIds', articleIds)
  }

  // Handle image selection
  const handleImageSelectionChange = (imageId?: string) => {
    setSelectedImageId(imageId)
    setValue('featuredImageId', imageId)
  }

  const onFormSubmit = async (data: NewsFormData) => {
    // Use the new API for creating news with selectors
    if (mode === 'create' && selectedArticleIds.length > 0) {
      try {
        const result = await newsApi.createNewsWithSelectors({
          title: data.title,
          featuredImageId: selectedImageId,
          selectedArticleIds: selectedArticleIds,
          scheduledAt: data.scheduledAt,
          expiresAt: data.expiresAt,
        })

        // Success! Navigate directly to avoid duplicate API calls
        // Convert result to expected format and navigate
        const newsResult = {
          id: result.id,
          title: data.title,
          featuredImageId: selectedImageId,
          selectedArticleIds: selectedArticleIds,
          scheduledAt: data.scheduledAt,
          expiresAt: data.expiresAt,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        // Navigate directly without calling onSubmit to avoid duplicate API calls
        window.location.href = `/news/${result.id}/edit`
        return
      } catch (error) {
        console.error('Failed to create news with selectors:', error)
        // Fall back to original submission
        const formDataWithSelections = {
          ...data,
          selectedArticleIds: selectedArticleIds,
          featuredImageId: selectedImageId,
        }
        onSubmit(formDataWithSelections as NewsCreateRequest | NewsUpdateRequest)
        return
      }
    }

    // Default submission for edit mode
    const formDataWithSelections = {
      ...data,
      selectedArticleIds: selectedArticleIds,
      featuredImageId: selectedImageId,
    }
    onSubmit(formDataWithSelections as NewsCreateRequest | NewsUpdateRequest)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Enter news title..."
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                )}
              </div>



              {/* Featured Image Selector */}
              <div>
                <Label htmlFor="featuredImage">Featured Image</Label>
                <ImageSelector
                  selectedImageId={selectedImageId}
                  onImageSelect={handleImageSelectionChange}
                  placeholder="Select a featured image for this news"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="articles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Select Articles</span>
                <Badge variant="secondary" className="ml-2">
                  {selectedArticleIds.length} selected
                </Badge>
              </CardTitle>
              <p className="text-sm text-gray-500">
                Choose which articles to include in this news publication. Selected articles will be combined into a single WeChat news post.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Article Button */}
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Selected Articles</h4>
                <ArticleSelector
                  onArticleSelect={(articleId, article) => {
                    if (articleId && !selectedArticleIds.includes(articleId)) {
                      const newIds = [...selectedArticleIds, articleId]
                      setSelectedArticleIds(newIds)
                      setValue('selectedArticleIds', newIds)
                    }
                  }}
                  placeholder="Add Article"
                  title="Select Article to Add"
                  allowClear={false}
                />
              </div>

              {/* Selected Articles List */}
              {selectedArticleIds.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No articles selected yet.</p>
                  <p className="text-sm">Click "Add Article" to select articles for this news.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedArticleIds.map((articleId, index) => (
                    <SelectedArticleItem
                      key={articleId}
                      articleId={articleId}
                      index={index}
                      onRemove={() => {
                        const newIds = selectedArticleIds.filter(id => id !== articleId)
                        setSelectedArticleIds(newIds)
                        setValue('selectedArticleIds', newIds)
                      }}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>



        <TabsContent value="scheduling" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduling & Expiration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Scheduled At */}
              <div>
                <Label htmlFor="scheduledAt">Scheduled Publication</Label>
                <Input
                  id="scheduledAt"
                  {...register('scheduledAt')}
                  type="datetime-local"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Leave empty to publish immediately
                </p>
              </div>

              {/* Expires At */}
              <div>
                <Label htmlFor="expiresAt">Expiration Date</Label>
                <Input
                  id="expiresAt"
                  {...register('expiresAt')}
                  type="datetime-local"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Leave empty for no expiration
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!isValid || loading}
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create News' : 'Update News'}
        </Button>
      </div>
    </form>
  )
}

// Component to display selected article with details
interface SelectedArticleItemProps {
  articleId: string
  index: number
  onRemove: () => void
}

function SelectedArticleItem({ articleId, index, onRemove }: SelectedArticleItemProps) {
  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', articleId],
    queryFn: () => articlesApi.getArticle(articleId),
    enabled: !!articleId,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
          <div>
            <p className="font-medium">Loading...</p>
            <p className="text-sm text-gray-500">Fetching article details</p>
          </div>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          Remove
        </Button>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
          <div>
            <p className="font-medium text-red-600">Error loading article</p>
            <p className="text-sm text-red-500">Article ID: {articleId}</p>
          </div>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          Remove
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
        <div className="flex-1">
          <p className="font-medium">{article.title}</p>
          <p className="text-sm text-gray-500">
            By {article.author} • {article.summary ? article.summary.substring(0, 100) + '...' : 'No summary'}
          </p>
        </div>
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
        Remove
      </Button>
    </div>
  )
}
