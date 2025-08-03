import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Share2, Eye, Calendar, User, Tag, Heart, MessageCircle, Bookmark } from 'lucide-react'
import { motion } from 'framer-motion'

interface Article {
  id: string
  title: string
  content: string
  summary?: string
  author?: string
  created_at: string
  updated_at?: string
  published_at?: string
  categoryId?: string
  tags?: string
  viewCount?: number
  readCount?: number
  isPublished?: boolean
}

export default function MobileArticleViewer() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    if (id) {
      fetchArticle(id)
    }
  }, [id])

  const fetchArticle = async (articleId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:8080/api/v2/articles/${articleId}`)
      if (!response.ok) {
        throw new Error('Article not found')
      }
      const data = await response.json()
      setArticle(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load article')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary || article.title,
          url: window.location.href,
        })
      } catch (err) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href)
        alert('链接已复制到剪贴板')
      }
    } else {
      // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert('链接已复制到剪贴板')
    }
  }

  const handleLike = () => {
    setLiked(!liked)
    // TODO: Implement like functionality
  }

  const handleBookmark = () => {
    setBookmarked(!bookmarked)
    // TODO: Implement bookmark functionality
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">文章未找到</h2>
          <p className="text-gray-600 mb-4">{error || '请检查链接是否正确'}</p>
          <button
            onClick={() => navigate('/articles')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回文章列表
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto bg-white"
      >
        {/* Article Header */}
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900 leading-tight mb-3">
            {article.title}
          </h1>
          
          {article.summary && (
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              {article.summary}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            {article.author && (
              <div className="flex items-center">
                <User className="w-3 h-3 mr-1" />
                <span>{article.author}</span>
              </div>
            )}
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{new Date(article.created_at).toLocaleDateString('zh-CN')}</span>
            </div>
            {article.viewCount !== undefined && (
              <div className="flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                <span>{article.viewCount} 阅读</span>
              </div>
            )}
            {article.tags && (
              <div className="flex items-center">
                <Tag className="w-3 h-3 mr-1" />
                <span>{article.tags}</span>
              </div>
            )}
          </div>
        </div>

        {/* Article Body */}
        <div className="p-4">
          <div 
            className="prose prose-sm max-w-none text-gray-800 leading-relaxed"
            style={{
              fontSize: '16px',
              lineHeight: '1.6',
              wordBreak: 'break-word'
            }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Action Bar */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 ${
                  liked ? 'text-red-500' : 'text-gray-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                <span className="text-sm">点赞</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-500">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">评论</span>
              </button>
              <button
                onClick={handleBookmark}
                className={`flex items-center space-x-1 ${
                  bookmarked ? 'text-blue-500' : 'text-gray-500'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
                <span className="text-sm">收藏</span>
              </button>
            </div>
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              分享
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
