import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FileText, Calendar, User, Search, Filter, Plus, Download, Eye, Edit, Trash2, MoreVertical, Tag } from 'lucide-react'

interface Article {
  id: string
  title: string
  content?: string
  summary?: string
  author?: string
  created_at?: string
  updated_at?: string
  published_at?: string
  status?: string
  category?: string
  tags?: string
}

export default function ArticlesPage() {
  const navigate = useNavigate()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalArticles, setTotalArticles] = useState(0)
  const [pageSize] = useState(20)

  useEffect(() => {
    fetchArticles()
  }, [currentPage, searchTerm])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const offset = (currentPage - 1) * pageSize
      let url = `http://localhost:8080/api/v2/articles?limit=${pageSize}&offset=${offset}`

      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch articles')
      }
      const data = await response.json()
      setArticles(data.data || [])
      setTotalArticles(data.total || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load articles')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteArticle = async (articleId: string) => {
    if (!confirm('确定要删除这篇文章吗？')) return

    try {
      const response = await fetch(`http://localhost:8080/api/v2/articles/${articleId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchArticles() // Refresh the list
      } else {
        alert('删除失败，请重试')
      }
    } catch (err) {
      alert('删除失败，请重试')
    }
  }

  // Using server-side search now, so no need for client-side filtering

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading articles...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchArticles}
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
          <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage technical articles, research papers, and documentation
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => navigate('/articles/create')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Article
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
              placeholder="Search articles..."
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
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <Download className="w-4 h-4 mr-2" />
          Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Articles</dt>
                  <dd className="text-lg font-medium text-gray-900">{totalArticles}</dd>
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
                  <dd className="text-lg font-medium text-gray-900">12</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Views</dt>
                  <dd className="text-lg font-medium text-gray-900">2,847</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Articles List */}
      {articles.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first article'}
          </p>
          <button
            onClick={() => navigate('/articles/create')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Article
          </button>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {articles.map((article, index) => (
              <motion.li
                key={article.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="hover:bg-gray-50"
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {article.title || 'Untitled Article'}
                      </h3>
                      {article.summary && (
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                          {article.summary}
                        </p>
                      )}
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <User className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        <span className="mr-4">{article.author || 'Unknown Author'}</span>
                        <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        <span>
                          {article.created_at 
                            ? new Date(article.created_at).toLocaleDateString()
                            : 'No date'
                          }
                        </span>
                        {article.category && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {article.category}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/articles/${article.id}`)}
                        className="text-gray-400 hover:text-blue-600"
                        title="查看文章"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => navigate(`/articles/${article.id}/edit`)}
                        className="text-gray-400 hover:text-green-600"
                        title="编辑文章"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(article.id)}
                        className="text-gray-400 hover:text-red-600"
                        title="删除文章"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
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
