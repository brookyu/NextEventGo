import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Image as ImageIcon, X } from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Label } from '../ui/label'
import { newsApi } from '../../api/news'

interface SiteImage {
  id: string
  filename: string
  originalUrl: string
  thumbnailUrl: string
  fileSize: number
  mimeType: string
  width: number
  height: number
  altText: string
  description: string
  createdAt: string
}

interface ImageSingleSelectorProps {
  selectedImageId?: string
  onSelectionChange: (imageId?: string) => void
  label?: string
  placeholder?: string
  className?: string
}

export default function ImageSingleSelector({
  selectedImageId,
  onSelectionChange,
  label = 'Featured Image',
  placeholder = 'Select a featured image',
  className = '',
}: ImageSingleSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch images with search and pagination
  const { data: imagesData, isLoading, error } = useQuery({
    queryKey: ['news-images-selection', searchQuery, currentPage],
    queryFn: () => newsApi.searchImagesForSelection({
      query: searchQuery,
      page: currentPage,
      pageSize: 12,
      sortBy: 'created_at',
      sortOrder: 'desc',
    }),
    staleTime: 30000, // 30 seconds
  })

  // Get selected image details
  const selectedImage = selectedImageId 
    ? imagesData?.images.find(img => img.id === selectedImageId)
    : undefined

  const handleImageSelect = (image: SiteImage) => {
    onSelectionChange(image.id)
  }

  const handleClearSelection = () => {
    onSelectionChange(undefined)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Label className="text-sm font-medium">{label}</Label>
      
      {/* Selected Image Preview */}
      {selectedImage && (
        <div className="relative border rounded-lg p-4 bg-blue-50">
          <div className="flex items-start space-x-4">
            <img
              src={selectedImage.thumbnailUrl || selectedImage.originalUrl}
              alt={selectedImage.altText || selectedImage.filename}
              className="w-20 h-20 object-cover rounded-lg border"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/placeholder.jpg'
              }}
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                {selectedImage.filename}
              </h4>
              <div className="text-xs text-gray-500 space-y-1">
                <div>{selectedImage.width} × {selectedImage.height}</div>
                <div>{formatFileSize(selectedImage.fileSize)}</div>
                <div>{selectedImage.mimeType}</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search images by filename..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Images Grid */}
      <div className="border rounded-lg max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            Loading images...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            Error loading images. Please try again.
          </div>
        ) : !imagesData?.images?.length ? (
          <div className="p-8 text-center text-gray-500">
            No images found. {searchQuery && 'Try adjusting your search.'}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {imagesData.images.map((image) => (
              <div
                key={image.id}
                className={`relative border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                  selectedImageId === image.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:border-gray-300'
                }`}
                onClick={() => handleImageSelect(image)}
              >
                <div className="aspect-square">
                  <img
                    src={image.thumbnailUrl || image.originalUrl}
                    alt={image.altText || image.filename}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder.jpg'
                    }}
                  />
                </div>
                
                {/* Selection indicator */}
                {selectedImageId === image.id && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-blue-500 text-white rounded-full p-1">
                      <ImageIcon className="h-3 w-3" />
                    </div>
                  </div>
                )}
                
                {/* Image info overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2">
                  <div className="text-xs truncate font-medium">
                    {image.filename}
                  </div>
                  <div className="text-xs text-gray-300">
                    {image.width} × {image.height}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {imagesData?.pagination && imagesData.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={!imagesData.pagination.hasPrev}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-500">
            Page {imagesData.pagination.page} of {imagesData.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={!imagesData.pagination.hasNext}
          >
            Next
          </Button>
        </div>
      )}

      {/* Info */}
      {!selectedImageId && (
        <p className="text-sm text-gray-500">
          {placeholder}
        </p>
      )}
    </div>
  )
}
