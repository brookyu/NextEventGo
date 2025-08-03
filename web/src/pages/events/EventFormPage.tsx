import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save } from 'lucide-react'

import { eventsApi, type Event, type CreateEventRequest } from '@/api/events'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function EventFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const queryClient = useQueryClient()
  const isEditing = !!id

  // Form state
  const [formData, setFormData] = useState<CreateEventRequest>({
    eventTitle: '',
    eventStartDate: '',
    eventEndDate: '',
    tagName: '',
    userTagId: 1,
    interactionCode: '',
    scanMessage: '',
    isCurrent: false,
  })

  // Fetch event data if editing
  const { data: eventData, isLoading } = useQuery({
    queryKey: ['events', id],
    queryFn: () => eventsApi.getEvent(id!),
    enabled: isEditing,
  })

  // Update form data when event data is loaded
  useEffect(() => {
    if (eventData?.data) {
      const event = eventData.data
      setFormData({
        eventTitle: event.eventTitle,
        eventStartDate: event.eventStartDate.split('T')[0] + 'T' + event.eventStartDate.split('T')[1].slice(0, 5),
        eventEndDate: event.eventEndDate.split('T')[0] + 'T' + event.eventEndDate.split('T')[1].slice(0, 5),
        tagName: event.tagName,
        userTagId: event.userTagId,
        interactionCode: event.interactionCode,
        scanMessage: event.scanMessage,
        isCurrent: event.isCurrent,
      })
    }
  }, [eventData])

  // Create mutation
  const createMutation = useMutation({
    mutationFn: eventsApi.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      navigate('/events')
    },
    onError: (error) => {
      console.error('Failed to create event:', error)
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateEventRequest>) => eventsApi.updateEvent(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['events', id] })
      navigate('/events')
    },
    onError: (error) => {
      console.error('Failed to update event:', error)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Convert datetime-local format to ISO string
    const submitData = {
      ...formData,
      eventStartDate: new Date(formData.eventStartDate).toISOString(),
      eventEndDate: new Date(formData.eventEndDate).toISOString(),
    }

    if (isEditing) {
      updateMutation.mutate(submitData)
    } else {
      createMutation.mutate(submitData)
    }
  }

  const handleInputChange = (field: keyof CreateEventRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isEditing && isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/events')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Event' : 'Create Event'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Update event details' : 'Create a new event'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>
            Fill in the event information below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="eventTitle">Event Title</Label>
                <Input
                  id="eventTitle"
                  value={formData.eventTitle}
                  onChange={(e) => handleInputChange('eventTitle', e.target.value)}
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagName">Tag Name</Label>
                <Input
                  id="tagName"
                  value={formData.tagName}
                  onChange={(e) => handleInputChange('tagName', e.target.value)}
                  placeholder="Enter tag name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventStartDate">Start Date & Time</Label>
                <Input
                  id="eventStartDate"
                  type="datetime-local"
                  value={formData.eventStartDate}
                  onChange={(e) => handleInputChange('eventStartDate', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventEndDate">End Date & Time</Label>
                <Input
                  id="eventEndDate"
                  type="datetime-local"
                  value={formData.eventEndDate}
                  onChange={(e) => handleInputChange('eventEndDate', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userTagId">User Tag ID</Label>
                <Input
                  id="userTagId"
                  type="number"
                  value={formData.userTagId}
                  onChange={(e) => handleInputChange('userTagId', parseInt(e.target.value))}
                  placeholder="Enter user tag ID"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interactionCode">Interaction Code</Label>
                <Input
                  id="interactionCode"
                  value={formData.interactionCode}
                  onChange={(e) => handleInputChange('interactionCode', e.target.value)}
                  placeholder="Enter interaction code"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scanMessage">Scan Message</Label>
              <Input
                id="scanMessage"
                value={formData.scanMessage}
                onChange={(e) => handleInputChange('scanMessage', e.target.value)}
                placeholder="Enter scan message"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="isCurrent"
                type="checkbox"
                checked={formData.isCurrent}
                onChange={(e) => handleInputChange('isCurrent', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="isCurrent">Set as current event</Label>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : isEditing
                  ? 'Update Event'
                  : 'Create Event'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/events')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
