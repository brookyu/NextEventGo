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

class SurveyApiService {
  private baseUrl = '/api/v1/surveys';

  // Survey CRUD Operations
  
  async createSurvey(surveyData: CreateSurveyRequest): Promise<Survey> {
    const response = await apiClient.post<ApiResponse<Survey>>(this.baseUrl, surveyData);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to create survey');
    }
    return response.data.data;
  }

  async getSurvey(surveyId: string): Promise<Survey> {
    const response = await apiClient.get<ApiResponse<Survey>>(`${this.baseUrl}/${surveyId}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get survey');
    }
    return response.data.data;
  }

  async updateSurvey(surveyId: string, updates: UpdateSurveyRequest): Promise<Survey> {
    const response = await apiClient.put<ApiResponse<Survey>>(`${this.baseUrl}/${surveyId}`, updates);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to update survey');
    }
    return response.data.data;
  }

  async deleteSurvey(surveyId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/${surveyId}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete survey');
    }
  }

  async getSurveys(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<SurveyListItem>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<SurveyListItem>>>(
      this.baseUrl, 
      { params }
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get surveys');
    }
    return response.data.data;
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
    const response = await apiClient.get<ApiResponse<SurveyQuestion[]>>(`${this.baseUrl}/${surveyId}/questions`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get survey questions');
    }
    return response.data.data;
  }

  async createQuestion(surveyId: string, questionData: CreateQuestionRequest): Promise<SurveyQuestion> {
    const response = await apiClient.post<ApiResponse<SurveyQuestion>>(
      `${this.baseUrl}/${surveyId}/questions`, 
      questionData
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to create question');
    }
    return response.data.data;
  }

  async updateQuestion(surveyId: string, questionId: string, updates: UpdateQuestionRequest): Promise<SurveyQuestion> {
    const response = await apiClient.put<ApiResponse<SurveyQuestion>>(
      `${this.baseUrl}/${surveyId}/questions/${questionId}`, 
      updates
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to update question');
    }
    return response.data.data;
  }

  async deleteQuestion(surveyId: string, questionId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `${this.baseUrl}/${surveyId}/questions/${questionId}`
    );
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete question');
    }
  }

  async reorderQuestions(surveyId: string, questionIds: string[]): Promise<SurveyQuestion[]> {
    const response = await apiClient.post<ApiResponse<SurveyQuestion[]>>(
      `${this.baseUrl}/${surveyId}/questions/reorder`,
      { questionIds }
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to reorder questions');
    }
    return response.data.data;
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
