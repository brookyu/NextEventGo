export interface Event {
  id: string
  eventTitle: string
  eventStartDate: string
  eventEndDate: string
  tagName: string
  userTagId: number
  interactionCode: string
  scanMessage: string
  isCurrent: boolean
  createdAt: string
  updatedAt: string
  
  // Computed fields
  status?: 'upcoming' | 'active' | 'completed' | 'cancelled'
  attendeeCount?: number
  checkedInCount?: number
  checkInRate?: number
}

export interface CreateEventRequest {
  eventTitle: string
  eventStartDate: string
  eventEndDate: string
  tagName?: string
  userTagId?: number
  interactionCode?: string
  scanMessage?: string
  isCurrent?: boolean
}

export interface UpdateEventRequest {
  eventTitle?: string
  eventStartDate?: string
  eventEndDate?: string
  tagName?: string
  scanMessage?: string
  isCurrent?: boolean
}

export interface EventStatistics {
  eventId: string
  totalRegistered: number
  totalCheckedIn: number
  checkInRate: number
  registrationTrend: RegistrationPoint[]
  checkInTrend: CheckInPoint[]
  topSources: SourceStatistic[]
  hourlyCheckIns: HourlyCheckIn[]
  dailyRegistrations: DailyRegistration[]
}

export interface RegistrationPoint {
  date: string
  count: number
}

export interface CheckInPoint {
  date: string
  count: number
}

export interface SourceStatistic {
  source: string
  count: number
  percentage: number
}

export interface HourlyCheckIn {
  hour: number
  count: number
}

export interface DailyRegistration {
  date: string
  count: number
}

export interface EventFilters {
  search?: string
  status?: 'upcoming' | 'active' | 'completed' | 'cancelled' | 'all'
  dateRange?: {
    start: string
    end: string
  }
  tagName?: string
  isCurrent?: boolean
  sortBy?: 'eventTitle' | 'eventStartDate' | 'eventEndDate' | 'createdAt' | 'attendeeCount'
  sortOrder?: 'asc' | 'desc'
}

export interface EventFormData {
  eventTitle: string
  eventStartDate: Date
  eventEndDate: Date
  tagName: string
  scanMessage: string
  isCurrent: boolean
}

export interface QRCodeInfo {
  code: string
  type: string
  entityId: string
  expiresAt?: string
  createdAt: string
  isActive: boolean
  scanCount: number
  lastScannedAt?: string
  qrCodeUrl?: string
}
