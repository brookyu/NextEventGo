// Site Events API client for the new comprehensive Event Management system

export interface SiteEvent {
  id: string
  eventTitle: string
  eventStartDate: string
  eventEndDate: string
  isCurrent: boolean
  tags: string
  createdAt: string
  status: 'upcoming' | 'active' | 'completed' | 'cancelled'
  interactionCode: string
  categoryId?: string
}

export interface SiteEventForEditing {
  id: string
  eventTitle: string
  eventStartDate: string
  eventEndDate: string
  tagName: string

  // Survey and form associations
  surveyTitle?: string
  surveyId?: string
  registerFormTitle?: string
  registerFormId?: string

  // Article associations
  aboutEventTitle?: string
  aboutEventId?: string
  agendaTitle?: string
  agendaId?: string
  backgroundTitle?: string
  backgroundId?: string
  instructionsTitle?: string
  instructionsId?: string

  // Video associations
  cloudVideoTitle?: string
  cloudVideoId?: string

  // Categorization
  categoryId?: string
}

export interface CreateUpdateSiteEvent {
  id?: string
  eventTitle: string
  eventStartDate: string
  eventEndDate: string
  tagName?: string

  // Resource IDs
  surveyId?: string
  registerFormId?: string

  // Article resource IDs
  aboutEventId?: string
  agendaId?: string
  backgroundId?: string
  instructionsId?: string

  // Video resource IDs
  cloudVideoId?: string

  // Organization
  categoryId?: string
}

export interface SiteEventsListParams {
  page?: number
  pageSize?: number
  categoryId?: string
  searchTerm?: string
  status?: 'upcoming' | 'active' | 'completed' | 'cancelled'
  isCurrent?: boolean
  startDateFrom?: string
  startDateTo?: string
  sortBy?: 'title' | 'startDate' | 'endDate' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface SiteEventsListResponse {
  data: SiteEvent[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v2'

// Get auth token from localStorage
const getAuthToken = () => {
  const authStorage = localStorage.getItem('auth-storage')
  if (authStorage) {
    const parsed = JSON.parse(authStorage)
    return parsed.state?.token
  }
  return null
}

// Create headers with auth token
const createHeaders = () => {
  const token = getAuthToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const siteEventsApi = {
  // Get paginated list of events with filtering
  async getEvents(params?: SiteEventsListParams): Promise<ApiResponse<SiteEventsListResponse>> {
    const searchParams = new URLSearchParams()

    if (params?.page !== undefined) searchParams.append('page', params.page.toString())
    if (params?.pageSize !== undefined) searchParams.append('pageSize', params.pageSize.toString())
    if (params?.categoryId) searchParams.append('categoryId', params.categoryId)
    if (params?.searchTerm) searchParams.append('searchTerm', params.searchTerm)
    if (params?.status) searchParams.append('status', params.status)
    if (params?.isCurrent !== undefined) searchParams.append('isCurrent', params.isCurrent.toString())
    if (params?.startDateFrom) searchParams.append('startDateFrom', params.startDateFrom)
    if (params?.startDateTo) searchParams.append('startDateTo', params.startDateTo)
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder)

    const response = await fetch(`${API_BASE_URL}/site-events?${searchParams}`, {
      headers: createHeaders(),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch events')
    }

    return response.json()
  },

  // Get current active event
  async getCurrentEvent(): Promise<ApiResponse<SiteEvent>> {
    const response = await fetch(`${API_BASE_URL}/site-events/current`, {
      headers: createHeaders(),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch current event')
    }

    return response.json()
  },

  // Get single event by ID
  async getEvent(id: string): Promise<ApiResponse<SiteEvent>> {
    const response = await fetch(`${API_BASE_URL}/site-events/${id}`, {
      headers: createHeaders(),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch event')
    }

    return response.json()
  },

  // Get event for editing with all resource information
  async getEventForEditing(id: string): Promise<ApiResponse<SiteEventForEditing>> {
    const response = await fetch(`${API_BASE_URL}/site-events/${id}/for-editing`, {
      headers: createHeaders(),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch event for editing')
    }

    return response.json()
  },

  // Create new event
  async createEvent(event: CreateUpdateSiteEvent): Promise<ApiResponse<SiteEvent>> {
    const response = await fetch(`${API_BASE_URL}/site-events`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(event),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to create event')
    }

    return response.json()
  },

  // Update existing event
  async updateEvent(id: string, event: CreateUpdateSiteEvent): Promise<ApiResponse<SiteEvent>> {
    const response = await fetch(`${API_BASE_URL}/site-events/${id}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify({ ...event, id }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to update event')
    }

    return response.json()
  },

  // Delete event (soft delete)
  async deleteEvent(id: string): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE_URL}/site-events/${id}`, {
      method: 'DELETE',
      headers: createHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to delete event')
    }

    return response.json()
  },

  // Toggle current event status
  async toggleCurrentEvent(id: string): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE_URL}/site-events/${id}/toggle-current`, {
      method: 'POST',
      headers: createHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to toggle current event')
    }

    return response.json()
  },
}
