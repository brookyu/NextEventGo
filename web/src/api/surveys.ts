import { apiClient } from './client';

// Set test JWT token for testing
apiClient.defaults.headers.common['Authorization'] = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMjUzODQ4YTQtMDUwMi00ZTMyLTkyNTEtYzI2ZWIxZjYzZDhhIiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlzcyI6Im5leHRldmVudCIsInN1YiI6IjI1Mzg0OGE0LTA1MDItNGUzMi05MjUxLWMyNmViMWY2M2Q4YSIsImV4cCI6MTc1NDQ0MTEyNywibmJmIjoxNzU0MzU0NzI3LCJpYXQiOjE3NTQzNTQ3Mjd9.24hy3VmZDGmhFHsEGvlQ8vB_FbJ4zgpsaNyqSYhbnDE';

// Backend DTO interfaces to match Go backend
interface BackendSurveyResponse {
  id: string;
  surveyTitle: string;
  surveyTitleEn?: string;
  surveySummary?: string;
  formType: number;
  isOpen: boolean;
  categoryId: string;
  promotionCode?: string;
  isLuckEnabled: boolean;
  creationTime: string;
  creatorId?: string;
  lastModificationTime?: string;
  lastModifierId?: string;
  isDeleted: boolean;
  questionCount: number;
  responseCount: number;
  completionRate: number;
}

interface BackendQuestionResponse {
  id: string;
  surveyId: string;
  questionTitle: string;
  questionTitleEn?: string;
  questionType: number;
  choices?: string;
  choicesEn?: string;
  orderNumber: number;
  isProjected: boolean;
  answers?: string;
  isChoiceCountFixed?: boolean;
  choiceCount?: number;
  creationTime: string;
  creatorId?: string;
  lastModificationTime?: string;
  lastModifierId?: string;
  isDeleted: boolean;
  responseCount: number;
  skipCount: number;
}

// Frontend interfaces
export interface Survey {
  id: string;
  title: string;
  titleEn?: string;
  description?: string;
  status: 'draft' | 'published' | 'closed';
  isPublic: boolean;
  formType: number;
  categoryId: string;
  promotionCode?: string;
  isLuckEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  questionCount: number;
  responseCount: number;
  completionRate: number;
}

export interface SurveyQuestion {
  id: string;
  surveyId: string;
  questionText: string;
  questionTextEn?: string;
  questionType: 'text' | 'radio' | 'checkbox' | 'rating';
  choices?: string[];
  choicesEn?: string[];
  order: number;
  isRequired: boolean;
  isProjected: boolean;
  createdAt: Date;
  updatedAt: Date;
  responseCount: number;
}

export interface CreateSurveyRequest {
  title: string;
  titleEn?: string;
  description?: string;
  isPublic: boolean;
  formType?: number;
  categoryId?: string;
  promotionCode?: string;
  isLuckEnabled?: boolean;
  createdBy: string;
}

export interface UpdateSurveyRequest {
  title?: string;
  titleEn?: string;
  description?: string;
  isPublic?: boolean;
  updatedBy: string;
}

export interface CreateQuestionRequest {
  questionText: string;
  questionTextEn?: string;
  questionType: 'text' | 'radio' | 'checkbox' | 'rating';
  choices?: string[];
  choicesEn?: string[];
  order: number;
  isRequired?: boolean;
  isProjected?: boolean;
  createdBy: string;
}

export interface UpdateQuestionRequest {
  questionText?: string;
  questionTextEn?: string;
  questionType?: 'text' | 'radio' | 'checkbox' | 'rating';
  choices?: string[];
  choicesEn?: string[];
  order?: number;
  isRequired?: boolean;
  isProjected?: boolean;
  updatedBy: string;
}

export interface CreateQuestionRequest {
  questionText: string;
  questionTextEn?: string;
  questionType: 'text' | 'radio' | 'checkbox' | 'rating';
  choices?: string[];
  choicesEn?: string[];
  order: number;
  isRequired?: boolean;
  isProjected?: boolean;
  createdBy: string;
}

export interface UpdateQuestionRequest {
  questionText?: string;
  questionTextEn?: string;
  questionType?: 'text' | 'radio' | 'checkbox' | 'rating';
  choices?: string[];
  choicesEn?: string[];
  order?: number;
  isRequired?: boolean;
  isProjected?: boolean;
  updatedBy: string;
}

// Helper functions to convert between frontend and backend formats
const mapBackendSurveyToFrontend = (backendSurvey: BackendSurveyResponse): Survey => ({
  id: backendSurvey.id,
  title: backendSurvey.surveyTitle,
  titleEn: backendSurvey.surveyTitleEn,
  description: backendSurvey.surveySummary,
  status: backendSurvey.isOpen ? 'published' : 'draft',
  isPublic: backendSurvey.isOpen,
  formType: backendSurvey.formType,
  categoryId: backendSurvey.categoryId,
  promotionCode: backendSurvey.promotionCode,
  isLuckEnabled: backendSurvey.isLuckEnabled,
  createdAt: new Date(backendSurvey.creationTime),
  updatedAt: backendSurvey.lastModificationTime ? new Date(backendSurvey.lastModificationTime) : new Date(backendSurvey.creationTime),
  createdBy: backendSurvey.creatorId,
  questionCount: backendSurvey.questionCount,
  responseCount: backendSurvey.responseCount,
  completionRate: backendSurvey.completionRate
});

const mapBackendQuestionToFrontend = (backendQuestion: BackendQuestionResponse): SurveyQuestion => {
  const questionTypeMap: { [key: number]: 'text' | 'radio' | 'checkbox' | 'rating' } = {
    1: 'text',
    2: 'radio',
    3: 'checkbox',
    4: 'rating'
  };

  const parseChoices = (choices?: string): string[] => {
    if (!choices) return [];
    return choices.split('||').filter(choice => choice.trim() !== '');
  };

  return {
    id: backendQuestion.id,
    surveyId: backendQuestion.surveyId,
    questionText: backendQuestion.questionTitle,
    questionTextEn: backendQuestion.questionTitleEn,
    questionType: questionTypeMap[backendQuestion.questionType] || 'text',
    choices: parseChoices(backendQuestion.choices),
    choicesEn: parseChoices(backendQuestion.choicesEn),
    order: backendQuestion.orderNumber,
    isRequired: false, // Default, can be enhanced later
    isProjected: backendQuestion.isProjected,
    createdAt: new Date(backendQuestion.creationTime),
    updatedAt: backendQuestion.lastModificationTime ? new Date(backendQuestion.lastModificationTime) : new Date(backendQuestion.creationTime),
    responseCount: backendQuestion.responseCount
  };
};

// API functions
export const surveyApi = {
  // Get surveys with pagination
  async getSurveys(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    formType?: number;
    isOpen?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        data: BackendSurveyResponse[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
      error?: string;
    }>('/surveys/', { params });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get surveys');
    }

    const backendData = response.data.data;
    return {
      data: backendData.data.map(mapBackendSurveyToFrontend),
      total: backendData.total,
      page: backendData.page,
      limit: backendData.limit,
      totalPages: backendData.totalPages
    };
  },

  // Get single survey
  async getSurvey(surveyId: string): Promise<Survey> {
    const response = await apiClient.get<{
      success: boolean;
      data: BackendSurveyResponse;
      error?: string;
    }>(`/surveys/${surveyId}`);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get survey');
    }

    return mapBackendSurveyToFrontend(response.data.data);
  },

  // Get survey with questions
  async getSurveyWithQuestions(surveyId: string) {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        survey: BackendSurveyResponse;
        questions: BackendQuestionResponse[];
      };
      error?: string;
    }>(`/surveys/${surveyId}/questions`);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get survey with questions');
    }

    return {
      survey: mapBackendSurveyToFrontend(response.data.data.survey),
      questions: response.data.data.questions.map(mapBackendQuestionToFrontend)
    };
  },

  // Create survey
  async createSurvey(surveyData: CreateSurveyRequest): Promise<Survey> {
    const backendRequest = {
      surveyTitle: surveyData.title,
      surveyTitleEn: surveyData.titleEn,
      surveySummary: surveyData.description,
      formType: surveyData.formType || 0,
      isOpen: surveyData.isPublic,
      categoryId: surveyData.categoryId || '00000000-0000-0000-0000-000000000000',
      promotionCode: surveyData.promotionCode,
      isLuckEnabled: surveyData.isLuckEnabled || false,
      creatorId: surveyData.createdBy
    };

    const response = await apiClient.post<{
      success: boolean;
      data: BackendSurveyResponse;
      error?: string;
    }>('/surveys/', backendRequest);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to create survey');
    }

    return mapBackendSurveyToFrontend(response.data.data);
  },

  // Update survey
  async updateSurvey(surveyId: string, updates: UpdateSurveyRequest): Promise<Survey> {
    const backendRequest = {
      surveyTitle: updates.title,
      surveyTitleEn: updates.titleEn,
      surveySummary: updates.description,
      isOpen: updates.isPublic,
      lastModifierId: updates.updatedBy
    };

    const response = await apiClient.put<{
      success: boolean;
      data: BackendSurveyResponse;
      error?: string;
    }>(`/surveys/${surveyId}`, backendRequest);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to update survey');
    }

    return mapBackendSurveyToFrontend(response.data.data);
  },

  // Delete survey
  async deleteSurvey(surveyId: string, deleterId: string): Promise<void> {
    const response = await apiClient.delete<{
      success: boolean;
      error?: string;
    }>(`/surveys/${surveyId}`, {
      data: { deleterId }
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete survey');
    }
  },

  // Question Management Functions

  // Create question
  async createQuestion(surveyId: string, questionData: CreateQuestionRequest): Promise<SurveyQuestion> {
    const questionTypeMap: { [key: string]: number } = {
      'text': 1,
      'radio': 2,
      'checkbox': 3,
      'rating': 4
    };

    const formatChoices = (choices?: string[]): string | undefined => {
      if (!choices || choices.length === 0) return undefined;
      return '||' + choices.join('||') + '||';
    };

    const backendRequest = {
      questionTitle: questionData.questionText,
      questionTitleEn: questionData.questionTextEn,
      questionType: questionTypeMap[questionData.questionType] || 1,
      choices: formatChoices(questionData.choices),
      choicesEn: formatChoices(questionData.choicesEn),
      orderNumber: questionData.order,
      isProjected: questionData.isProjected || false,
      creatorId: questionData.createdBy
    };

    const response = await apiClient.post<{
      success: boolean;
      data: BackendQuestionResponse;
      error?: string;
    }>(`/surveys/${surveyId}/questions`, backendRequest);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to create question');
    }

    return mapBackendQuestionToFrontend(response.data.data);
  },

  // Update question
  async updateQuestion(surveyId: string, questionId: string, updates: UpdateQuestionRequest): Promise<SurveyQuestion> {
    const questionTypeMap: { [key: string]: number } = {
      'text': 1,
      'radio': 2,
      'checkbox': 3,
      'rating': 4
    };

    const formatChoices = (choices?: string[]): string | undefined => {
      if (!choices || choices.length === 0) return undefined;
      return '||' + choices.join('||') + '||';
    };

    const backendRequest = {
      questionTitle: updates.questionText,
      questionTitleEn: updates.questionTextEn,
      questionType: updates.questionType ? questionTypeMap[updates.questionType] : undefined,
      choices: formatChoices(updates.choices),
      choicesEn: formatChoices(updates.choicesEn),
      orderNumber: updates.order,
      isProjected: updates.isProjected,
      lastModifierId: updates.updatedBy
    };

    const response = await apiClient.put<{
      success: boolean;
      data: BackendQuestionResponse;
      error?: string;
    }>(`/questions/${questionId}`, backendRequest);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to update question');
    }

    return mapBackendQuestionToFrontend(response.data.data);
  },

  // Delete question
  async deleteQuestion(surveyId: string, questionId: string, deleterId: string): Promise<void> {
    const response = await apiClient.delete<{
      success: boolean;
      error?: string;
    }>(`/questions/${questionId}`, {
      data: { deleterId }
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete question');
    }
  },

  // Get single question
  async getQuestion(questionId: string): Promise<SurveyQuestion> {
    const response = await apiClient.get<{
      success: boolean;
      data: BackendQuestionResponse;
      error?: string;
    }>(`/questions/${questionId}`);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get question');
    }

    return mapBackendQuestionToFrontend(response.data.data);
  },

  // Reorder questions
  async reorderQuestions(surveyId: string, questionOrders: Array<{questionId: string, orderNumber: number}>, lastModifierId: string): Promise<SurveyQuestion[]> {
    const response = await apiClient.post<{
      success: boolean;
      data: {
        survey: BackendSurveyResponse;
        questions: BackendQuestionResponse[];
      };
      error?: string;
    }>(`/surveys/${surveyId}/questions/reorder`, {
      questionOrders,
      lastModifierId
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to reorder questions');
    }

    return response.data.data.questions.map(mapBackendQuestionToFrontend);
  }
};

export default surveyApi;
