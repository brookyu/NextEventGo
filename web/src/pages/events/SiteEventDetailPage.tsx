import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Edit, Trash2, Star, StarOff, Calendar, Clock, 
  Tag, FileText, Video, Users, Settings, QrCode, Share2 
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Separator } from '../../components/ui/separator'
import { siteEventsApi, SiteEventForEditing } from '../../api/siteEvents'
import { toast } from 'react-hot-toast'

const SiteEventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const [event, setEvent] = useState<SiteEventForEditing | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadEventDetails(id)
    }
  }, [id])

  const loadEventDetails = async (eventId: string) => {
    try {
      setLoading(true)
      const response = await siteEventsApi.getEventForEditing(eventId)
      if (response.success) {
        setEvent(response.data)
      }
    } catch (error) {
      console.error('Failed to load event details:', error)
      toast.error('Failed to load event details')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleCurrent = async () => {
    if (!event || !id) return

    try {
      await siteEventsApi.toggleCurrentEvent(id)
      toast.success('Event status updated successfully')
      loadEventDetails(id) // Reload to get updated data
    } catch (error) {
      console.error('Failed to toggle current event:', error)
      toast.error('Failed to update event status')
    }
  }

  const handleDelete = async () => {
    if (!event || !id) return

    if (!confirm(`Are you sure you want to delete "${event.eventTitle}"?`)) {
      return
    }

    try {
      await siteEventsApi.deleteEvent(id)
      toast.success('Event deleted successfully')
      navigate('/events')
    } catch (error) {
      console.error('Failed to delete event:', error)
      toast.error('Failed to delete event')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="secondary">Upcoming</Badge>
      case 'active':
        return <Badge variant="default">Active</Badge>
      case 'completed':
        return <Badge variant="outline">Completed</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getEventStatus = (startDate: string, endDate: string) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (now < start) return 'upcoming'
    if (now >= start && now <= end) return 'active'
    if (now > end) return 'completed'
    return 'draft'
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Event not found</h3>
            <p className="text-gray-600 mb-4">The requested event could not be found.</p>
            <Button onClick={() => navigate('/events/site-events')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const status = getEventStatus(event.eventStartDate, event.eventEndDate)

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/events/site-events')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold">{event.eventTitle}</h1>
              {getStatusBadge(status)}
            </div>
            <p className="text-gray-600">Event Details and Configuration</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleToggleCurrent}
            className="flex items-center gap-2"
          >
            {status === 'active' ? (
              <>
                <StarOff className="h-4 w-4" />
                Remove Current
              </>
            ) : (
              <>
                <Star className="h-4 w-4" />
                Set as Current
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/events/${id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Event Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-600 mb-1">Start Date</h4>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    {formatDate(event.eventStartDate)}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-600 mb-1">End Date</h4>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    {formatDate(event.eventEndDate)}
                  </p>
                </div>
              </div>

              {event.tagName && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-600 mb-1">Tag Name</h4>
                  <p className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-400" />
                    {event.tagName}
                  </p>
                </div>
              )}

              {event.tags && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-600 mb-1">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.split(',').map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Associated Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Associated Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.agendaArticleTitle && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Event Agenda</h4>
                    <p className="text-sm text-gray-600">{event.agendaArticleTitle}</p>
                  </div>
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
              )}

              {event.backgroundArticleTitle && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Event Background</h4>
                    <p className="text-sm text-gray-600">{event.backgroundArticleTitle}</p>
                  </div>
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
              )}

              {event.aboutArticleTitle && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">About Event</h4>
                    <p className="text-sm text-gray-600">{event.aboutArticleTitle}</p>
                  </div>
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
              )}

              {event.instructionsArticleTitle && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Event Instructions</h4>
                    <p className="text-sm text-gray-600">{event.instructionsArticleTitle}</p>
                  </div>
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
              )}

              {!event.agendaArticleTitle && !event.backgroundArticleTitle && 
               !event.aboutArticleTitle && !event.instructionsArticleTitle && (
                <p className="text-gray-500 text-center py-4">
                  No articles associated with this event
                </p>
              )}
            </CardContent>
          </Card>

          {/* Media Resources */}
          {event.cloudVideoTitle && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Media Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Cloud Video</h4>
                    <p className="text-sm text-gray-600">{event.cloudVideoTitle}</p>
                  </div>
                  <Video className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Event Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                {getStatusBadge(status)}
                <p className="text-sm text-gray-600 mt-2">
                  Current event status based on dates
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span>
                    {Math.ceil(
                      (new Date(event.eventEndDate).getTime() - new Date(event.eventStartDate).getTime()) 
                      / (1000 * 60 * 60 * 24)
                    )} days
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Created:</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Survey & Forms */}
          {(event.surveyTitle || event.registerFormTitle) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Surveys & Forms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {event.surveyTitle && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-sm">Feedback Survey</h4>
                    <p className="text-sm text-gray-600">{event.surveyTitle}</p>
                  </div>
                )}
                
                {event.registerFormTitle && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-sm">Registration Form</h4>
                    <p className="text-sm text-gray-600">{event.registerFormTitle}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <QrCode className="h-4 w-4 mr-2" />
                Generate QR Code
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Share2 className="h-4 w-4 mr-2" />
                Share Event
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                View Attendees
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SiteEventDetailPage
