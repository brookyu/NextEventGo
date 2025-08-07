import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, QrCode, Users, Clock, CheckCircle, AlertCircle, Share2 } from 'lucide-react'
import { surveyApi, Survey, SurveyQuestion } from '../../api/surveys'

interface MobileSurveyPreviewProps {
  showHeader?: boolean
  showQRInfo?: boolean
  allowParticipation?: boolean
}

export default function MobileSurveyPreview({ 
  showHeader = true, 
  showQRInfo = false,
  allowParticipation = true
}: MobileSurveyPreviewProps) {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [questions, setQuestions] = useState<SurveyQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get QR code info from URL params
  const qrCodeId = searchParams.get('qr')
  const source = searchParams.get('source') || 'qr'

  useEffect(() => {
    if (id) {
      fetchSurvey(id)
      // Track QR code scan if accessed via QR code
      if (qrCodeId) {
        trackQRCodeScan(qrCodeId)
      }
    }
  }, [id, qrCodeId])

  const fetchSurvey = async (surveyId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch survey details with questions
      const response = await surveyApi.getSurveyWithQuestions(surveyId)
      setSurvey(response.survey)
      setQuestions(response.questions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load survey')
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
        source: 'mobile_survey_preview',
        platform: 'wechat'
      }
      
      // TODO: Implement QR code scan tracking API
      console.log('Survey QR Code scan tracked:', scanData)
    } catch (err) {
      console.error('Failed to track QR code scan:', err)
    }
  }

  const handleStartSurvey = () => {
    if (survey) {
      // Navigate to survey participation page
      navigate(`/mobile/surveys/${survey.id}/participate${qrCodeId ? `?qr=${qrCodeId}` : ''}`)
    }
  }

  const handleShare = async () => {
    if (navigator.share && survey) {
      try {
        await navigator.share({
          title: survey.title,
          text: survey.description || survey.title,
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

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = '/'
    }
  }

  const getSurveyStatusInfo = () => {
    if (!survey) return null

    if (survey.status === 'published') {
      return {
        icon: CheckCircle,
        text: '调研进行中',
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      }
    } else if (survey.status === 'draft') {
      return {
        icon: AlertCircle,
        text: '调研未发布',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50'
      }
    } else {
      return {
        icon: AlertCircle,
        text: '调研已结束',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50'
      }
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

  if (error || !survey) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">调研加载失败</h2>
          <p className="text-gray-600 mb-4">{error || '调研不存在或已被删除'}</p>
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

  const statusInfo = getSurveyStatusInfo()

  return (
    <div className="min-h-screen bg-gray-50">
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
            
            <h1 className="text-lg font-semibold text-gray-900 truncate mx-4">
              调研预览
            </h1>

            <button 
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Share2 className="h-5 w-5 text-gray-600" />
            </button>
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

      {/* Survey Content */}
      <div className="p-4 space-y-6">
        {/* Survey Header */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {survey.title}
          </h1>
          
          {survey.description && (
            <p className="text-gray-600 leading-relaxed mb-4">
              {survey.description}
            </p>
          )}

          {/* Status Badge */}
          {statusInfo && (
            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${statusInfo.bgColor}`}>
              <statusInfo.icon className={`h-4 w-4 ${statusInfo.color}`} />
              <span className={`text-sm font-medium ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
            </div>
          )}
        </div>

        {/* Survey Instructions */}
        {survey.instructions && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">参与说明</h3>
            <div className="text-gray-600 leading-relaxed">
              {survey.instructions}
            </div>
          </div>
        )}

        {/* Survey Info */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">调研信息</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-gray-400" />
              <span className="text-gray-600">
                {survey.isAnonymous ? '匿名调研' : '实名调研'}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <span className="text-gray-600">
                预计用时: {Math.max(1, Math.ceil((questions.length || 0) * 0.5))} 分钟
              </span>
            </div>

            {questions.length > 0 && (
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">
                  共 {questions.length} 个问题
                </span>
              </div>
            )}

            {survey.allowMultiple && (
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">
                  允许多次参与
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Question Preview */}
        {questions.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">问题预览</h3>
            <div className="space-y-4">
              {questions.slice(0, 3).map((question, index) => (
                <div key={question.id} className="border-l-4 border-blue-200 pl-4">
                  <p className="font-medium text-gray-900">
                    {index + 1}. {question.title}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {question.type === 'single_choice' && '单选题'}
                    {question.type === 'multiple_choice' && '多选题'}
                    {question.type === 'text' && '文本题'}
                    {question.type === 'rating' && '评分题'}
                  </p>
                </div>
              ))}
              
              {questions.length > 3 && (
                <p className="text-sm text-gray-500 italic">
                  还有 {questions.length - 3} 个问题...
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action */}
      {allowParticipation && survey.status === 'published' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <button 
            onClick={handleStartSurvey}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            开始参与调研
          </button>
        </div>
      )}

      {/* Unavailable Survey Message */}
      {survey.status !== 'published' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="text-center text-gray-500">
            <p className="text-sm">
              {survey.status === 'draft' ? '调研尚未发布' : '调研已结束'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
