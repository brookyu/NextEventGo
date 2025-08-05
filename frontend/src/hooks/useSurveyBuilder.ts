import { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { Survey, SurveyQuestion, QuestionType } from '../types/survey';
import { surveyApi } from '../services/api/surveyApi';
import { useAuthStore } from '../store/authStore';

interface UseSurveyBuilderReturn {
  survey: Survey;
  questions: SurveyQuestion[];
  loading: boolean;
  error: string | null;
  isDirty: boolean;
  updateSurvey: (updates: Partial<Survey>) => void;
  addQuestion: (question: Partial<SurveyQuestion>) => Promise<string>;
  updateQuestion: (questionId: string, updates: Partial<SurveyQuestion>) => Promise<void>;
  deleteQuestion: (questionId: string) => Promise<void>;
  reorderQuestions: (dragIndex: number, hoverIndex: number) => Promise<void>;
  saveSurvey: () => Promise<Survey>;
  publishSurvey: () => Promise<Survey>;
  loadSurvey: () => Promise<void>;
  resetSurvey: () => void;
}

const createEmptySurvey = (): Survey => ({
  id: '',
  title: '',
  description: '',
  status: 'draft',
  isPublic: false,
  createdAt: new Date(),
  updatedAt: new Date()
});

export const useSurveyBuilder = (surveyId?: string): UseSurveyBuilderReturn => {
  const { user } = useAuthStore();
  const [survey, setSurvey] = useState<Survey>(createEmptySurvey);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  
  // Keep track of original state for dirty checking
  const originalSurveyRef = useRef<Survey>(createEmptySurvey());
  const originalQuestionsRef = useRef<SurveyQuestion[]>([]);

  // Auto-save functionality
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const [autoSaveEnabled] = useState(true);

  // Mark as dirty when changes are made
  const markDirty = useCallback(() => {
    setIsDirty(true);
    setError(null);

    // Auto-save after 2 seconds of inactivity
    if (autoSaveEnabled && surveyId) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveSurvey().catch(console.error);
      }, 2000);
    }
  }, [autoSaveEnabled, surveyId]);

  // Update survey properties
  const updateSurvey = useCallback((updates: Partial<Survey>) => {
    setSurvey(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date()
    }));
    markDirty();
  }, [markDirty]);

  // Add a new question
  const addQuestion = useCallback(async (questionData: Partial<SurveyQuestion>): Promise<string> => {
    try {
      if (!survey.id) {
        // If survey doesn't exist yet, add locally and save later
        const questionId = uuidv4();
        const newQuestion: SurveyQuestion = {
          id: questionId,
          surveyId: survey.id || '',
          questionType: questionData.questionType || 'text',
          questionText: questionData.questionText || '',
          description: questionData.description,
          isRequired: questionData.isRequired || false,
          order: questionData.order || questions.length + 1,
          options: questionData.options,
          validation: questionData.validation,
          placeholder: questionData.placeholder,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        setQuestions(prev => [...prev, newQuestion]);
        markDirty();
        return questionId;
      }

      // Create question via API
      const createdQuestion = await surveyApi.createQuestion(survey.id, {
        questionText: questionData.questionText || '',
        questionTextEn: questionData.questionTextEn,
        questionType: questionData.questionType || 'text',
        options: questionData.options,
        optionsEn: questionData.optionsEn,
        order: questionData.order || questions.length + 1,
        isRequired: questionData.isRequired || false,
        isProjected: questionData.isProjected || false,
        createdBy: user?.id || 'anonymous'
      });

      setQuestions(prev => [...prev, createdQuestion]);
      markDirty();
      return createdQuestion.id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add question';
      setError(errorMessage);
      throw err;
    }
  }, [survey.id, questions.length, markDirty]);

  // Update an existing question
  const updateQuestion = useCallback(async (questionId: string, updates: Partial<SurveyQuestion>): Promise<void> => {
    try {
      if (!survey.id) {
        // If survey doesn't exist yet, update locally
        setQuestions(prev => prev.map(q =>
          q.id === questionId
            ? { ...q, ...updates, updatedAt: new Date() }
            : q
        ));
        markDirty();
        return;
      }

      // Update question via API
      const updatedQuestion = await surveyApi.updateQuestion(survey.id, questionId, {
        questionText: updates.questionText,
        questionTextEn: updates.questionTextEn,
        questionType: updates.questionType,
        options: updates.options,
        optionsEn: updates.optionsEn,
        order: updates.order,
        isRequired: updates.isRequired,
        isProjected: updates.isProjected,
        updatedBy: user?.id || 'anonymous'
      });

      setQuestions(prev => prev.map(q =>
        q.id === questionId ? updatedQuestion : q
      ));
      markDirty();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update question';
      setError(errorMessage);
      throw err;
    }
  }, [survey.id, markDirty]);

  // Delete a question
  const deleteQuestion = useCallback(async (questionId: string): Promise<void> => {
    try {
      if (!survey.id) {
        // If survey doesn't exist yet, delete locally
        setQuestions(prev => {
          const filtered = prev.filter(q => q.id !== questionId);
          // Reorder remaining questions
          return filtered.map((q, index) => ({
            ...q,
            order: index + 1,
            updatedAt: new Date()
          }));
        });
        markDirty();
        return;
      }

      // Delete question via API
      await surveyApi.deleteQuestion(survey.id, questionId, user?.id || 'anonymous');

      setQuestions(prev => {
        const filtered = prev.filter(q => q.id !== questionId);
        // Reorder remaining questions
        return filtered.map((q, index) => ({
          ...q,
          order: index + 1,
          updatedAt: new Date()
        }));
      });
      markDirty();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete question';
      setError(errorMessage);
      throw err;
    }
  }, [survey.id, markDirty]);

  // Reorder questions (for drag and drop)
  const reorderQuestions = useCallback(async (dragIndex: number, hoverIndex: number): Promise<void> => {
    try {
      setQuestions(prev => {
        const draggedQuestion = prev[dragIndex];
        const newQuestions = [...prev];

        // Remove dragged question
        newQuestions.splice(dragIndex, 1);

        // Insert at new position
        newQuestions.splice(hoverIndex, 0, draggedQuestion);

        // Update order numbers
        return newQuestions.map((q, index) => ({
          ...q,
          order: index + 1,
          updatedAt: new Date()
        }));
      });

      // If survey exists, update order via API
      if (survey.id) {
        const questionOrders = questions.map((q, index) => ({
          questionId: q.id,
          orderNumber: index + 1
        }));

        await surveyApi.reorderQuestions(
          survey.id,
          questionOrders,
          user?.id || 'anonymous'
        );
      }

      markDirty();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reorder questions';
      setError(errorMessage);
      throw err;
    }
  }, [survey.id, questions, markDirty]);

  // Save survey
  const saveSurvey = useCallback(async (): Promise<Survey> => {
    try {
      setLoading(true);
      setError(null);

      let savedSurvey: Survey;

      if (surveyId && survey.id) {
        // Update existing survey
        savedSurvey = await surveyApi.updateSurvey(surveyId, {
          title: survey.title,
          titleEn: survey.titleEn,
          description: survey.description,
          isPublic: survey.isPublic,
          updatedBy: user?.id || 'anonymous'
        });
      } else {
        // Create new survey
        savedSurvey = await surveyApi.createSurvey({
          title: survey.title,
          titleEn: survey.titleEn,
          description: survey.description,
          isPublic: survey.isPublic,
          formType: survey.formType || 0,
          categoryId: survey.categoryId || '00000000-0000-0000-0000-000000000000',
          isLuckEnabled: survey.isLuckEnabled || false,
          createdBy: user?.id || 'anonymous'
        });
      }

      setSurvey(savedSurvey);
      setIsDirty(false);

      // Update original refs for dirty checking
      originalSurveyRef.current = { ...savedSurvey };
      originalQuestionsRef.current = [...questions];

      return savedSurvey;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save survey';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [survey, questions, surveyId]);

  // Publish survey
  const publishSurvey = useCallback(async (): Promise<Survey> => {
    try {
      setLoading(true);
      setError(null);

      // Validate survey before publishing
      if (!survey.title?.trim()) {
        throw new Error('Survey title is required');
      }

      if (questions.length === 0) {
        throw new Error('Survey must have at least one question');
      }

      // Check for questions without text
      const invalidQuestions = questions.filter(q => !q.questionText?.trim());
      if (invalidQuestions.length > 0) {
        throw new Error('All questions must have text');
      }

      // Save first if dirty
      let surveyToPublish = survey;
      if (isDirty) {
        surveyToPublish = await saveSurvey();
      }

      // Publish the survey by updating isPublic to true
      const publishedSurvey = await surveyApi.updateSurvey(surveyToPublish.id!, {
        title: surveyToPublish.title,
        titleEn: surveyToPublish.titleEn,
        description: surveyToPublish.description,
        isPublic: true,
        updatedBy: user?.id || 'anonymous'
      });

      setSurvey(publishedSurvey);
      setIsDirty(false);

      return publishedSurvey;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to publish survey';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [survey, questions, isDirty, saveSurvey]);

  // Load existing survey
  const loadSurvey = useCallback(async (): Promise<void> => {
    if (!surveyId) return;

    try {
      setLoading(true);
      setError(null);

      const loadedSurvey = await surveyApi.getSurvey(surveyId);
      const loadedQuestions = await surveyApi.getSurveyQuestions(surveyId);

      setSurvey(loadedSurvey);
      setQuestions(loadedQuestions.sort((a, b) => (a.order || 0) - (b.order || 0)));
      setIsDirty(false);

      // Update original refs
      originalSurveyRef.current = { ...loadedSurvey };
      originalQuestionsRef.current = [...loadedQuestions];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load survey';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  // Reset survey to empty state
  const resetSurvey = useCallback(() => {
    const emptySurvey = createEmptySurvey();
    setSurvey(emptySurvey);
    setQuestions([]);
    setIsDirty(false);
    setError(null);
    
    originalSurveyRef.current = { ...emptySurvey };
    originalQuestionsRef.current = [];
  }, []);

  // Cleanup auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        if (isDirty) {
          saveSurvey().catch(console.error);
        }
      }

      // Ctrl/Cmd + Shift + P to publish
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        if (questions.length > 0) {
          publishSurvey().catch(console.error);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDirty, questions.length, saveSurvey, publishSurvey]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return event.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  return {
    survey,
    questions,
    loading,
    error,
    isDirty,
    updateSurvey,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    saveSurvey,
    publishSurvey,
    loadSurvey,
    resetSurvey
  };
};
