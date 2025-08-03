import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Calendar, Users, Plus, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'

import { eventsApi, type Event } from '@/api/events'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
  // Fetch recent events
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['events', 'recent'],
    queryFn: () => eventsApi.getEvents({ limit: 5, sortBy: 'eventStartDate', sortOrder: 'desc' }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Fetch current event
  const { data: currentEventData } = useQuery({
    queryKey: ['events', 'current'],
    queryFn: () => eventsApi.getCurrentEvent(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const events = eventsData?.data?.events || []
  const totalEvents = eventsData?.data?.total || 0
  const currentEvent = currentEventData?.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your event management dashboard</p>
        </div>
        <Button asChild>
          <Link to="/events/new">
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Events in your system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Event</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentEvent ? '1' : '0'}</div>
            <p className="text-xs text-muted-foreground">
              {currentEvent ? currentEvent.eventTitle : 'No active event'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">
              Latest events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Coming soon
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Current Event */}
      {currentEvent && (
        <Card>
          <CardHeader>
            <CardTitle>Current Event</CardTitle>
            <CardDescription>The currently active event</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{currentEvent.eventTitle}</h3>
                <p className="text-gray-600">{currentEvent.tagName}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(currentEvent.eventStartDate), 'MMM dd, yyyy h:mm a')} - 
                  {format(new Date(currentEvent.eventEndDate), 'h:mm a')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link to={`/events/${currentEvent.id}`}>
                    View Details
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to={`/events/${currentEvent.id}/edit`}>
                    Edit
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>Your latest events</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first event</p>
              <Button asChild>
                <Link to="/events/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event: Event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{event.eventTitle}</h4>
                    <p className="text-sm text-gray-600">{event.tagName}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(event.eventStartDate), 'MMM dd, yyyy h:mm a')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      event.isCurrent 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {event.isCurrent ? 'Current' : 'Inactive'}
                    </span>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/events/${event.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
              <div className="text-center pt-4">
                <Button variant="outline" asChild>
                  <Link to="/events">
                    View All Events
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
