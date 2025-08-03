import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Calendar, Users, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

import { eventsApi, type Event } from '@/api/events'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function EventsPage() {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12

  // Fetch events
  const {
    data: eventsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['events', search, currentPage],
    queryFn: () =>
      eventsApi.getEvents({
        offset: (currentPage - 1) * pageSize,
        limit: pageSize,
        search: search || undefined,
        sortBy: 'eventStartDate',
        sortOrder: 'desc',
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const events = eventsData?.data?.events || []
  const total = eventsData?.data?.total || 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Failed to load events</p>
        <Button onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600">Manage your events and attendees</p>
        </div>
        <Button asChild>
          <Link to="/events/new">
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Events ({total})</CardTitle>
          <CardDescription>
            A list of all events in your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first event</p>
              <Button asChild>
                <Link to="/events/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event: Event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{event.eventTitle}</div>
                        <div className="text-sm text-gray-500">{event.tagName}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(new Date(event.eventStartDate), 'MMM dd, yyyy')}</div>
                        <div className="text-gray-500">
                          {format(new Date(event.eventStartDate), 'h:mm a')} - {format(new Date(event.eventEndDate), 'h:mm a')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        event.isCurrent 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {event.isCurrent ? 'Current' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/events/${event.id}`}>
                            View
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/events/${event.id}/edit`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > pageSize && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-700">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, total)} of {total} events
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage * pageSize >= total}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
