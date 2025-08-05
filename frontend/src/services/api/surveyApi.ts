import {
  Survey,
  SurveyQuestion,
  SurveyResponse,
  SurveyAnswer,
  SurveyAnalytics,
  SurveyListItem,
  CreateSurveyRequest,
  UpdateSurveyRequest,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  StartResponseRequest,
  SubmitAnswerRequest,
  CompleteResponseRequest,
  ApiResponse,
  PaginatedResponse
} from '../../types/survey';

import { apiClient } from './apiClient';

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

interface BackendCreateSurveyRequest {
  surveyTitle: string;
  surveyTitleEn?: string;
  surveySummary?: string;
  formType: number;
  isOpen: boolean;
  categoryId: string;
  promotionCode?: string;
  isLuckEnabled: boolean;
  creatorId: string;
}

interface BackendCreateQuestionRequest {
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
  creatorId: string;
}

class SurveyApiService {
  private baseUrl = '/api/v1/surveys';

  // Helper methods to convert between frontend and backend formats
  private mapBackendSurveyToFrontend(backendSurvey: BackendSurveyResponse): Survey {
    return {
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
    };
  }

  private mapBackendQuestionToFrontend(backendQuestion: BackendQuestionResponse): SurveyQuestion {
    // Convert backend question type (number) to frontend question type (string)
    const questionTypeMap: { [key: number]: string } = {
      0: 'text',
      1: 'radio',
      2: 'checkbox',
      3: 'rating'
    };

    // Parse choices from pipe-separated format
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
      order: backendQuestion.orderNumber,
      isRequired: false, // Default, can be enhanced later
      isProjected: backendQuestion.isProjected,
      options: parseChoices(backendQuestion.choices),
      optionsEn: parseChoices(backendQuestion.choicesEn),
      createdAt: new Date(backendQuestion.creationTime),
      updatedAt: backendQuestion.lastModificationTime ? new Date(backendQuestion.lastModificationTime) : new Date(backendQuestion.creationTime),
      responseCount: backendQuestion.responseCount
    };
  }

  private mapFrontendSurveyToBackend(survey: CreateSurveyRequest): BackendCreateSurveyRequest {
    return {
      surveyTitle: survey.title,
      surveyTitleEn: survey.titleEn,
      surveySummary: survey.description,
      formType: survey.formType || 0,
      isOpen: survey.isPublic || false,
      categoryId: survey.categoryId || '00000000-0000-0000-0000-000000000000',
      promotionCode: survey.promotionCode,
      isLuckEnabled: survey.isLuckEnabled || false,
      creatorId: survey.createdBy || ''
    };
  }

  private mapFrontendQuestionToBackend(question: CreateQuestionRequest): BackendCreateQuestionRequest {
    // Convert frontend question type (string) to backend question type (number)
    const questionTypeMap: { [key: string]: number } = {
      'text': 0,
      'radio': 1,
      'checkbox': 2,
      'rating': 3
    };

    // Convert choices to pipe-separated format
    const formatChoices = (choices?: string[]): string | undefined => {
      if (!choices || choices.length === 0) return undefined;
      return '||' + choices.join('||') + '||';
    };

    return {
      questionTitle: question.questionText,
      questionTitleEn: question.questionTextEn,
      questionType: questionTypeMap[question.questionType] || 0,
      choices: formatChoices(question.options),
      choicesEn: formatChoices(question.optionsEn),
      orderNumber: question.order || 1,
      isProjected: question.isProjected || false,
      creatorId: question.createdBy || ''
    };
  }

  // Survey CRUD Operations

  async createSurvey(surveyData: CreateSurveyRequest): Promise<Survey> {
    const backendRequest = this.mapFrontendSurveyToBackend(surveyData);
    const response = await apiClient.post<ApiResponse<BackendSurveyResponse>>(this.baseUrl, backendRequest);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to create survey');
    }
    return this.mapBackendSurveyToFrontend(response.data.data);
  }

  async getSurvey(surveyId: string): Promise<Survey> {
    const response = await apiClient.get<ApiResponse<BackendSurveyResponse>>(`${this.baseUrl}/${surveyId}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get survey');
    }
    return this.mapBackendSurveyToFrontend(response.data.data);
  }

  async updateSurvey(surveyId: string, updates: UpdateSurveyRequest): Promise<Survey> {
    const backendRequest = {
      surveyTitle: updates.title,
      surveyTitleEn: updates.titleEn,
      surveySummary: updates.description,
      isOpen: updates.isPublic,
      lastModifierId: updates.updatedBy || ''
    };
    const response = await apiClient.put<ApiResponse<BackendSurveyResponse>>(`${this.baseUrl}/${surveyId}`, backendRequest);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to update survey');
    }
    return this.mapBackendSurveyToFrontend(response.data.data);
  }

  async deleteSurvey(surveyId: string, deleterId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/${surveyId}`, {
      data: { deleterId }
    });
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete survey');
    }
  }

  async getSurveys(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    formType?: number;
    isOpen?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<SurveyListItem>> {
    const response = await apiClient.get<ApiResponse<{
      data: BackendSurveyResponse[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>>(this.baseUrl, { params });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get surveys');
    }

    const backendData = response.data.data;
    return {
      data: backendData.data.map(survey => ({
        id: survey.id,
        title: survey.surveyTitle,
        titleEn: survey.surveyTitleEn,
        description: survey.surveySummary,
        status: survey.isOpen ? 'published' : 'draft',
        isPublic: survey.isOpen,
        createdAt: new Date(survey.creationTime),
        updatedAt: survey.lastModificationTime ? new Date(survey.lastModificationTime) : new Date(survey.creationTime),
        questionCount: survey.questionCount,
        responseCount: survey.responseCount,
        completionRate: survey.completionRate
      })),
      total: backendData.total,
      page: backendData.page,
      limit: backendData.limit,
      totalPages: backendData.totalPages
    };
  }

  // Survey Status Operations

  async publishSurvey(surveyId: string): Promise<Survey> {
    const response = await apiClient.post<ApiResponse<Survey>>(`${this.baseUrl}/${surveyId}/publish`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to publish survey');
    }
    return response.data.data;
  }

  async closeSurvey(surveyId: string): Promise<Survey> {
    const response = await apiClient.post<ApiResponse<Survey>>(`${this.baseUrl}/${surveyId}/close`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to close survey');
    }
    return response.data.data;
  }

  async archiveSurvey(surveyId: string): Promise<Survey> {
    const response = await apiClient.post<ApiResponse<Survey>>(`${this.baseUrl}/${surveyId}/archive`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to archive survey');
    }
    return response.data.data;
  }

  // Question Operations

  async getSurveyQuestions(surveyId: string): Promise<SurveyQuestion[]> {
    const response = await apiClient.get<ApiResponse<{
      survey: BackendSurveyResponse;
      questions: BackendQuestionResponse[];
    }>>(`${this.baseUrl}/${surveyId}/questions`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get survey questions');
    }
    return response.data.data.questions.map(q => this.mapBackendQuestionToFrontend(q));
  }

  async createQuestion(surveyId: string, questionData: CreateQuestionRequest): Promise<SurveyQuestion> {
    const backendRequest = this.mapFrontendQuestionToBackend(questionData);
    const response = await apiClient.post<ApiResponse<BackendQuestionResponse>>(
      `${this.baseUrl}/${surveyId}/questions`,
      backendRequest
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to create question');
    }
    return this.mapBackendQuestionToFrontend(response.data.data);
  }

  async updateQuestion(surveyId: string, questionId: string, updates: UpdateQuestionRequest): Promise<SurveyQuestion> {
    const backendRequest = {
      questionTitle: updates.questionText,
      questionTitleEn: updates.questionTextEn,
      questionType: updates.questionType ? ({'text': 0, 'radio': 1, 'checkbox': 2, 'rating': 3}[updates.questionType] || 0) : undefined,
      choices: updates.options ? '||' + updates.options.join('||') + '||' : undefined,
      choicesEn: updates.optionsEn ? '||' + updates.optionsEn.join('||') + '||' : undefined,
      orderNumber: updates.order,
      isProjected: updates.isProjected,
      lastModifierId: updates.updatedBy || ''
    };
    const response = await apiClient.put<ApiResponse<BackendQuestionResponse>>(
      `/api/v1/questions/${questionId}`,
      backendRequest
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to update question');
    }
    return this.mapBackendQuestionToFrontend(response.data.data);
  }

  async deleteQuestion(surveyId: string, questionId: string, deleterId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/api/v1/questions/${questionId}`,
      { data: { deleterId } }
    );
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete question');
    }
  }

  async reorderQuestions(surveyId: string, questionOrders: Array<{questionId: string, orderNumber: number}>, lastModifierId: string): Promise<SurveyQuestion[]> {
    const response = await apiClient.post<ApiResponse<{
      survey: BackendSurveyResponse;
      questions: BackendQuestionResponse[];
    }>>(
      `${this.baseUrl}/${surveyId}/questions/reorder`,
      {
        questionOrders: questionOrders.map(q => ({ questionId: q.questionId, orderNumber: q.orderNumber })),
        lastModifierId
      }
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to reorder questions');
    }
    return response.data.data.questions.map(q => this.mapBackendQuestionToFrontend(q));
  }

  // Response Operations

  async startResponse(requestData: StartResponseRequest): Promise<SurveyResponse> {
    const response = await apiClient.post<ApiResponse<SurveyResponse>>(
      `${this.baseUrl}/${requestData.surveyId}/responses`,
      requestData
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to start response');
    }
    return response.data.data;
  }

  async getResponse(surveyId: string, responseId: string): Promise<SurveyResponse> {
    const response = await apiClient.get<ApiResponse<SurveyResponse>>(
      `${this.baseUrl}/${surveyId}/responses/${responseId}`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get response');
    }
    return response.data.data;
  }

  async submitAnswer(surveyId: string, responseId: string, answerData: SubmitAnswerRequest): Promise<SurveyAnswer> {
    const response = await apiClient.post<ApiResponse<SurveyAnswer>>(
      `${this.baseUrl}/${surveyId}/responses/${responseId}/answers`,
      answerData
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to submit answer');
    }
    return response.data.data;
  }

  async completeResponse(surveyId: string, responseId: string, data?: CompleteResponseRequest): Promise<SurveyResponse> {
    const response = await apiClient.post<ApiResponse<SurveyResponse>>(
      `${this.baseUrl}/${surveyId}/responses/${responseId}/complete`,
      data
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to complete response');
    }
    return response.data.data;
  }

  async submitResponse(surveyId: string, responseId: string): Promise<SurveyResponse> {
    const response = await apiClient.post<ApiResponse<SurveyResponse>>(
      `${this.baseUrl}/${surveyId}/responses/${responseId}/submit`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to submit response');
    }
    return response.data.data;
  }

  // Analytics Operations

  async getSurveyAnalytics(surveyId: string): Promise<SurveyAnalytics> {
    const response = await apiClient.get<ApiResponse<SurveyAnalytics>>(
      `${this.baseUrl}/${surveyId}/analytics`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get survey analytics');
    }
    return response.data.data;
  }

  async exportSurveyData(surveyId: string, format: 'csv' | 'json' | 'pdf' = 'csv'): Promise<Blob> {
    const response = await apiClient.get(
      `${this.baseUrl}/${surveyId}/export`,
      { 
        params: { format },
        responseType: 'blob'
      }
    );
    return response.data;
  }

  // Public Survey Operations (no authentication required)

  async getPublicSurvey(surveyId: string): Promise<Survey> {
    const response = await apiClient.get<ApiResponse<Survey>>(`/api/v1/public/surveys/${surveyId}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get public survey');
    }
    return response.data.data;
  }

  async startPublicResponse(surveyId: string, sessionId?: string): Promise<SurveyResponse> {
    const response = await apiClient.post<ApiResponse<SurveyResponse>>(
      `/api/v1/public/surveys/${surveyId}/responses`,
      { sessionId }
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to start public response');
    }
    return response.data.data;
  }

  async submitPublicAnswer(sessionId: string, answerData: SubmitAnswerRequest): Promise<SurveyAnswer> {
    const response = await apiClient.post<ApiResponse<SurveyAnswer>>(
      `/api/v1/public/responses/session/${sessionId}/answers`,
      answerData
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to submit public answer');
    }
    return response.data.data;
  }

  // Live Results Operations

  async getLiveResults(surveyId: string): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(`/api/v1/live-results/surveys/${surveyId}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get live results');
    }
    return response.data.data;
  }

  async refreshLiveResults(surveyId: string): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(`/api/v1/live-results/surveys/${surveyId}/refresh`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to refresh live results');
    }
    return response.data.data;
  }

  async getLiveChartData(surveyId: string, chartType?: string): Promise<any> {
    const params = chartType ? { type: chartType } : {};
    const response = await apiClient.get<ApiResponse<any>>(
      `/api/v1/live-results/surveys/${surveyId}/charts`,
      { params }
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get live chart data');
    }
    return response.data.data;
  }

  async getLiveTrendData(surveyId: string, timeRange?: string): Promise<any> {
    const params = timeRange ? { range: timeRange } : {};
    const response = await apiClient.get<ApiResponse<any>>(
      `/api/v1/live-results/surveys/${surveyId}/trends`,
      { params }
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get live trend data');
    }
    return response.data.data;
  }

  // WebSocket Connection for Real-time Updates

  connectToRealTimeUpdates(surveyId: string): WebSocket | null {
    if (typeof window === 'undefined' || !window.WebSocket) {
      return null;
    }

    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/surveys/${surveyId}/analytics`;
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('Connected to real-time survey updates');
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      ws.onclose = () => {
        console.log('Disconnected from real-time survey updates');
      };
      
      return ws;
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      return null;
    }
  }

  // Utility Methods

  async duplicateSurvey(surveyId: string, newTitle?: string): Promise<Survey> {
    const response = await apiClient.post<ApiResponse<Survey>>(
      `${this.baseUrl}/${surveyId}/duplicate`,
      { title: newTitle }
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to duplicate survey');
    }
    return response.data.data;
  }

  async getSurveyPreview(surveyId: string): Promise<{ survey: Survey; questions: SurveyQuestion[] }> {
    const response = await apiClient.get<ApiResponse<{ survey: Survey; questions: SurveyQuestion[] }>>(
      `${this.baseUrl}/${surveyId}/preview`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get survey preview');
    }
    return response.data.data;
  }

  async validateSurvey(surveyId: string): Promise<{ isValid: boolean; errors: string[] }> {
    const response = await apiClient.post<ApiResponse<{ isValid: boolean; errors: string[] }>>(
      `${this.baseUrl}/${surveyId}/validate`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to validate survey');
    }
    return response.data.data;
  }
}

export const surveyApi = new SurveyApiService();
