# Frontend Integration Guide - Site Events Management

## Overview

This guide covers the complete frontend implementation for the Site Events Management system, integrating with the new Go backend API endpoints.

## Architecture

### API Client Layer (`web/src/api/siteEvents.ts`)

The API client provides a comprehensive interface to the Site Events backend:

```typescript
// Core interfaces
interface SiteEvent {
  id: string
  eventTitle: string
  eventStartDate: string
  eventEndDate: string
  isCurrent: boolean
  tags: string
  status: 'upcoming' | 'active' | 'completed' | 'cancelled'
  interactionCode: string
}

interface SiteEventForEditing {
  // Includes all resource associations with titles
  agendaArticleTitle?: string
  backgroundArticleTitle?: string
  // ... other resource associations
}

// API methods
siteEventsApi.getEvents(params)      // Paginated list with filtering
siteEventsApi.getCurrentEvent()      // Get current active event
siteEventsApi.getEvent(id)          // Get single event
siteEventsApi.getEventForEditing(id) // Get event with resources
siteEventsApi.createEvent(data)     // Create new event
siteEventsApi.updateEvent(id, data) // Update existing event
siteEventsApi.deleteEvent(id)       // Soft delete event
siteEventsApi.toggleCurrentEvent(id) // Toggle current status
```

### Component Architecture

#### 1. Site Events List Page (`SiteEventsPage.tsx`)

**Features:**
- **Advanced Filtering**: Search, status filter, sorting options
- **Real-time Statistics**: Total events, active events, upcoming events
- **Pagination**: Ant Design compatible pagination
- **Bulk Actions**: Toggle current status, edit, delete
- **Responsive Design**: Mobile-friendly layout

**Key Components:**
```typescript
// Statistics cards
<Card>Total Events: {total}</Card>
<Card>Active Events: {activeCount}</Card>
<Card>Upcoming Events: {upcomingCount}</Card>

// Advanced filtering
<Input placeholder="Search events..." />
<Select placeholder="Filter by status" />
<Select placeholder="Sort by" />

// Event cards with actions
<Card>
  <Button onClick={toggleCurrent}>Set Current</Button>
  <Button onClick={edit}>Edit</Button>
  <Button onClick={delete}>Delete</Button>
</Card>
```

#### 2. Site Event Form Page (`SiteEventFormPage.tsx`)

**Features:**
- **Tabbed Interface**: Basic Info, Resources, Media, Settings
- **Resource Integration**: Article, video, survey selectors
- **Validation**: Comprehensive form validation
- **Date/Time Handling**: Proper timezone support
- **Tag Management**: Dynamic tag selection

**Tab Structure:**
```typescript
<Tabs>
  <TabsContent value="basic">
    // Event title, dates, tags
  </TabsContent>
  <TabsContent value="resources">
    // Article selectors for agenda, background, etc.
  </TabsContent>
  <TabsContent value="media">
    // Video selector for cloud videos
  </TabsContent>
  <TabsContent value="settings">
    // Survey and form selectors
  </TabsContent>
</Tabs>
```

#### 3. Site Event Detail Page (`SiteEventDetailPage.tsx`)

**Features:**
- **Comprehensive View**: All event details and associations
- **Resource Display**: Shows associated articles, videos, surveys
- **Status Management**: Visual status indicators and actions
- **Quick Actions**: QR code generation, sharing, attendee management
- **Responsive Layout**: Sidebar with event metadata

## Integration Points

### 1. Resource Selectors

The form integrates with existing resource selector components:

```typescript
// Article selector for event resources
<SourceArticleSelector
  selectedArticleId={formData.agendaId}
  onArticleSelect={(id, title) => handleResourceSelect('agendaId', id, title)}
  placeholder="Select agenda article"
/>

// Video selector for media resources
<VideoSelector
  selectedVideoId={formData.cloudVideoId}
  onVideoSelect={(id, title) => handleResourceSelect('cloudVideoId', id, title)}
  placeholder="Select event video"
/>
```

### 2. Navigation Integration

Added to the main navigation sidebar:

```typescript
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Site Events', href: '/events/site-events', icon: CalendarDays }, // New
  { name: 'Attendees', href: '/attendees', icon: Users },
  // ...
]
```

### 3. Routing Configuration

Complete routing setup in `App.tsx`:

```typescript
// Site Events Management routes
<Route path="/events/site-events" element={<SiteEventsPage />} />
<Route path="/events/site-events/new" element={<SiteEventFormPage />} />
<Route path="/events/site-events/:id" element={<SiteEventDetailPage />} />
<Route path="/events/site-events/:id/edit" element={<SiteEventFormPage />} />
```

## Key Features Implemented

### 1. Advanced Filtering and Search

```typescript
// Search functionality
const handleSearch = (value: string) => {
  setSearchTerm(value)
  setCurrentPage(1) // Reset pagination
}

// Status filtering
const statusOptions = ['upcoming', 'active', 'completed', 'cancelled']

// Sorting options
const sortOptions = [
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'title-asc', label: 'Title A-Z' },
  { value: 'startDate-desc', label: 'Start Date (Latest)' },
]
```

### 2. Real-time Status Calculation

```typescript
// Dynamic status based on dates
const getEventStatus = (startDate: string, endDate: string) => {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (now < start) return 'upcoming'
  if (now >= start && now <= end) return 'active'
  if (now > end) return 'completed'
  return 'draft'
}
```

### 3. Resource Association Management

```typescript
// Handle resource selection with title tracking
const handleResourceSelect = (field: string, resourceId: string, title?: string) => {
  setFormData(prev => ({ ...prev, [field]: resourceId }))
  
  // Update display title
  if (title) {
    const titleField = field.replace('Id', 'Title')
    setSelectedResources(prev => ({ ...prev, [titleField]: title }))
  }
}
```

### 4. Form Validation

```typescript
// Comprehensive validation
const validateForm = () => {
  if (!formData.eventTitle.trim()) {
    toast.error('Event title is required')
    return false
  }
  
  if (new Date(formData.eventEndDate) <= new Date(formData.eventStartDate)) {
    toast.error('Event end date must be after start date')
    return false
  }
  
  return true
}
```

## UI/UX Features

### 1. Responsive Design
- Mobile-first approach
- Collapsible sidebar on mobile
- Touch-friendly buttons and inputs
- Responsive grid layouts

### 2. Loading States
```typescript
// Loading indicators
{loading ? (
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
) : (
  <EventsList />
)}
```

### 3. Error Handling
```typescript
// Comprehensive error handling
try {
  await siteEventsApi.createEvent(formData)
  toast.success('Event created successfully')
} catch (error: any) {
  toast.error(error.message || 'Failed to create event')
}
```

### 4. Status Badges
```typescript
// Visual status indicators
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'upcoming': return <Badge variant="secondary">Upcoming</Badge>
    case 'active': return <Badge variant="default">Active</Badge>
    case 'completed': return <Badge variant="outline">Completed</Badge>
    case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>
  }
}
```

## Performance Optimizations

### 1. Efficient API Calls
- Debounced search input
- Pagination to limit data transfer
- Selective field loading for different views

### 2. State Management
- Local state for UI interactions
- API state synchronization
- Optimistic updates where appropriate

### 3. Component Optimization
- Memoized expensive calculations
- Conditional rendering for large lists
- Lazy loading for resource selectors

## Testing Strategy

### 1. Component Testing
```typescript
// Test event list rendering
test('renders event list with pagination', () => {
  render(<SiteEventsPage />)
  expect(screen.getByText('Site Events Management')).toBeInTheDocument()
})

// Test form validation
test('validates required fields', () => {
  render(<SiteEventFormPage />)
  fireEvent.click(screen.getByText('Create Event'))
  expect(screen.getByText('Event title is required')).toBeInTheDocument()
})
```

### 2. Integration Testing
- API endpoint integration
- Resource selector integration
- Navigation flow testing

### 3. E2E Testing
- Complete event creation workflow
- Event editing and updating
- Event deletion and status management

## Deployment Considerations

### 1. Environment Configuration
```typescript
// API base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v2'
```

### 2. Build Optimization
- Code splitting for large components
- Asset optimization
- Bundle size monitoring

### 3. Browser Compatibility
- Modern browser support (ES2020+)
- Polyfills for older browsers if needed
- Progressive enhancement approach

## Future Enhancements

### 1. Advanced Features
- Event analytics dashboard
- Bulk event operations
- Event templates
- Advanced reporting

### 2. User Experience
- Drag-and-drop event scheduling
- Calendar view integration
- Real-time collaboration
- Mobile app support

### 3. Integration Expansions
- WeChat integration enhancements
- Third-party calendar sync
- Email notification system
- Advanced permission management

## Conclusion

The Site Events Management frontend provides a comprehensive, user-friendly interface for managing events with full integration to the Go backend API. The implementation follows modern React patterns, provides excellent user experience, and maintains high performance standards.

The system is production-ready and can be immediately deployed for event management operations.
