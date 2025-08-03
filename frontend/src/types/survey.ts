// Survey Types

export type SurveyStatus = 'draft' | 'published' | 'closed' | 'archived';

export type QuestionType = 
  | 'radio'           // Multiple choice (single selection)
  | 'checkbox'        // Multiple choice (multiple selections)
  | 'dropdown'        // Dropdown select
  | 'text'            // Short text input
  | 'textarea'        // Long text input
  | 'email'           // Email input
  | 'phone'           // Phone number input
  | 'url'             // URL input
  | 'number'          // Number input
  | 'range'           // Range slider
  | 'rating'          // Star rating
  | 'scale'           // Linear scale
  | 'date'            // Date picker
  | 'time'            // Time picker
  | 'boolean'         // Yes/No toggle
  | 'file'            // File upload
  | 'image';          // Image upload

export interface Survey {
  id?: string;
  title: string;
  description?: string;
  status: SurveyStatus;
  isPublic: boolean;
  
  // Access Control
  requireAuth?: boolean;
  allowAnonymous?: boolean;
  allowMultipleResponses?: boolean;
  maxResponses?: number;
  
  // Scheduling
  startDate?: Date;
  endDate?: Date;
  autoClose?: boolean;
  
  // Display Settings
  allowSaveProgress?: boolean;
  randomizeQuestions?: boolean;
  showProgressBar?: boolean;
  showResults?: boolean;
  questionsPerPage?: number;
  
  // Notifications
  notifyOnResponse?: boolean;
  notifyOnComplete?: boolean;
  notificationEmail?: string;
  
  // Thank You Page
  thankYouTitle?: string;
  thankYouMessage?: string;
  redirectUrl?: string;
  
  // Advanced
  customCss?: string;
  customJs?: string;
  enableAnalytics?: boolean;
  googleAnalyticsId?: string;
  
  // Metadata
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  
  // Statistics
  responseCount?: number;
  completionRate?: number;
  averageTime?: number;
}

export interface SurveyQuestion {
  id?: string;
  surveyId: string;
  questionType: QuestionType;
  questionText: string;
  description?: string;
  isRequired: boolean;
  order: number;
  
  // Question Options (for choice questions)
  options?: string[];
  
  // Validation Rules
  validation?: QuestionValidation;
  
  // Display Settings
  placeholder?: string;
  helpText?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionValidation {
  // Text validation
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  
  // Number validation
  min?: number;
  max?: number;
  step?: number;
  
  // Choice validation
  minSelections?: number;
  maxSelections?: number;
  
  // Rating validation
  maxRating?: number;
  
  // Scale validation
  scaleStart?: number;
  scaleEnd?: number;
  scaleStartLabel?: string;
  scaleEndLabel?: string;
  
  // File validation
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
  
  // Custom validation
  customValidation?: string;
  customErrorMessage?: string;
}

export interface SurveyResponse {
  id?: string;
  surveyId: string;
  respondentId?: string;
  sessionId?: string;
  
  // Response Status
  status: 'in_progress' | 'completed' | 'submitted';
  isAnonymous: boolean;
  
  // Progress Tracking
  currentQuestionId?: string;
  completedQuestions: string[];
  totalQuestions: number;
  progressPercentage: number;
  
  // Timing
  startedAt: Date;
  completedAt?: Date;
  submittedAt?: Date;
  timeSpent?: number; // in seconds
  
  // Metadata
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  
  // Response Data
  answers: SurveyAnswer[];
}

export interface SurveyAnswer {
  id?: string;
  responseId: string;
  questionId: string;
  
  // Answer Data
  answerText?: string;
  answerNumber?: number;
  answerBoolean?: boolean;
  answerDate?: Date;
  answerFile?: FileUpload;
  answerChoices?: string[]; // for multiple choice questions
  
  // Answer Metadata
  isSkipped: boolean;
  timeSpent?: number; // time spent on this question in seconds
  
  // Timestamps
  answeredAt: Date;
  updatedAt?: Date;
}

export interface FileUpload {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

// Survey Analytics Types

export interface SurveyAnalytics {
  surveyId: string;
  
  // Overall Statistics
  totalResponses: number;
  completedResponses: number;
  inProgressResponses: number;
  completionRate: number;
  averageCompletionTime: number;
  
  // Response Trends
  responsesOverTime: TimeSeriesData[];
  completionTrends: TimeSeriesData[];
  
  // Question Analytics
  questionAnalytics: QuestionAnalytics[];
  
  // Demographics
  deviceTypes: Record<string, number>;
  locations: Record<string, number>;
  referrers: Record<string, number>;
  
  // Performance Metrics
  dropoffPoints: DropoffPoint[];
  averageTimePerQuestion: Record<string, number>;
  
  // Last Updated
  lastUpdated: Date;
}

export interface QuestionAnalytics {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  
  // Response Statistics
  totalAnswers: number;
  skippedCount: number;
  responseRate: number;
  
  // Answer Distribution (for choice questions)
  answerDistribution?: Record<string, number>;
  
  // Numeric Statistics (for number questions)
  numericStats?: {
    mean: number;
    median: number;
    mode: number;
    standardDeviation: number;
    min: number;
    max: number;
  };
  
  // Text Analysis (for text questions)
  textStats?: {
    averageLength: number;
    wordCount: number;
    commonWords: Array<{ word: string; count: number }>;
  };
  
  // Time Statistics
  averageTimeSpent: number;
  
  // Last Updated
  lastUpdated: Date;
}

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
}

export interface DropoffPoint {
  questionId: string;
  questionText: string;
  dropoffRate: number;
  position: number;
}

// Survey Builder Types

export interface SurveyBuilderState {
  survey: Survey;
  questions: SurveyQuestion[];
  selectedQuestionId?: string;
  isDirty: boolean;
  isLoading: boolean;
  error?: string;
}

export interface QuestionTemplate {
  id: string;
  name: string;
  description: string;
  questionType: QuestionType;
  template: Partial<SurveyQuestion>;
  category: 'basic' | 'advanced' | 'custom';
  icon?: string;
}

export interface SurveyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  survey: Partial<Survey>;
  questions: Partial<SurveyQuestion>[];
  previewImage?: string;
  isPublic: boolean;
  usageCount: number;
  rating: number;
  createdBy: string;
  createdAt: Date;
}

// API Response Types

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface SurveyListItem {
  id: string;
  title: string;
  description?: string;
  status: SurveyStatus;
  isPublic: boolean;
  responseCount: number;
  completionRate: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

// Form Types for API requests

export interface CreateSurveyRequest {
  title: string;
  description?: string;
  isPublic?: boolean;
  questions?: Partial<SurveyQuestion>[];
}

export interface UpdateSurveyRequest extends Partial<Survey> {
  questions?: SurveyQuestion[];
}

export interface CreateQuestionRequest extends Omit<SurveyQuestion, 'id' | 'createdAt' | 'updatedAt'> {}

export interface UpdateQuestionRequest extends Partial<SurveyQuestion> {}

export interface StartResponseRequest {
  surveyId: string;
  isAnonymous?: boolean;
  sessionId?: string;
}

export interface SubmitAnswerRequest {
  questionId: string;
  answerText?: string;
  answerNumber?: number;
  answerBoolean?: boolean;
  answerDate?: Date;
  answerChoices?: string[];
  timeSpent?: number;
}

export interface CompleteResponseRequest {
  responseId: string;
  answers?: SubmitAnswerRequest[];
}

// Utility Types

export type SurveyFormData = Omit<Survey, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;
export type QuestionFormData = Omit<SurveyQuestion, 'id' | 'surveyId' | 'createdAt' | 'updatedAt'>;

// Event Types for real-time updates

export interface SurveyEvent {
  type: 'response_started' | 'response_completed' | 'response_submitted' | 'survey_updated';
  surveyId: string;
  data: any;
  timestamp: Date;
}

export interface RealTimeMetrics {
  surveyId: string;
  activeResponses: number;
  responsesPerMinute: number;
  completionRate: number;
  averageTime: number;
  lastUpdated: Date;
}
