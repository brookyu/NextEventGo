import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Share2, Heart, Bookmark, ArrowLeft, QrCode, Eye } from 'lucide-react'
import { articlesApi, Article } from '../../api/articles'

interface MobileArticlePreviewProps {
  // Optional props for customization
  showHeader?: boolean
  showActions?: boolean
  showQRInfo?: boolean
}

export default function MobileArticlePreview({ 
  showHeader = true, 
  showActions = true, 
  showQRInfo = false 
}: MobileArticlePreviewProps) {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [viewCount, setViewCount] = useState(0)

  // Get QR code info from URL params
  const qrCodeId = searchParams.get('qr')
  const source = searchParams.get('source') || 'qr'

  useEffect(() => {
    if (id) {
      fetchArticle(id)
      // Track QR code scan if accessed via QR code
      if (qrCodeId) {
        trackQRCodeScan(qrCodeId)
      }
    }
  }, [id, qrCodeId])

  const fetchArticle = async (articleId: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await articlesApi.getArticle(articleId)
      setArticle(response)
      setViewCount(response.viewCount || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load article')
    } finally {
      setLoading(false)
    }
  }

  const trackQRCodeScan = async (qrCodeId: string) => {
    try {
      // Track QR code scan analytics
      const scanData = {
        qrCodeId,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        source: 'mobile_preview',
        platform: 'wechat'
      }
      
      // TODO: Implement QR code scan tracking API
      console.log('QR Code scan tracked:', scanData)
    } catch (err) {
      console.error('Failed to track QR code scan:', err)
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

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = '/'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">文章加载失败</h2>
          <p className="text-gray-600 mb-4">{error || '文章不存在或已被删除'}</p>
          <button 
            onClick={handleBack}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      {showHeader && (
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="flex items-center justify-between p-4">
            <button 
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">{viewCount}</span>
            </div>

            {showActions && (
              <button 
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Share2 className="h-5 w-5 text-gray-600" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* QR Code Info Banner */}
      {showQRInfo && qrCodeId && (
        <div className="bg-blue-50 border-b border-blue-200 p-3">
          <div className="flex items-center space-x-2 text-blue-700">
            <QrCode className="h-4 w-4" />
            <span className="text-sm">通过二维码访问</span>
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="pb-20">
        {/* Cover Image */}
        {article.coverImageUrl && (
          <div className="w-full">
            <img 
              src={article.coverImageUrl} 
              alt={article.title}
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {/* Article Header */}
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900 leading-tight mb-3">
            {article.title}
          </h1>
          
          {article.summary && (
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              {article.summary}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>{new Date(article.createdAt).toLocaleDateString('zh-CN')}</span>
              {article.author && <span>作者: {article.author}</span>}
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{viewCount}</span>
            </div>
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

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="p-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      {showActions && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="flex items-center justify-around">
            <button 
              onClick={handleLike}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                liked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
              }`}
            >
              <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
              <span className="text-xs">点赞</span>
            </button>

            <button 
              onClick={handleBookmark}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                bookmarked ? 'text-blue-500' : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              <Bookmark className={`h-5 w-5 ${bookmarked ? 'fill-current' : ''}`} />
              <span className="text-xs">收藏</span>
            </button>

            <button 
              onClick={handleShare}
              className="flex flex-col items-center space-y-1 p-2 rounded-lg text-gray-600 hover:text-blue-500 transition-colors"
            >
              <Share2 className="h-5 w-5" />
              <span className="text-xs">分享</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
