// Simple events API that matches the actual backend implementation

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
  created_at: string
  updated_at: string
}

export interface EventsResponse {
  data: {
    events: Event[]
    total: number
    offset: number
    limit: number
  }
}

export interface CreateEventRequest {
  eventTitle: string
  eventStartDate: string
  eventEndDate: string
  tagName: string
  userTagId: number
  interactionCode: string
  scanMessage: string
  isCurrent: boolean
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

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

export const eventsApi = {
  // Get all events
  async getEvents(params?: {
    offset?: number
    limit?: number
    search?: string
    status?: string
    sortBy?: string
    sortOrder?: string
  }): Promise<EventsResponse> {
    const searchParams = new URLSearchParams()

    if (params?.offset !== undefined) searchParams.append('offset', params.offset.toString())
    if (params?.limit !== undefined) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)
    if (params?.status) searchParams.append('status', params.status)
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder)

    const response = await fetch(`${API_BASE_URL}/events?${searchParams}`, {
      headers: createHeaders(),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch events')
    }

    return response.json()
  },

  // Get single event
  async getEvent(id: string): Promise<{ data: Event }> {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      headers: createHeaders(),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch event')
    }

    return response.json()
  },

  // Create event
  async createEvent(event: CreateEventRequest): Promise<{ data: Event }> {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(event),
    })

    if (!response.ok) {
      throw new Error('Failed to create event')
    }

    return response.json()
  },

  // Update event
  async updateEvent(id: string, event: Partial<CreateEventRequest>): Promise<{ data: Event }> {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(event),
    })

    if (!response.ok) {
      throw new Error('Failed to update event')
    }

    return response.json()
  },

  // Delete event
  async deleteEvent(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'DELETE',
      headers: createHeaders(),
    })

    if (!response.ok) {
      throw new Error('Failed to delete event')
    }
  },

  // Get current event
  async getCurrentEvent(): Promise<{ data: Event }> {
    const response = await fetch(`${API_BASE_URL}/events/current`, {
      headers: createHeaders(),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch current event')
    }

    return response.json()
  },

  // Get event attendees
  async getEventAttendees(eventId: string): Promise<{ data: any[] }> {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/attendees`, {
      headers: createHeaders(),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch event attendees')
    }

    return response.json()
  },

  // Set current event
  async setCurrentEvent(id: string): Promise<{ data: Event }> {
    const response = await fetch(`${API_BASE_URL}/events/${id}/set-current`, {
      method: 'POST',
      headers: createHeaders(),
    })

    if (!response.ok) {
      throw new Error('Failed to set current event')
    }

    return response.json()
  },

  // Start event
  async startEvent(id: string): Promise<{ data: Event }> {
    const response = await fetch(`${API_BASE_URL}/events/${id}/start`, {
      method: 'POST',
      headers: createHeaders(),
    })

    if (!response.ok) {
      throw new Error('Failed to start event')
    }

    return response.json()
  },

  // End event
  async endEvent(id: string): Promise<{ data: Event }> {
    const response = await fetch(`${API_BASE_URL}/events/${id}/end`, {
      method: 'POST',
      headers: createHeaders(),
    })

    if (!response.ok) {
      throw new Error('Failed to end event')
    }

    return response.json()
  },

  // Cancel event
  async cancelEvent(id: string): Promise<{ data: Event }> {
    const response = await fetch(`${API_BASE_URL}/events/${id}/cancel`, {
      method: 'POST',
      headers: createHeaders(),
    })

    if (!response.ok) {
      throw new Error('Failed to cancel event')
    }

    return response.json()
  },

  // Generate QR code
  async generateQRCode(eventId: string, expireHours?: number): Promise<{ data: any }> {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/qr-code`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ expireHours }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate QR code')
    }

    return response.json()
  },

  // Get event analytics
  async getEventAnalytics(eventId: string): Promise<{ data: any }> {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/analytics`, {
      headers: createHeaders(),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch event analytics')
    }

    return response.json()
  },

  // Check in attendee
  async checkInAttendee(qrCode: string): Promise<{ data: any }> {
    const response = await fetch(`${API_BASE_URL}/events/checkin`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ qrCode }),
    })

    if (!response.ok) {
      throw new Error('Failed to check in attendee')
    }

    return response.json()
  },

  // Register attendee
  async registerAttendee(eventId: string, attendeeData: any): Promise<{ data: any }> {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/register`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(attendeeData),
    })

    if (!response.ok) {
      throw new Error('Failed to register attendee')
    }

    return response.json()
  },
}
