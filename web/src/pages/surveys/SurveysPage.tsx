import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileQuestion, BarChart3, Users, Calendar, Search, Filter, Plus, Eye, Edit, Trash2 } from 'lucide-react'
import { surveyApi, Survey } from '../../api/surveys'

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null)

  useEffect(() => {
    fetchSurveys()
  }, [])

  const fetchSurveys = async () => {
    try {
      setLoading(true)
      setError(null)

      // Use real API to fetch surveys
      const response = await surveyApi.getSurveys({
        page: 1,
        limit: 20,
        sortBy: 'creationTime',
        sortOrder: 'desc'
      })

      setSurveys(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load surveys')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSurvey = () => {
    setShowCreateModal(true)
  }

  const handleEditSurvey = (survey: Survey) => {
    setEditingSurvey(survey)
    setShowCreateModal(true)
  }

  const handleViewSurvey = (survey: Survey) => {
    // Navigate to survey builder page
    window.location.href = `/surveys/${survey.id}/builder`
  }

  const handleDeleteSurvey = async (survey: Survey) => {
    if (!confirm(`Are you sure you want to delete "${survey.title}"?`)) {
      return
    }

    try {
      await surveyApi.deleteSurvey(survey.id, 'current-user-id') // TODO: Get from auth context
      await fetchSurveys() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete survey')
    }
  }

  const handleSaveSurvey = async (surveyData: any) => {
    try {
      if (editingSurvey) {
        // Update existing survey
        await surveyApi.updateSurvey(editingSurvey.id, {
          title: surveyData.title,
          titleEn: surveyData.titleEn,
          description: surveyData.description,
          isPublic: surveyData.isPublic,
          updatedBy: 'current-user-id' // TODO: Get from auth context
        })
      } else {
        // Create new survey
        await surveyApi.createSurvey({
          title: surveyData.title,
          titleEn: surveyData.titleEn,
          description: surveyData.description,
          isPublic: surveyData.isPublic || false,
          formType: 0,
          categoryId: '00000000-0000-0000-0000-000000000000',
          isLuckEnabled: false,
          createdBy: 'current-user-id' // TODO: Get from auth context
        })
      }

      setShowCreateModal(false)
      setEditingSurvey(null)
      await fetchSurveys() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save survey')
    }
  }

  const filteredSurveys = surveys.filter(survey =>
    survey.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    survey.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading surveys...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileQuestion className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchSurveys}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Surveys</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage surveys to collect feedback and insights
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleCreateSurvey}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Survey
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search surveys..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileQuestion className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Surveys</dt>
                  <dd className="text-lg font-medium text-gray-900">{surveys.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Eye className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Published</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {surveys.filter(s => s.status === 'published').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Responses</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {surveys.reduce((sum, s) => sum + (s.responseCount || 0), 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg Response Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">78%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Surveys List */}
      {filteredSurveys.length === 0 ? (
        <div className="text-center py-12">
          <FileQuestion className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No surveys found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first survey'}
          </p>
          <button
            onClick={handleCreateSurvey}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Survey
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSurveys.map((survey, index) => (
            <motion.div
              key={survey.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 line-clamp-1">
                    {survey.title}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    survey.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : survey.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {survey.status || 'Draft'}
                  </span>
                </div>
                
                {survey.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {survey.description}
                  </p>
                )}
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{survey.questionCount || 0}</div>
                    <div className="text-xs text-gray-500">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{survey.responseCount || 0}</div>
                    <div className="text-xs text-gray-500">Responses</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {survey.createdAt
                      ? new Date(survey.createdAt).toLocaleDateString()
                      : 'No date'
                    }
                  </div>
                  <div className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {survey.createdBy || 'Unknown'}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleViewSurvey(survey)}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditSurvey(survey)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDeleteSurvey(survey)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Survey Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingSurvey ? 'Edit Survey' : 'Create New Survey'}
              </h3>

              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target as HTMLFormElement)
                handleSaveSurvey({
                  title: formData.get('title') as string,
                  titleEn: formData.get('titleEn') as string,
                  description: formData.get('description') as string,
                  isPublic: formData.get('isPublic') === 'on'
                })
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Survey Title (Chinese)
                    </label>
                    <input
                      type="text"
                      name="title"
                      defaultValue={editingSurvey?.title || ''}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter survey title in Chinese"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Survey Title (English)
                    </label>
                    <input
                      type="text"
                      name="titleEn"
                      defaultValue={editingSurvey?.titleEn || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter survey title in English"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      defaultValue={editingSurvey?.description || ''}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter survey description"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPublic"
                      id="isPublic"
                      defaultChecked={editingSurvey?.isPublic || false}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                      Publish survey immediately
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setEditingSurvey(null)
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    {editingSurvey ? 'Update Survey' : 'Create Survey'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
