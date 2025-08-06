import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, ArrowLeft, Calendar, FileText } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
// Textarea not needed for current implementation
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { siteEventsApi, CreateUpdateSiteEvent } from '../../api/siteEvents'
import { toast } from 'react-hot-toast'

// Import existing resource selectors
import SurveySelector from '../../components/surveys/SurveySelector'
import ArticleSelector from '../../components/articles/ArticleSelector'

const SiteEventFormPage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = id !== 'new' && !!id

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<CreateUpdateSiteEvent>({
    eventTitle: '',
    eventStartDate: '',
    eventEndDate: '',
    tagName: '',
  })

  // Resource selection states
  const [selectedResources, setSelectedResources] = useState({
    registerFormTitle: '',
    aboutEventTitle: '',
  })

  // Load event data for editing
  useEffect(() => {
    if (isEditing && id) {
      loadEventForEditing(id)
    }
  }, [isEditing, id])

  const loadEventForEditing = async (eventId: string) => {
    try {
      setLoading(true)
      const response = await siteEventsApi.getEventForEditing(eventId)
      if (response.success) {
        const event = response.data
        
        // Convert to form format
        setFormData({
          id: event.id,
          eventTitle: event.eventTitle,
          eventStartDate: event.eventStartDate,
          eventEndDate: event.eventEndDate,
          tagName: event.tagName || '',
          registerFormId: event.registerFormId || '',
          aboutEventId: event.aboutEventId || '',
          categoryId: event.categoryId || '',
        })

        // Set resource titles for display
        setSelectedResources({
          registerFormTitle: event.registerFormTitle || '',
          aboutEventTitle: event.aboutEventTitle || '',
        })
      }
    } catch (error) {
      console.error('Failed to load event:', error)
      toast.error('Failed to load event data')
    } finally {
      setLoading(false)
    }
  }

  // Handle form field changes
  const handleFieldChange = (field: keyof CreateUpdateSiteEvent, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle resource selection
  const handleResourceSelect = (field: keyof CreateUpdateSiteEvent, resourceId: string | null, title?: string) => {
    setFormData(prev => ({ ...prev, [field]: resourceId || undefined }))

    // Update title for display
    if (title !== undefined) {
      const titleField = field.replace('Id', 'Title') as keyof typeof selectedResources
      if (titleField in selectedResources) {
        setSelectedResources(prev => ({ ...prev, [titleField]: title }))
      }
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.eventTitle.trim()) {
      toast.error('Event title is required')
      return
    }
    
    if (!formData.eventStartDate) {
      toast.error('Event start date is required')
      return
    }
    
    if (!formData.eventEndDate) {
      toast.error('Event end date is required')
      return
    }

    // Validate date range
    if (new Date(formData.eventEndDate) <= new Date(formData.eventStartDate)) {
      toast.error('Event end date must be after start date')
      return
    }

    try {
      setSaving(true)

      // Prepare the data with proper UUID handling
      const submitData = {
        ...formData,
        // Ensure UUID fields are either valid UUIDs or undefined (will be omitted)
        registerFormId: formData.registerFormId || undefined,
        aboutEventId: formData.aboutEventId || undefined,
        agendaId: formData.agendaId || undefined,
        backgroundId: formData.backgroundId || undefined,
        instructionsId: formData.instructionsId || undefined,
        cloudVideoId: formData.cloudVideoId || undefined,
        categoryId: formData.categoryId || undefined,
      }

      if (isEditing && id) {
        await siteEventsApi.updateEvent(id, submitData)
        toast.success('Event updated successfully')
      } else {
        await siteEventsApi.createEvent(submitData)
        toast.success('Event created successfully')
      }
      
      navigate('/events')
    } catch (error: any) {
      console.error('Failed to save event:', error)
      toast.error(error.message || 'Failed to save event')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading event data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate('/events')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? 'Edit Event' : 'Create New Event'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? 'Update event details and resources' : 'Create a comprehensive event with resources'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Resources
            </TabsTrigger>

          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Event Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="eventTitle">Event Title *</Label>
                  <Input
                    id="eventTitle"
                    value={formData.eventTitle}
                    onChange={(e) => handleFieldChange('eventTitle', e.target.value)}
                    placeholder="Enter event title"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventStartDate">Start Date & Time *</Label>
                    <Input
                      id="eventStartDate"
                      type="datetime-local"
                      value={formData.eventStartDate ? new Date(formData.eventStartDate).toISOString().slice(0, 16) : ''}
                      onChange={(e) => handleFieldChange('eventStartDate', e.target.value ? new Date(e.target.value).toISOString() : '')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventEndDate">End Date & Time *</Label>
                    <Input
                      id="eventEndDate"
                      type="datetime-local"
                      value={formData.eventEndDate ? new Date(formData.eventEndDate).toISOString().slice(0, 16) : ''}
                      onChange={(e) => handleFieldChange('eventEndDate', e.target.value ? new Date(e.target.value).toISOString() : '')}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="tagName">Tag Name</Label>
                  <Input
                    id="tagName"
                    value={formData.tagName || ''}
                    onChange={(e) => handleFieldChange('tagName', e.target.value)}
                    placeholder="Enter tag name for WeChat integration"
                  />
                </div>


              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <CardTitle>Event Resources</CardTitle>
                <p className="text-sm text-gray-600">
                  Configure registration form and articles for your event
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Registration Form</Label>
                  <SurveySelector
                    selectedSurveyId={formData.registerFormId}
                    selectedSurveyTitle={selectedResources.registerFormTitle}
                    onSurveySelect={(id, survey) => handleResourceSelect('registerFormId', id || '', survey?.title)}
                    placeholder="Select registration form"
                    title="Select Registration Form"
                  />
                  {selectedResources.registerFormTitle && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected: {selectedResources.registerFormTitle}
                    </p>
                  )}
                </div>

                <div>
                  <Label>About Article</Label>
                  <ArticleSelector
                    selectedArticleId={formData.aboutEventId}
                    selectedArticleTitle={selectedResources.aboutEventTitle}
                    onArticleSelect={(id, article) => handleResourceSelect('aboutEventId', id || '', article?.title)}
                    placeholder="Select about article"
                    title="Select About Article"
                  />
                  {selectedResources.aboutEventTitle && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected: {selectedResources.aboutEventTitle}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>


        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/events')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Update Event' : 'Create Event'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default SiteEventFormPage
