export type EventStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';
export type AttendeeStatus = 'registered' | 'checked_in' | 'cancelled';

export interface Event {
  id: string;
  eventTitle: string;
  eventStartDate: string;
  eventEndDate: string;
  tagName: string;
  userTagId: number;
  interactionCode: string;
  scanMessage: string;
  isCurrent: boolean;
  description?: string;
  location?: string;
  capacity?: number;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  
  // Computed fields
  status: EventStatus;
  attendeeCount: number;
  checkedInCount: number;
  checkInRate: number;
  
  // Related data (included based on options)
  attendees?: Attendee[];
  analytics?: EventAnalytics;
  qrCode?: QRCode;
}

export interface Attendee {
  id: string;
  eventId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  notes: string;
  wechatId: string;
  status: AttendeeStatus;
  checkInTime?: string;
  qrCode: string;
  createdAt: string;
  updatedAt?: string;
  
  // Related data
  event?: Event;
  user?: User;
}

export interface QRCode {
  code: string;
  type: 'event' | 'attendee';
  entityId: string;
  expiresAt?: string;
  createdAt: string;
  isActive: boolean;
  scanCount: number;
  lastScannedAt?: string;
  qrCodeUrl?: string;
}

export interface EventAnalytics {
  eventId: string;
  totalRegistrations: number;
  totalCheckIns: number;
  checkInRate: number;
  registrationRate: number;
  peakCheckInTime?: string;
  avgCheckInTime: number; // minutes from event start
  registrationsOverTime: TimeSeriesPoint[];
  checkInsOverTime: TimeSeriesPoint[];
  companyBreakdown: Record<string, number>;
  titleBreakdown: Record<string, number>;
  geographicBreakdown: Record<string, number>;
  qrCodeScans: number;
  lastUpdated: string;
}

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
}

// Request/Response Types

export interface EventCreateRequest {
  eventTitle: string;
  eventStartDate: string;
  eventEndDate: string;
  tagName?: string;
  userTagId?: number;
  interactionCode?: string;
  scanMessage?: string;
  isCurrent?: boolean;
  description?: string;
  location?: string;
  capacity?: number;
}

export interface EventUpdateRequest {
  eventTitle?: string;
  eventStartDate?: string;
  eventEndDate?: string;
  tagName?: string;
  userTagId?: number;
  interactionCode?: string;
  scanMessage?: string;
  isCurrent?: boolean;
  description?: string;
  location?: string;
  capacity?: number;
}

export interface EventSearchRequest {
  search?: string;
  status?: EventStatus;
  tagName?: string;
  isCurrent?: boolean;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  
  // Pagination
  page?: number;
  limit?: number;
  
  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  
  // Include options
  includeAttendees?: boolean;
  includeAnalytics?: boolean;
}

export interface EventListResponse {
  events: Event[];
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Attendee Types

export interface AttendeeCreateRequest {
  eventId: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  notes?: string;
  wechatId?: string;
}

export interface AttendeeUpdateRequest {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  notes?: string;
  wechatId?: string;
}

export interface CheckInRequest {
  qrCode: string;
  scannerInfo?: QRScannerInfo;
}

export interface CheckInResponse {
  success: boolean;
  attendeeId: string;
  eventId: string;
  checkInTime: string;
  message: string;
  alreadyCheckedIn: boolean;
  attendee?: Attendee;
}

export interface QRScannerInfo {
  scannerId?: string;
  location?: string;
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface QRScanResult {
  success: boolean;
  type: string;
  entityId: string;
  message: string;
  checkIn?: CheckInResponse;
  event?: Event;
  attendee?: Attendee;
}

// Bulk Operations Types

export interface BulkAttendeeOperationRequest {
  attendeeIds: string[];
  action: 'check_in' | 'cancel' | 'send_reminder';
  data?: any;
}

export interface BulkAttendeeOperationResponse {
  success: boolean;
  processed: number;
  failed: number;
  errors?: string[];
  message: string;
}

// Export Types

export interface EventExportRequest {
  eventId: string;
  format: 'csv' | 'excel' | 'pdf';
  includeData?: string[]; // 'attendees', 'analytics', 'checkins'
}

export interface EventExportResponse {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  expiresAt: string;
  message: string;
}

// Analytics Types

export interface AttendanceReport {
  eventId: string;
  eventTitle: string;
  totalCapacity: number;
  totalRegistered: number;
  totalCheckedIn: number;
  checkInRate: number;
  attendees: AttendeeInfo[];
  timeline: AttendanceTimePoint[];
}

export interface AttendeeInfo {
  id: string;
  name: string;
  email: string;
  company: string;
  status: AttendeeStatus;
  checkInTime?: string;
  registrationTime: string;
}

export interface AttendanceTimePoint {
  timestamp: string;
  registrations: number;
  checkIns: number;
}

// User Type (for related data)
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
}

// WeChat Integration Types

export interface WeChatEventIntegration {
  eventId: string;
  wechatEventId?: string;
  isConnected: boolean;
  syncEnabled: boolean;
  lastSyncAt?: string;
  settings: Record<string, any>;
}

export interface WeChatRegistrationData {
  openId: string;
  unionId?: string;
  nickname: string;
  avatar?: string;
  city?: string;
  province?: string;
  country?: string;
}

// Calendar Integration Types

export interface CalendarExportRequest {
  eventId: string;
  format: 'ics' | 'google' | 'outlook';
  includeReminders?: boolean;
}

export interface CalendarExportResponse {
  success: boolean;
  calendarUrl?: string;
  downloadUrl?: string;
  message: string;
}

// Real-time Types

export interface EventUpdate {
  type: 'registration' | 'checkin' | 'status_change' | 'analytics_update';
  eventId: string;
  data: any;
  timestamp: string;
}

export interface LiveEventData {
  event: Event;
  realtimeStats: {
    activeConnections: number;
    recentCheckIns: Attendee[];
    currentCheckInRate: number;
    registrationTrend: TimeSeriesPoint[];
  };
  lastUpdated: string;
}

// System Configuration Types

export interface EventSystemConfig {
  maxEventsPerUser: number;
  defaultEventDuration: number; // hours
  allowPublicRegistration: boolean;
  requireEmailVerification: boolean;
  enableWeChatIntegration: boolean;
  enableCalendarIntegration: boolean;
  qrCodeExpirationHours: number;
  maxAttendeesPerEvent: number;
  enableRealTimeAnalytics: boolean;
  notificationSettings: NotificationSettings;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  wechatNotifications: boolean;
  reminderSettings: {
    enabled: boolean;
    hoursBeforeEvent: number[];
  };
}

// Organizer Settings Types

export interface OrganizerSettings {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  contactInfo: {
    email: string;
    phone?: string;
    website?: string;
  };
  defaultEventSettings: {
    requireApproval: boolean;
    allowWaitlist: boolean;
    sendConfirmationEmail: boolean;
    enableCheckIn: boolean;
  };
  integrations: {
    wechat: boolean;
    calendar: boolean;
    analytics: boolean;
  };
  preferences: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}
