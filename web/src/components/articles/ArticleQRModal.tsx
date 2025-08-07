import React, { useState } from 'react'
import { QrCode, Download, Copy, ExternalLink, RefreshCw, X } from 'lucide-react'
import toast from 'react-hot-toast'

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

interface ArticleQRModalProps {
  article: Article
  isOpen: boolean
  onClose: () => void
}

export default function ArticleQRModal({ article, isOpen, onClose }: ArticleQRModalProps) {
  const [qrType, setQrType] = useState<'permanent' | 'temporary'>('permanent')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [qrCodeData, setQrCodeData] = useState<any>(null)
  const [existingQRCodes, setExistingQRCodes] = useState<any[]>([])

  // Load existing QR codes when modal opens
  React.useEffect(() => {
    if (isOpen && article.id) {
      loadExistingQRCodes()
    }
  }, [isOpen, article.id])

  const loadExistingQRCodes = async () => {
    setIsLoading(true)
    try {
      const authStorage = localStorage.getItem('auth-storage')
      let token = null
      if (authStorage) {
        try {
          const authData = JSON.parse(authStorage)
          token = authData.state?.token
        } catch (e) {
          console.warn('Failed to parse auth storage:', e)
        }
      }

      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`http://localhost:8080/api/v2/articles/${article.id}/wechat/qrcodes`, {
        headers
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setExistingQRCodes(data.data)
          // If there are existing QR codes, show the first one
          if (data.data.length > 0) {
            setQrCodeData(data.data[0])
          }
        }
      }
    } catch (error) {
      console.error('Failed to load existing QR codes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Real WeChat API call
  const generateQRCode = async () => {
    setIsGenerating(true)
    try {
      // Get auth token (optional for QR code generation)
      const authStorage = localStorage.getItem('auth-storage')
      let token = null
      if (authStorage) {
        try {
          const authData = JSON.parse(authStorage)
          token = authData.state?.token
        } catch (e) {
          console.warn('Failed to parse auth storage:', e)
        }
      }

      // Call real WeChat QR code API
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      // Add auth header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`http://localhost:8080/api/v2/articles/${article.id}/wechat/qrcode?type=${qrType}`, {
        method: 'POST',
        headers
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Failed to generate QR code')
      }

      // Transform backend response to frontend format
      const qrCodeData = {
        id: data.data.id,
        qrCodeUrl: data.data.qrCodeImageData, // Base64 encoded QR code image for display
        wechatUrl: data.data.qrCodeUrl, // WeChat QR code URL (for reference)
        shareUrl: data.data.shareUrl || `http://localhost:8080/api/v1/mobile/articles/${article.id}?qr=${data.data.sceneStr}&source=qr`,
        type: qrType,
        scanCount: data.data.scanCount || 0,
        createdAt: data.data.createdAt,
        expiresAt: data.data.expireTime || null,
        sceneStr: data.data.sceneStr
      }

      setQrCodeData(qrCodeData)
      toast.success('WeChat QR code generated successfully!')
    } catch (error) {
      console.error('QR code generation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate QR code')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const downloadQRCode = () => {
    if (!qrCodeData?.qrCodeUrl) return

    const link = document.createElement('a')
    link.href = qrCodeData.qrCodeUrl
    link.download = `article-${article.id}-qr.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('QR code downloaded!')
  }

  const openMobilePreview = () => {
    if (!qrCodeData?.shareUrl) return
    window.open(qrCodeData.shareUrl, '_blank')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            文章二维码
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Article Info */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 truncate">{article.title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            作者: {article.author || '未知'}
          </p>
        </div>

        {/* QR Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            二维码类型
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="permanent"
                checked={qrType === 'permanent'}
                onChange={(e) => setQrType(e.target.value as 'permanent')}
                className="mr-2"
              />
              <span className="text-sm">永久二维码</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="temporary"
                checked={qrType === 'temporary'}
                onChange={(e) => setQrType(e.target.value as 'temporary')}
                className="mr-2"
              />
              <span className="text-sm">临时二维码</span>
            </label>
          </div>
        </div>

        {/* Generate Button */}
        {!qrCodeData && (
          <button
            onClick={generateQRCode}
            disabled={isGenerating}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <QrCode className="w-4 h-4 mr-2" />
            )}
            {isGenerating ? '生成中...' : '生成二维码'}
          </button>
        )}

        {/* QR Code Display */}
        {qrCodeData && (
          <div className="space-y-4">
            {/* QR Code Image */}
            <div className="flex justify-center">
              <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                <img
                  src={qrCodeData.qrCodeUrl}
                  alt="QR Code"
                  className="w-48 h-48"
                />
              </div>
            </div>

            {/* QR Code Info */}
            <div className="text-center text-sm text-gray-600">
              <p>类型: {qrCodeData.type === 'permanent' ? '永久' : '临时'}</p>
              <p>扫描次数: {qrCodeData.scanCount}</p>
              {qrCodeData.expiresAt && (
                <p>过期时间: {new Date(qrCodeData.expiresAt).toLocaleString()}</p>
              )}
            </div>

            {/* Share URL */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                分享链接
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={qrCodeData.shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm"
                />
                <button
                  onClick={() => copyToClipboard(qrCodeData.shareUrl)}
                  className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200"
                  title="复制链接"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={downloadQRCode}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                下载
              </button>
              <button
                onClick={openMobilePreview}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 flex items-center justify-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                预览
              </button>
            </div>

            {/* Generate New Button */}
            <button
              onClick={() => setQrCodeData(null)}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 flex items-center justify-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              生成新的二维码
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
