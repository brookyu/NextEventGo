import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileQuestion, BarChart3, Users, Calendar, Search, Filter, Plus, Eye } from 'lucide-react'

interface Survey {
  id: string
  title: string
  description?: string
  status?: string
  created_at?: string
  updated_at?: string
  responses?: number
  questions?: number
  author?: string
}

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSurveys()
  }, [])

  const fetchSurveys = async () => {
    try {
      setLoading(true)
      // For now, we'll use mock data since surveys endpoint might not exist yet
      // In the future, this would be: const response = await fetch('http://localhost:8080/api/v2/surveys')
      
      // Mock data for demonstration
      const mockSurveys: Survey[] = [
        {
          id: '1',
          title: 'Event Feedback Survey',
          description: 'Collect feedback from event attendees',
          status: 'active',
          created_at: new Date().toISOString(),
          responses: 45,
          questions: 8,
          author: 'Admin'
        },
        {
          id: '2',
          title: 'Product Satisfaction Survey',
          description: 'Measure customer satisfaction with our products',
          status: 'draft',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          responses: 0,
          questions: 12,
          author: 'Admin'
        }
      ]
      
      setSurveys(mockSurveys)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load surveys')
    } finally {
      setLoading(false)
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
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {surveys.filter(s => s.status === 'active').length}
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
                    {surveys.reduce((sum, s) => sum + (s.responses || 0), 0)}
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
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
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
                    survey.status === 'active' 
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
                    <div className="text-2xl font-bold text-gray-900">{survey.questions || 0}</div>
                    <div className="text-xs text-gray-500">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{survey.responses || 0}</div>
                    <div className="text-xs text-gray-500">Responses</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {survey.created_at 
                      ? new Date(survey.created_at).toLocaleDateString()
                      : 'No date'
                    }
                  </div>
                  <div className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {survey.author || 'Unknown'}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
