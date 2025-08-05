import { useState, useEffect } from 'react'
import { surveyApi, Survey } from '../../api/surveys'

export default function SurveyTestPage() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const loadSurveys = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await surveyApi.getSurveys({
        page: 1,
        limit: 5
      })
      setSurveys(response.data)
      setMessage(`Loaded ${response.data.length} surveys`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load surveys')
    } finally {
      setLoading(false)
    }
  }

  const createTestSurvey = async () => {
    try {
      setLoading(true)
      setError(null)
      const newSurvey = await surveyApi.createSurvey({
        title: '前端按钮测试调研',
        titleEn: 'Frontend Button Test Survey',
        description: '这是一个测试前端按钮功能的调研',
        isPublic: false,
        formType: 0,
        categoryId: '00000000-0000-0000-0000-000000000000',
        isLuckEnabled: false,
        createdBy: 'frontend-test-user'
      })
      
      setMessage(`Created survey: ${newSurvey.title} (ID: ${newSurvey.id})`)
      await loadSurveys() // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create survey')
    } finally {
      setLoading(false)
    }
  }

  const updateTestSurvey = async () => {
    if (surveys.length === 0) {
      setError('No surveys to update')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const surveyToUpdate = surveys[0]
      const updatedSurvey = await surveyApi.updateSurvey(surveyToUpdate.id, {
        title: surveyToUpdate.title + ' (Updated)',
        titleEn: (surveyToUpdate.titleEn || '') + ' (Updated)',
        description: (surveyToUpdate.description || '') + ' - Updated via frontend test',
        isPublic: !surveyToUpdate.isPublic,
        updatedBy: 'frontend-test-user'
      })
      
      setMessage(`Updated survey: ${updatedSurvey.title}`)
      await loadSurveys() // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update survey')
    } finally {
      setLoading(false)
    }
  }

  const deleteTestSurvey = async () => {
    if (surveys.length === 0) {
      setError('No surveys to delete')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const surveyToDelete = surveys[surveys.length - 1] // Delete the last one
      await surveyApi.deleteSurvey(surveyToDelete.id, 'frontend-test-user')
      
      setMessage(`Deleted survey: ${surveyToDelete.title}`)
      await loadSurveys() // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete survey')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSurveys()
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Survey API Test Page</h1>
      
      {/* Status Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <strong>Success:</strong> {message}
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <button
          onClick={loadSurveys}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load Surveys'}
        </button>
        
        <button
          onClick={createTestSurvey}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Survey'}
        </button>
        
        <button
          onClick={updateTestSurvey}
          disabled={loading || surveys.length === 0}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update First'}
        </button>
        
        <button
          onClick={deleteTestSurvey}
          disabled={loading || surveys.length === 0}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? 'Deleting...' : 'Delete Last'}
        </button>
      </div>

      {/* Survey List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Surveys ({surveys.length})</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {surveys.map((survey, index) => (
            <div key={survey.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">
                    {index + 1}. {survey.title}
                  </h3>
                  {survey.titleEn && (
                    <p className="text-sm text-gray-600">{survey.titleEn}</p>
                  )}
                  {survey.description && (
                    <p className="text-xs text-gray-500 mt-1">{survey.description}</p>
                  )}
                </div>
                
                <div className="ml-4 flex items-center space-x-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    survey.status === 'published' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {survey.status}
                  </span>
                  
                  <div className="text-xs text-gray-500">
                    <div>Questions: {survey.questionCount}</div>
                    <div>Responses: {survey.responseCount}</div>
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    ID: {survey.id.slice(0, 8)}...
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {surveys.length === 0 && !loading && (
            <div className="px-6 py-8 text-center text-gray-500">
              No surveys found. Click "Load Surveys" to fetch from the database.
            </div>
          )}
        </div>
      </div>

      {/* Debug Info */}
      <div className="mt-6 bg-gray-100 p-4 rounded">
        <h3 className="font-medium mb-2">Debug Info:</h3>
        <div className="text-sm space-y-1">
          <div>Backend URL: <code>/api/v1/surveys</code></div>
          <div>Total Surveys: {surveys.length}</div>
          <div>Loading: {loading ? 'Yes' : 'No'}</div>
          <div>Last Action: {message || 'None'}</div>
        </div>
      </div>
    </div>
  )
}
