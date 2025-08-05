import React from 'react'
import { Upload, Image, FileText, BarChart3, AlertCircle } from 'lucide-react'
import ImageSelector from '../../../components/images/ImageSelector'
import VideoSelector from '../../../components/video/VideoSelector'
import SourceArticleSelector from '../../../components/articles/SourceArticleSelector'
import { TagSelector } from '../../../components/ui/TagSelector'

interface ResourcesTabProps {
  formData: any
  errors: Record<string, string>
  onChange: (field: string, value: any) => void
}

const ResourcesTab: React.FC<ResourcesTabProps> = ({ formData, errors, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600">
        <p>Bind various resources to create a comprehensive content package. Resources are optional unless marked as required.</p>
      </div>

      {/* Video Upload (Required for VideoType 1) */}
      {formData.videoType === 1 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Video Upload <span className="text-red-500">*</span>
          </label>
          <VideoSelector
            selectedVideoId={formData.uploadId}
            onVideoSelect={(videoId) => onChange('uploadId', videoId)}
            placeholder="Select uploaded video file"
            mode="single"
            showUpload={true}
          />
          {errors.uploadId && (
            <div className="flex items-center mt-1 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.uploadId}
            </div>
          )}
        </div>
      )}

      {/* Cover Image */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Cover Image
        </label>
        <ImageSelector
          selectedImageId={formData.siteImageId}
          onImageSelect={(imageId) => onChange('siteImageId', imageId)}
          placeholder="Select cover image for the CloudVideo"
        />
      </div>

      {/* Promotion Image */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Promotion Image
        </label>
        <ImageSelector
          selectedImageId={formData.promotionPicId}
          onImageSelect={(imageId) => onChange('promotionPicId', imageId)}
          placeholder="Select promotional image"
        />
      </div>

      {/* Thumbnail */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Thumbnail
        </label>
        <ImageSelector
          selectedImageId={formData.thumbnailId}
          onImageSelect={(imageId) => onChange('thumbnailId', imageId)}
          placeholder="Select thumbnail image"
        />
      </div>

      {/* Introduction Article */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Introduction Article
        </label>
        <SourceArticleSelector
          selectedArticleId={formData.introArticleId}
          onArticleSelect={(articleId) => onChange('introArticleId', articleId)}
          placeholder="Select introduction article"
          title="Select Introduction Article"
        />
      </div>

      {/* Access Restricted Article */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Access Restricted Article
        </label>
        <SourceArticleSelector
          selectedArticleId={formData.notOpenArticleId}
          onArticleSelect={(articleId) => onChange('notOpenArticleId', articleId)}
          placeholder="Select article for restricted access"
          title="Select Access Restricted Article"
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Tags
        </label>
        <TagSelector
          selectedTagIds={formData.tags || []}
          onTagsChange={(tagIds) => onChange('tags', tagIds)}
          placeholder="Select tags for this CloudVideo"
        />
      </div>

      {/* Resource Summary */}
      {(formData.uploadId || formData.siteImageId || formData.promotionPicId || formData.thumbnailId ||
        formData.introArticleId || formData.notOpenArticleId || (formData.tags && formData.tags.length > 0)) && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Resource Summary</h3>
          <div className="space-y-2">
            {formData.uploadId && (
              <div className="flex items-center text-sm">
                <Upload className="w-4 h-4 mr-2 text-purple-500" />
                <span className="text-gray-700">Video Upload</span>
                <span className="ml-2 text-green-600">✓ Selected</span>
              </div>
            )}
            {formData.siteImageId && (
              <div className="flex items-center text-sm">
                <Image className="w-4 h-4 mr-2 text-blue-500" />
                <span className="text-gray-700">Cover Image</span>
                <span className="ml-2 text-green-600">✓ Selected</span>
              </div>
            )}
            {formData.promotionPicId && (
              <div className="flex items-center text-sm">
                <Image className="w-4 h-4 mr-2 text-green-500" />
                <span className="text-gray-700">Promotion Image</span>
                <span className="ml-2 text-green-600">✓ Selected</span>
              </div>
            )}
            {formData.thumbnailId && (
              <div className="flex items-center text-sm">
                <Image className="w-4 h-4 mr-2 text-yellow-500" />
                <span className="text-gray-700">Thumbnail</span>
                <span className="ml-2 text-green-600">✓ Selected</span>
              </div>
            )}
            {formData.introArticleId && (
              <div className="flex items-center text-sm">
                <FileText className="w-4 h-4 mr-2 text-orange-500" />
                <span className="text-gray-700">Introduction Article</span>
                <span className="ml-2 text-green-600">✓ Selected</span>
              </div>
            )}
            {formData.notOpenArticleId && (
              <div className="flex items-center text-sm">
                <FileText className="w-4 h-4 mr-2 text-red-500" />
                <span className="text-gray-700">Access Restricted Article</span>
                <span className="ml-2 text-green-600">✓ Selected</span>
              </div>
            )}
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex items-center text-sm">
                <BarChart3 className="w-4 h-4 mr-2 text-teal-500" />
                <span className="text-gray-700">Tags ({formData.tags.length})</span>
                <span className="ml-2 text-green-600">✓ Selected</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ResourcesTab
