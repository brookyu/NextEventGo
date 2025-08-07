import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, AlertCircle } from 'lucide-react'
import { surveyApi, Survey, SurveyQuestion } from '../../api/surveys'

export default function MobileSurveyParticipate() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [questions, setQuestions] = useState<SurveyQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)

  const qrCodeId = searchParams.get('qr')

  useEffect(() => {
    if (id) {
      fetchSurvey(id)
    }
  }, [id])

  const fetchSurvey = async (surveyId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await surveyApi.getSurveyWithQuestions(surveyId)
      setSurvey(response.survey)
      setQuestions(response.questions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load survey')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      
      // TODO: Implement survey submission API
      const submissionData = {
        surveyId: id,
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer
        })),
        qrCodeId,
        submittedAt: new Date().toISOString()
      }
      
      console.log('Survey submission:', submissionData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setCompleted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit survey')
    } finally {
      setSubmitting(false)
    }
  }

  const handleBack = () => {
    navigate(`/mobile/surveys/${id}${qrCodeId ? `?qr=${qrCodeId}` : ''}`)
  }

  const renderQuestion = (question: SurveyQuestion) => {
    const currentAnswer = answers[question.id]

    switch (question.type) {
      case 'single_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  className="text-blue-600"
                />
                <span className="flex-1">{option}</span>
              </label>
            ))}
          </div>
        )

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(currentAnswer) && currentAnswer.includes(option)}
                  onChange={(e) => {
                    const newAnswer = Array.isArray(currentAnswer) ? [...currentAnswer] : []
                    if (e.target.checked) {
                      newAnswer.push(option)
                    } else {
                      const index = newAnswer.indexOf(option)
                      if (index > -1) newAnswer.splice(index, 1)
                    }
                    handleAnswer(question.id, newAnswer)
                  }}
                  className="text-blue-600"
                />
                <span className="flex-1">{option}</span>
              </label>
            ))}
          </div>
        )

      case 'text':
        return (
          <textarea
            value={currentAnswer || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder="请输入您的答案..."
            className="w-full p-3 border rounded-lg resize-none h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )

      case 'rating':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">1分 (最低)</span>
              <span className="text-sm text-gray-500">5分 (最高)</span>
            </div>
            <div className="flex justify-center space-x-4">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleAnswer(question.id, rating)}
                  className={`w-12 h-12 rounded-full border-2 font-semibold transition-colors ${
                    currentAnswer === rating
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-600 hover:border-blue-400'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>
        )

      default:
        return <div className="text-gray-500">不支持的问题类型</div>
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

  if (error || !survey || questions.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">无法加载调研</h2>
          <p className="text-gray-600 mb-4">{error || '调研不存在或没有问题'}</p>
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

  if (completed) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">提交成功！</h2>
          <p className="text-gray-600 mb-6">感谢您参与本次调研</p>
          <button 
            onClick={handleBack}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回调研详情
          </button>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          
          <div className="flex-1 mx-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {currentQuestionIndex + 1} / {questions.length}
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="w-10" /> {/* Spacer for balance */}
        </div>
      </div>

      {/* Question Content */}
      <div className="p-6 pb-24">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {currentQuestion.title}
          </h2>
          {currentQuestion.description && (
            <p className="text-gray-600 mb-4">
              {currentQuestion.description}
            </p>
          )}
          {currentQuestion.isRequired && (
            <p className="text-sm text-red-500 mb-4">* 此题为必答题</p>
          )}
        </div>

        {renderQuestion(currentQuestion)}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex justify-between space-x-4">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            上一题
          </button>
          
          <button
            onClick={handleNext}
            disabled={submitting}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                <span>{currentQuestionIndex === questions.length - 1 ? '提交' : '下一题'}</span>
                {currentQuestionIndex < questions.length - 1 && <ArrowRight className="h-4 w-4" />}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
