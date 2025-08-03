import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Newspaper, Calendar, User, Search, Filter, Plus, Eye } from 'lucide-react'

interface NewsItem {
  id: string
  title: string
  content?: string
  summary?: string
  author?: string
  published_at?: string
  created_at?: string
  updated_at?: string
  status?: string
  views?: number
  category?: string
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8080/api/v2/news')
      if (!response.ok) {
        throw new Error('Failed to fetch news')
      }
      const data = await response.json()
      setNews(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load news')
    } finally {
      setLoading(false)
    }
  }

  const filteredNews = news.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.summary?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading news...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchNews}
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
          <h1 className="text-2xl font-bold text-gray-900">News</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your news articles and announcements
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <Plus className="w-4 h-4 mr-2" />
            Add News
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
              placeholder="Search news..."
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
                <Newspaper className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total News</dt>
                  <dd className="text-lg font-medium text-gray-900">{news.length}</dd>
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
                  <dd className="text-lg font-medium text-gray-900">{news.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">This Month</dt>
                  <dd className="text-lg font-medium text-gray-900">0</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Authors</dt>
                  <dd className="text-lg font-medium text-gray-900">1</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* News List */}
      {filteredNews.length === 0 ? (
        <div className="text-center py-12">
          <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No news found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first news article'}
          </p>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
            <Plus className="w-4 h-4 mr-2" />
            Add News
          </button>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredNews.map((item, index) => (
              <motion.li
                key={item.id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {item.title || 'Untitled News'}
                      </h3>
                      {item.summary && (
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                          {item.summary}
                        </p>
                      )}
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <User className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        <span className="mr-4">{item.author || 'Unknown Author'}</span>
                        <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        <span>
                          {item.published_at || item.created_at 
                            ? new Date(item.published_at || item.created_at!).toLocaleDateString()
                            : 'No date'
                          }
                        </span>
                        {item.views && (
                          <>
                            <Eye className="flex-shrink-0 ml-4 mr-1.5 h-4 w-4" />
                            <span>{item.views} views</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'published' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status || 'Draft'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
