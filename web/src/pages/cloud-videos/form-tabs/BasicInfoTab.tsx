import React from 'react'
import { AlertCircle } from 'lucide-react'
import RichTextEditor from '../../../components/articles/RichTextEditor'

interface BasicInfoTabProps {
  formData: any
  errors: Record<string, string>
  onChange: (field: string, value: any) => void
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({ formData, errors, onChange }) => {
  return (
    <div className="space-y-6">
      {/* Video Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          CloudVideo Type
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              value: 1,
              title: 'Uploaded Video',
              description: 'Content package with uploaded video',
              icon: '🎥'
            },
            {
              value: 2,
              title: 'Live Streaming',
              description: 'Live streaming content package',
              icon: '🔴'
            }
          ].map((type) => (
            <div
              key={type.value}
              className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                formData.videoType === type.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onChange('videoType', type.value)}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  name="videoType"
                  value={type.value}
                  checked={formData.videoType === type.value}
                  onChange={() => onChange('videoType', type.value)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{type.icon}</span>
                    <label className="block text-sm font-medium text-gray-900">
                      {type.title}
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => onChange('title', e.target.value)}
          className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            errors.title ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Enter CloudVideo title..."
        />
        {errors.title && (
          <div className="flex items-center mt-1 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.title}
          </div>
        )}
      </div>

      {/* Summary */}
      <div>
        <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
          Summary
        </label>
        <RichTextEditor
          content={formData.summary || ''}
          onChange={(content) => onChange('summary', content)}
          placeholder="Enter a brief description of this CloudVideo package..."
          className="min-h-[120px]"
        />
        <p className="text-xs text-gray-500 mt-1">
          Describe what this content package contains and its purpose
        </p>
      </div>

      {/* Access Control */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Access Control</h3>
        <div className="space-y-4">
          {/* Is Open */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Public Access
              </label>
              <p className="text-xs text-gray-500">
                Allow public access to this CloudVideo
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isOpen}
                onChange={(e) => onChange('isOpen', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {/* Require Auth */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Require Authentication
              </label>
              <p className="text-xs text-gray-500">
                Users must be logged in to access
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requireAuth}
                onChange={(e) => onChange('requireAuth', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {/* Support Interaction */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Support Interaction
              </label>
              <p className="text-xs text-gray-500">
                Enable user interactions and feedback
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.supportInteraction}
                onChange={(e) => onChange('supportInteraction', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {/* Allow Download */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Allow Download
              </label>
              <p className="text-xs text-gray-500">
                Allow users to download content
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowDownload}
                onChange={(e) => onChange('allowDownload', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Video Type Specific Info */}
      {formData.videoType === 1 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">🎥</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Uploaded Video Package
              </h3>
              <p className="text-sm text-blue-600">
                You'll need to select an uploaded video file in the Resources tab.
              </p>
            </div>
          </div>
        </div>
      )}

      {formData.videoType === 2 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-sm">🔴</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Live Streaming Package
              </h3>
              <p className="text-sm text-red-600">
                Configure live streaming settings in the Live Config tab.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BasicInfoTab
