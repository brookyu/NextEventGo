import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { surveyApi, SurveyQuestion, CreateQuestionRequest, UpdateQuestionRequest } from '../../api/surveys'

interface QuestionFormModalProps {
  question?: SurveyQuestion | null
  surveyId: string
  questionCount: number
  onSave: (question: SurveyQuestion) => void
  onCancel: () => void
}

export default function QuestionFormModal({ 
  question, 
  surveyId, 
  questionCount, 
  onSave, 
  onCancel 
}: QuestionFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [questionText, setQuestionText] = useState('')
  const [questionTextEn, setQuestionTextEn] = useState('')
  const [questionType, setQuestionType] = useState<'text' | 'radio' | 'checkbox' | 'rating'>('text')
  const [choices, setChoices] = useState<string[]>([''])
  const [choicesEn, setChoicesEn] = useState<string[]>([''])
  const [isRequired, setIsRequired] = useState(false)
  const [isProjected, setIsProjected] = useState(false)

  // Initialize form with existing question data
  useEffect(() => {
    if (question) {
      setQuestionText(question.questionText)
      setQuestionTextEn(question.questionTextEn || '')
      setQuestionType(question.questionType)
      setChoices(question.choices || [''])
      setChoicesEn(question.choicesEn || [''])
      setIsRequired(question.isRequired)
      setIsProjected(question.isProjected)
    } else {
      // Reset form for new question
      setQuestionText('')
      setQuestionTextEn('')
      setQuestionType('text')
      setChoices([''])
      setChoicesEn([''])
      setIsRequired(false)
      setIsProjected(false)
    }
  }, [question])

  const handleAddChoice = () => {
    setChoices([...choices, ''])
    setChoicesEn([...choicesEn, ''])
  }

  const handleRemoveChoice = (index: number) => {
    if (choices.length > 1) {
      setChoices(choices.filter((_, i) => i !== index))
      setChoicesEn(choicesEn.filter((_, i) => i !== index))
    }
  }

  const handleChoiceChange = (index: number, value: string) => {
    const newChoices = [...choices]
    newChoices[index] = value
    setChoices(newChoices)
  }

  const handleChoiceEnChange = (index: number, value: string) => {
    const newChoicesEn = [...choicesEn]
    newChoicesEn[index] = value
    setChoicesEn(newChoicesEn)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!questionText.trim()) {
      setError('Question text is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Filter out empty choices
      const filteredChoices = choices.filter(choice => choice.trim() !== '')
      const filteredChoicesEn = choicesEn.filter(choice => choice.trim() !== '')

      if (question) {
        // Update existing question
        const updateData: UpdateQuestionRequest = {
          questionText: questionText.trim(),
          questionTextEn: questionTextEn.trim() || undefined,
          questionType,
          choices: (questionType === 'radio' || questionType === 'checkbox') ? filteredChoices : undefined,
          choicesEn: (questionType === 'radio' || questionType === 'checkbox') && filteredChoicesEn.length > 0 ? filteredChoicesEn : undefined,
          isRequired,
          isProjected,
          updatedBy: '3a008dc7-12fe-8709-73e9-c19537e940cd' // TODO: Get from auth context
        }

        const updatedQuestion = await surveyApi.updateQuestion(surveyId, question.id, updateData)
        onSave(updatedQuestion)
      } else {
        // Create new question
        const createData: CreateQuestionRequest = {
          questionText: questionText.trim(),
          questionTextEn: questionTextEn.trim() || undefined,
          questionType,
          choices: (questionType === 'radio' || questionType === 'checkbox') ? filteredChoices : undefined,
          choicesEn: (questionType === 'radio' || questionType === 'checkbox') && filteredChoicesEn.length > 0 ? filteredChoicesEn : undefined,
          order: questionCount + 1,
          isRequired,
          isProjected,
          createdBy: '3a008dc7-12fe-8709-73e9-c19537e940cd' // TODO: Get from auth context
        }

        const newQuestion = await surveyApi.createQuestion(surveyId, createData)
        onSave(newQuestion)
      }
    } catch (err) {
      console.error('Question creation error:', err)
      if (err instanceof Error) {
        setError(err.message)
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as any
        if (axiosError.response?.data?.error) {
          setError(`Server error: ${axiosError.response.data.error}`)
        } else {
          setError(`Request failed with status ${axiosError.response?.status || 'unknown'}`)
        }
      } else {
        setError('Failed to save question')
      }
    } finally {
      setLoading(false)
    }
  }

  const needsChoices = questionType === 'radio' || questionType === 'checkbox'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {question ? 'Edit Question' : 'Add New Question'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Question Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Type
            </label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="text">Text Input</option>
              <option value="radio">Multiple Choice (Single Selection)</option>
              <option value="checkbox">Checkboxes (Multiple Selection)</option>
              <option value="rating">Rating Scale</option>
            </select>
          </div>

          {/* Question Text */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text (Chinese) *
            </label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              required
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your question in Chinese"
            />
          </div>

          {/* Question Text English */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text (English)
            </label>
            <textarea
              value={questionTextEn}
              onChange={(e) => setQuestionTextEn(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your question in English (optional)"
            />
          </div>

          {/* Choices for radio/checkbox questions */}
          {needsChoices && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Answer Options
              </label>
              <div className="space-y-3">
                {choices.map((choice, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={choice}
                        onChange={(e) => handleChoiceChange(index, e.target.value)}
                        placeholder={`Option ${index + 1} (Chinese)`}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={choicesEn[index] || ''}
                        onChange={(e) => handleChoiceEnChange(index, e.target.value)}
                        placeholder={`Option ${index + 1} (English)`}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    {choices.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveChoice(index)}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddChoice}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Option
                </button>
              </div>
            </div>
          )}

          {/* Question Settings */}
          <div className="mb-6 space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Required question</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isProjected}
                onChange={(e) => setIsProjected(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Show in live display</span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : question ? 'Update Question' : 'Add Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
