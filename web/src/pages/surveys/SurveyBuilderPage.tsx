import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Save, 
  Eye, 
  Settings, 
  Plus, 
  GripVertical, 
  Edit3, 
  Trash2, 
  ArrowLeft,
  Globe,
  Lock,
  CheckCircle
} from 'lucide-react'
import { surveyApi, Survey, SurveyQuestion, CreateQuestionRequest, UpdateQuestionRequest } from '../../api/surveys'
import { useAuthStore } from '../../store/authStore'
import QuestionFormModal from '../../components/surveys/QuestionFormModal'
import SurveySettingsModal from '../../components/surveys/SurveySettingsModal'

interface QuestionFormData {
  questionText: string
  questionTextEn?: string
  questionType: 'text' | 'radio' | 'checkbox' | 'rating'
  choices?: string[]
  choicesEn?: string[]
  isRequired: boolean
  isProjected: boolean
}

// Question Type Button Component
interface QuestionTypeButtonProps {
  type: 'text' | 'radio' | 'checkbox' | 'rating'
  label: string
  description: string
  onClick: () => void
}

function QuestionTypeButton({ type, label, description, onClick }: QuestionTypeButtonProps) {
  const icons = {
    text: '📝',
    radio: '⚪',
    checkbox: '☑️',
    rating: '⭐'
  }

  return (
    <button
      onClick={onClick}
      className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <span className="text-xl">{icons[type]}</span>
        <div>
          <div className="font-medium text-gray-900">{label}</div>
          <div className="text-sm text-gray-500">{description}</div>
        </div>
      </div>
    </button>
  )
}

export default function SurveyBuilderPage() {
  const { surveyId } = useParams<{ surveyId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [questions, setQuestions] = useState<SurveyQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // UI State
  const [activeTab, setActiveTab] = useState<'builder' | 'preview'>('builder')
  const [editingQuestion, setEditingQuestion] = useState<SurveyQuestion | null>(null)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [showSurveySettings, setShowSurveySettings] = useState(false)

  // Load survey and questions
  useEffect(() => {
    if (surveyId) {
      loadSurveyData()
    }
  }, [surveyId])

  const loadSurveyData = async () => {
    if (!surveyId) return
    
    try {
      setLoading(true)
      setError(null)
      
      const data = await surveyApi.getSurveyWithQuestions(surveyId)
      setSurvey(data.survey)
      setQuestions(data.questions.sort((a, b) => a.order - b.order))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load survey')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSurvey = async () => {
    if (!survey) return
    
    try {
      setSaving(true)
      setError(null)
      
      await surveyApi.updateSurvey(survey.id, {
        title: survey.title,
        titleEn: survey.titleEn,
        description: survey.description,
        isPublic: survey.isPublic,
        updatedBy: user?.id || 'anonymous'
      })
      
      setSuccess('Survey saved successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save survey')
    } finally {
      setSaving(false)
    }
  }

  const handlePublishSurvey = async () => {
    if (!survey) return
    
    try {
      setSaving(true)
      setError(null)
      
      await surveyApi.updateSurvey(survey.id, {
        title: survey.title,
        titleEn: survey.titleEn,
        description: survey.description,
        isPublic: true,
        updatedBy: user?.id || 'anonymous'
      })
      
      setSurvey({ ...survey, isPublic: true, status: 'published' })
      setSuccess('Survey published successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish survey')
    } finally {
      setSaving(false)
    }
  }

  const handleAddQuestion = () => {
    setEditingQuestion(null)
    setShowQuestionForm(true)
  }

  const handleEditQuestion = (question: SurveyQuestion) => {
    setEditingQuestion(question)
    setShowQuestionForm(true)
  }

  const handleDeleteQuestion = async (question: SurveyQuestion) => {
    if (!confirm(`Are you sure you want to delete this question?`)) return
    
    try {
      setError(null)
      await surveyApi.deleteQuestion(question.surveyId, question.id, 'current-user-id')
      setQuestions(questions.filter(q => q.id !== question.id))
      setSuccess('Question deleted successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete question')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Survey not found</h2>
          <p className="text-gray-600 mb-4">The survey you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/surveys')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Surveys
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/surveys')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{survey.title}</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  {survey.isPublic ? (
                    <><Globe className="w-4 h-4" /> Published</>
                  ) : (
                    <><Lock className="w-4 h-4" /> Draft</>
                  )}
                  <span>•</span>
                  <span>{questions.length} questions</span>
                  <span>•</span>
                  <span>{survey.responseCount} responses</span>
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSurveySettings(true)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleSaveSurvey}
                disabled={saving}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </button>
              
              {!survey.isPublic && (
                <button
                  onClick={handlePublishSurvey}
                  disabled={saving || questions.length === 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {saving ? 'Publishing...' : 'Publish'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}
      
      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {success}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Question Types */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Questions</h3>
              <div className="space-y-3">
                <QuestionTypeButton
                  type="text"
                  label="Text Input"
                  description="Short text response"
                  onClick={handleAddQuestion}
                />
                <QuestionTypeButton
                  type="radio"
                  label="Multiple Choice"
                  description="Single selection"
                  onClick={handleAddQuestion}
                />
                <QuestionTypeButton
                  type="checkbox"
                  label="Checkboxes"
                  description="Multiple selections"
                  onClick={handleAddQuestion}
                />
                <QuestionTypeButton
                  type="rating"
                  label="Rating Scale"
                  description="1-5 star rating"
                  onClick={handleAddQuestion}
                />
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('builder')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'builder'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Builder
                  </button>
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'preview'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Preview
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'builder' ? (
                  <BuilderTab
                    questions={questions}
                    onEditQuestion={handleEditQuestion}
                    onDeleteQuestion={handleDeleteQuestion}
                    onAddQuestion={handleAddQuestion}
                  />
                ) : (
                  <PreviewTab survey={survey} questions={questions} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Form Modal */}
      {showQuestionForm && (
        <QuestionFormModal
          question={editingQuestion}
          surveyId={survey.id}
          questionCount={questions.length}
          onSave={(question) => {
            if (editingQuestion) {
              setQuestions(questions.map(q => q.id === question.id ? question : q))
            } else {
              setQuestions([...questions, question])
            }
            setShowQuestionForm(false)
            setEditingQuestion(null)
            setSuccess(editingQuestion ? 'Question updated!' : 'Question added!')
            setTimeout(() => setSuccess(null), 3000)
          }}
          onCancel={() => {
            setShowQuestionForm(false)
            setEditingQuestion(null)
          }}
        />
      )}

      {/* Survey Settings Modal */}
      {showSurveySettings && (
        <SurveySettingsModal
          survey={survey}
          onSave={(updatedSurvey) => {
            setSurvey(updatedSurvey)
            setShowSurveySettings(false)
            setSuccess('Survey settings updated!')
            setTimeout(() => setSuccess(null), 3000)
          }}
          onCancel={() => setShowSurveySettings(false)}
        />
      )}
    </div>
  )
}

// Builder Tab Component
interface BuilderTabProps {
  questions: SurveyQuestion[]
  onEditQuestion: (question: SurveyQuestion) => void
  onDeleteQuestion: (question: SurveyQuestion) => void
  onAddQuestion: () => void
}

function BuilderTab({ questions, onEditQuestion, onDeleteQuestion, onAddQuestion }: BuilderTabProps) {
  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Plus className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
        <p className="text-gray-500 mb-6">Add your first question to get started</p>
        <button
          onClick={onAddQuestion}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                {index + 1}
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {question.questionType}
                  </span>
                  {question.isRequired && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Required
                    </span>
                  )}
                </div>

                <h4 className="text-lg font-medium text-gray-900 mb-1">
                  {question.questionText}
                </h4>

                {question.questionTextEn && (
                  <p className="text-sm text-gray-600 mb-2">{question.questionTextEn}</p>
                )}

                {question.choices && question.choices.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-1">Options:</p>
                    <div className="flex flex-wrap gap-1">
                      {question.choices.slice(0, 3).map((choice, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                          {choice}
                        </span>
                      ))}
                      {question.choices.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                          +{question.choices.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEditQuestion(question)}
                className="p-2 text-gray-400 hover:text-blue-600 rounded-md"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteQuestion(question)}
                className="p-2 text-gray-400 hover:text-red-600 rounded-md"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="p-2 text-gray-400 cursor-grab">
                <GripVertical className="w-4 h-4" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      <button
        onClick={onAddQuestion}
        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
      >
        <Plus className="w-5 h-5 mx-auto mb-2" />
        Add Question
      </button>
    </div>
  )
}

// Preview Tab Component
interface PreviewTabProps {
  survey: Survey
  questions: SurveyQuestion[]
}

function PreviewTab({ survey, questions }: PreviewTabProps) {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Survey Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{survey.title}</h1>
        {survey.titleEn && (
          <h2 className="text-xl text-gray-600 mb-4">{survey.titleEn}</h2>
        )}
        {survey.description && (
          <p className="text-gray-600">{survey.description}</p>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={question.id} className="bg-gray-50 rounded-lg p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {index + 1}. {question.questionText}
                {question.isRequired && <span className="text-red-500 ml-1">*</span>}
              </h3>
              {question.questionTextEn && (
                <p className="text-gray-600">{question.questionTextEn}</p>
              )}
            </div>

            {/* Question Input Based on Type */}
            {question.questionType === 'text' && (
              <input
                type="text"
                disabled
                placeholder="Text input"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              />
            )}

            {question.questionType === 'radio' && question.choices && (
              <div className="space-y-2">
                {question.choices.map((choice, idx) => (
                  <label key={idx} className="flex items-center">
                    <input type="radio" name={`question-${question.id}`} disabled className="mr-3" />
                    <span>{choice}</span>
                    {question.choicesEn && question.choicesEn[idx] && (
                      <span className="text-gray-500 ml-2">({question.choicesEn[idx]})</span>
                    )}
                  </label>
                ))}
              </div>
            )}

            {question.questionType === 'checkbox' && question.choices && (
              <div className="space-y-2">
                {question.choices.map((choice, idx) => (
                  <label key={idx} className="flex items-center">
                    <input type="checkbox" disabled className="mr-3" />
                    <span>{choice}</span>
                    {question.choicesEn && question.choicesEn[idx] && (
                      <span className="text-gray-500 ml-2">({question.choicesEn[idx]})</span>
                    )}
                  </label>
                ))}
              </div>
            )}

            {question.questionType === 'rating' && (
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button key={rating} disabled className="text-2xl text-gray-300">
                    ⭐
                  </button>
                ))}
                <span className="text-sm text-gray-500 ml-2">1-5 stars</span>
              </div>
            )}
          </div>
        ))}

        {questions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Eye className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Add questions to see the preview</p>
          </div>
        )}
      </div>

      {/* Submit Button */}
      {questions.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            disabled
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md font-medium opacity-50 cursor-not-allowed"
          >
            Submit Survey
          </button>
        </div>
      )}
    </div>
  )
}
