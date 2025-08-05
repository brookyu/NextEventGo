import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { surveyApi, Survey, UpdateSurveyRequest } from '../../api/surveys'

interface SurveySettingsModalProps {
  survey: Survey
  onSave: (survey: Survey) => void
  onCancel: () => void
}

export default function SurveySettingsModal({ survey, onSave, onCancel }: SurveySettingsModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [title, setTitle] = useState('')
  const [titleEn, setTitleEn] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  // Initialize form with survey data
  useEffect(() => {
    setTitle(survey.title)
    setTitleEn(survey.titleEn || '')
    setDescription(survey.description || '')
    setIsPublic(survey.isPublic)
  }, [survey])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      setError('Survey title is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const updateData: UpdateSurveyRequest = {
        title: title.trim(),
        titleEn: titleEn.trim() || undefined,
        description: description.trim() || undefined,
        isPublic,
        updatedBy: '3a008dc7-12fe-8709-73e9-c19537e940cd' // TODO: Get from auth context
      }

      const updatedSurvey = await surveyApi.updateSurvey(survey.id, updateData)
      onSave(updatedSurvey)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update survey')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Survey Settings</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Survey Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Survey Title (Chinese) *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter survey title in Chinese"
            />
          </div>

          {/* Survey Title English */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Survey Title (English)
            </label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter survey title in English (optional)"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter survey description (optional)"
            />
          </div>

          {/* Publish Setting */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Publish survey (make it available to respondents)
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Published surveys can be accessed by anyone with the link
            </p>
          </div>

          {/* Survey Statistics */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Survey Statistics</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Questions:</span>
                <span className="ml-2 font-medium">{survey.questionCount}</span>
              </div>
              <div>
                <span className="text-gray-500">Responses:</span>
                <span className="ml-2 font-medium">{survey.responseCount}</span>
              </div>
              <div>
                <span className="text-gray-500">Created:</span>
                <span className="ml-2 font-medium">
                  {new Date(survey.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Updated:</span>
                <span className="ml-2 font-medium">
                  {new Date(survey.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
