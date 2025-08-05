import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Save,
  X,
  Upload,
  Image,
  FileText,
  BarChart3,
  Calendar,
  Settings,
  Eye,
  EyeOff,
  MessageCircle,
  Heart,
  Share2,
  TrendingUp,
  Download,
  Users,
  Lock
} from 'lucide-react'
import BasicInfoTab from './form-tabs/BasicInfoTab'
import ResourcesTab from './form-tabs/ResourcesTab'
import FeaturesTab from './form-tabs/FeaturesTab'
import LiveConfigTab from './form-tabs/LiveConfigTab'

// Types
interface CloudVideoFormData {
  id?: string
  title: string
  summary: string
  videoType: number // 0=basic, 1=uploaded, 2=live
  isOpen: boolean
  requireAuth: boolean
  supportInteraction: boolean
  allowDownload: boolean
  enableComments: boolean
  enableLikes: boolean
  enableSharing: boolean
  enableAnalytics: boolean
  
  // Resource Bindings
  uploadId?: string
  siteImageId?: string
  promotionPicId?: string
  thumbnailId?: string
  introArticleId?: string
  notOpenArticleId?: string
  surveyId?: string
  categoryId?: string
  boundEventId?: string
  
  // Live Streaming (for VideoType = 2)
  scheduledStartTime?: string
  videoEndTime?: string
}

interface CloudVideoFormProps {
  cloudVideo?: any // Existing CloudVideo for editing
  onSave: (data: CloudVideoFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const CloudVideoForm: React.FC<CloudVideoFormProps> = ({
  cloudVideo,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<CloudVideoFormData>({
    title: '',
    summary: '',
    videoType: 1, // Default to Uploaded Video
    isOpen: true,
    requireAuth: false,
    supportInteraction: true,
    allowDownload: false,
    enableComments: true,
    enableLikes: true,
    enableSharing: true,
    enableAnalytics: true,
    categoryId: 'b33633e9-853d-4ae8-a02d-cde85acf4db9' // Default category
  })

  const [activeTab, setActiveTab] = useState<'basic' | 'resources' | 'features' | 'live'>('basic')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Lock body scroll when modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [])

  // Initialize form data from existing CloudVideo
  useEffect(() => {
    if (cloudVideo) {
      setFormData({
        id: cloudVideo.id,
        title: cloudVideo.title || '',
        summary: cloudVideo.summary || '',
        videoType: cloudVideo.videoType === 0
          ? (cloudVideo.cloudUrl || cloudVideo.streamKey ? 2 : 1) // Smart migration: Live if has streaming fields, otherwise Uploaded
          : (cloudVideo.videoType ?? 1),
        isOpen: cloudVideo.isOpen ?? true,
        requireAuth: cloudVideo.requireAuth ?? false,
        supportInteraction: cloudVideo.supportInteraction ?? true,
        allowDownload: cloudVideo.allowDownload ?? false,
        enableComments: cloudVideo.enableComments ?? true,
        enableLikes: cloudVideo.enableLikes ?? true,
        enableSharing: cloudVideo.enableSharing ?? true,
        enableAnalytics: cloudVideo.enableAnalytics ?? true,
        
        // Resource bindings
        uploadId: cloudVideo.uploadedVideo?.id,
        siteImageId: cloudVideo.coverImage?.id,
        promotionPicId: cloudVideo.promotionImage?.id,
        thumbnailId: cloudVideo.thumbnailImage?.id,
        introArticleId: cloudVideo.introArticle?.id,
        notOpenArticleId: cloudVideo.notOpenArticle?.id,
        surveyId: cloudVideo.survey?.id,
        categoryId: cloudVideo.category?.id || 'b33633e9-853d-4ae8-a02d-cde85acf4db9',
        boundEventId: cloudVideo.boundEvent?.id,
        
        // Live streaming
        scheduledStartTime: cloudVideo.startTime,
        videoEndTime: cloudVideo.videoEndTime
      })
    }
  }, [cloudVideo])

  const handleInputChange = (field: keyof CloudVideoFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (formData.videoType === 1 && !formData.uploadId) {
      newErrors.uploadId = 'Video upload is required for uploaded video type'
    }

    if (formData.videoType === 2) {
      if (!formData.scheduledStartTime) {
        newErrors.scheduledStartTime = 'Start time is required for live videos'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await onSave(formData)
    } catch (error) {
      console.error('Failed to save CloudVideo:', error)
    }
  }

  const getVideoTypeLabel = (type: number) => {
    switch (type) {
      case 0: return 'Basic Content Package'
      case 1: return 'Uploaded Video Package'
      case 2: return 'Live Streaming Package'
      default: return 'Unknown'
    }
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Settings },
    { id: 'resources', label: 'Resources', icon: Upload },
    { id: 'features', label: 'Features', icon: TrendingUp },
    ...(formData.videoType === 2 ? [{ id: 'live', label: 'Live Config', icon: Calendar }] : [])
  ]

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {cloudVideo ? 'Edit CloudVideo' : 'Create CloudVideo'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {getVideoTypeLabel(formData.videoType)}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 px-6 flex-shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 min-h-0">
            {activeTab === 'basic' && (
              <BasicInfoTab
                formData={formData}
                errors={errors}
                onChange={handleInputChange}
              />
            )}
            
            {activeTab === 'resources' && (
              <ResourcesTab
                formData={formData}
                errors={errors}
                onChange={handleInputChange}
              />
            )}
            
            {activeTab === 'features' && (
              <FeaturesTab
                formData={formData}
                onChange={handleInputChange}
              />
            )}
            
            {activeTab === 'live' && formData.videoType === 2 && (
              <LiveConfigTab
                formData={formData}
                errors={errors}
                onChange={handleInputChange}
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {cloudVideo ? 'Update' : 'Create'} CloudVideo
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default CloudVideoForm
