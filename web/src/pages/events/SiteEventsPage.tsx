import React, { useState, useEffect } from 'react'
import { Plus, Search, Calendar, Users, Eye, Edit, Trash2, Star, StarOff } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent } from '../../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { siteEventsApi, SiteEvent, SiteEventsListParams } from '../../api/siteEvents'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

const SiteEventsPage: React.FC = () => {
  const navigate = useNavigate()
  const [events, setEvents] = useState<SiteEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(0)

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Load events
  const loadEvents = async () => {
    try {
      setLoading(true)
      const params: SiteEventsListParams = {
        page: currentPage,
        pageSize,
        searchTerm: searchTerm || undefined,
        status: statusFilter as any || undefined,
        sortBy: sortBy as any,
        sortOrder,
      }

      const response = await siteEventsApi.getEvents(params)
      if (response.success) {
        setEvents(response.data.data)
        setTotal(response.data.total)
        setTotalPages(response.data.totalPages)
      }
    } catch (error) {
      console.error('Failed to load events:', error)
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  // Load events when filters change
  useEffect(() => {
    loadEvents()
  }, [currentPage, searchTerm, statusFilter, sortBy, sortOrder])

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page
  }

  // Handle status filter
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  // Handle sort change
  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
    setCurrentPage(1)
  }

  // Toggle current event
  const handleToggleCurrent = async (eventId: string) => {
    try {
      await siteEventsApi.toggleCurrentEvent(eventId)
      toast.success('Event status updated successfully')
      loadEvents() // Reload to reflect changes
    } catch (error) {
      console.error('Failed to toggle current event:', error)
      toast.error('Failed to update event status')
    }
  }

  // Delete event
  const handleDelete = async (eventId: string, eventTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${eventTitle}"?`)) {
      return
    }

    try {
      await siteEventsApi.deleteEvent(eventId)
      toast.success('Event deleted successfully')
      loadEvents()
    } catch (error) {
      console.error('Failed to delete event:', error)
      toast.error('Failed to delete event')
    }
  }

  // Get status badge variant
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

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Events Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your events, resources, and configurations
          </p>
        </div>
        <Button onClick={() => navigate('/events/new')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Events</p>
                <p className="text-2xl font-bold">
                  {events.filter(e => e.status === 'active').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold">
                  {events.filter(e => e.status === 'upcoming').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Event</p>
                <p className="text-2xl font-bold">
                  {events.filter(e => e.isCurrent).length}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search events by title or tags..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter || "all"} onValueChange={(value) => handleStatusFilter(value === "all" ? "" : value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('-')
              setSortBy(field)
              setSortOrder(order as 'asc' | 'desc')
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                <SelectItem value="title-asc">Title A-Z</SelectItem>
                <SelectItem value="title-desc">Title Z-A</SelectItem>
                <SelectItem value="startDate-desc">Start Date (Latest)</SelectItem>
                <SelectItem value="startDate-asc">Start Date (Earliest)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter 
                ? 'No events match your current filters.' 
                : 'Get started by creating your first event.'}
            </p>
            <Button onClick={() => navigate('/events/site-events/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{event.eventTitle}</h3>
                      {event.isCurrent && (
                        <Badge variant="default" className="bg-yellow-500">
                          <Star className="h-3 w-3 mr-1" />
                          Current
                        </Badge>
                      )}
                      {getStatusBadge(event.status)}
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>Start:</strong> {formatDate(event.eventStartDate)}
                      </p>
                      <p>
                        <strong>End:</strong> {formatDate(event.eventEndDate)}
                      </p>
                      {event.tags && (
                        <p>
                          <strong>Tags:</strong> {event.tags}
                        </p>
                      )}
                      {event.interactionCode && (
                        <p>
                          <strong>Interaction Code:</strong> {event.interactionCode}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleCurrent(event.id)}
                      title={event.isCurrent ? 'Remove as current event' : 'Set as current event'}
                    >
                      {event.isCurrent ? (
                        <StarOff className="h-4 w-4" />
                      ) : (
                        <Star className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/events/site-events/${event.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/events/site-events/${event.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(event.id, event.eventTitle)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages} ({total} total events)
          </span>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

export default SiteEventsPage
