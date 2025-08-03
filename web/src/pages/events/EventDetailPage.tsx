import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Edit, Calendar, Users, Tag, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'

import { eventsApi } from '@/api/events'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Fetch event data
  const { data: eventData, isLoading, error } = useQuery({
    queryKey: ['events', id],
    queryFn: () => eventsApi.getEvent(id!),
    enabled: !!id,
  })

  // Fetch event attendees
  const { data: attendeesData } = useQuery({
    queryKey: ['events', id, 'attendees'],
    queryFn: () => eventsApi.getEventAttendees(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !eventData?.data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Failed to load event</p>
        <Button onClick={() => navigate('/events')}>
          Back to Events
        </Button>
      </div>
    )
  }

  const event = eventData.data
  const attendees = attendeesData?.data || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/events')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{event.eventTitle}</h1>
            <p className="text-gray-600">Event Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/events/${event.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Event
            </Link>
          </Button>
        </div>
      </div>

      {/* Event Status */}
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          event.isCurrent 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {event.isCurrent ? 'Current Event' : 'Inactive'}
        </span>
      </div>

      {/* Event Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Event Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Event Title</label>
              <p className="text-lg font-semibold">{event.eventTitle}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Tag Name</label>
              <p className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                {event.tagName}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Start Date & Time</label>
              <p>{format(new Date(event.eventStartDate), 'PPP p')}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">End Date & Time</label>
              <p>{format(new Date(event.eventEndDate), 'PPP p')}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">User Tag ID</label>
              <p>{event.userTagId}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Interaction Code</label>
              <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                {event.interactionCode}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Scan Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">{event.scanMessage}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendees */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Attendees ({attendees.length})
          </CardTitle>
          <CardDescription>
            People who have scanned the QR code for this event
          </CardDescription>
        </CardHeader>
        <CardContent>
          {attendees.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No attendees yet</h3>
              <p className="text-gray-600">Attendees will appear here when they scan the QR code</p>
            </div>
          ) : (
            <div className="space-y-2">
              {attendees.map((attendee: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{attendee.name || 'Anonymous'}</p>
                    <p className="text-sm text-gray-600">
                      Scanned: {attendee.scannedAt ? format(new Date(attendee.scannedAt), 'PPp') : 'Unknown'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Event Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-gray-500">Event ID</label>
              <p className="font-mono">{event.id}</p>
            </div>
            <div>
              <label className="text-gray-500">Created</label>
              <p>{format(new Date(event.created_at), 'PPp')}</p>
            </div>
            <div>
              <label className="text-gray-500">Last Updated</label>
              <p>{format(new Date(event.updated_at), 'PPp')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
