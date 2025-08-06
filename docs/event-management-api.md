# Event Management API Documentation

## Overview

The Event Management API provides comprehensive functionality for managing site events in the NextEvent system. This API is built on top of the existing MySQL database and maintains full compatibility with the legacy .NET backend while providing enhanced features and better performance.

## Base URL

```
http://localhost:8080/api/v2/site-events
```

## Authentication

All endpoints require proper authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 1. List Events

**GET** `/api/v2/site-events`

Retrieve a paginated list of events with advanced filtering options.

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number for pagination |
| `pageSize` | integer | No | 20 | Number of items per page |
| `categoryId` | UUID | No | - | Filter by category ID |
| `searchTerm` | string | No | - | Search in event title and tags |
| `status` | string | No | - | Filter by status: `upcoming`, `active`, `completed`, `cancelled` |
| `isCurrent` | boolean | No | - | Filter by current event status |
| `startDateFrom` | ISO 8601 | No | - | Filter events starting from this date |
| `startDateTo` | ISO 8601 | No | - | Filter events starting before this date |
| `sortBy` | string | No | `createdAt` | Sort field: `title`, `startDate`, `endDate`, `createdAt` |
| `sortOrder` | string | No | `desc` | Sort order: `asc`, `desc` |

#### Example Request

```bash
curl -X GET "http://localhost:8080/api/v2/site-events?page=1&pageSize=10&searchTerm=conference&status=upcoming" \
  -H "Authorization: Bearer <token>"
```

#### Example Response

```json
{
  "success": true,
  "message": "Events retrieved successfully",
  "data": {
    "data": [
      {
        "id": "3a16d581-08e4-4bc4-807f-6fd675a9a3a4",
        "eventTitle": "Tech Conference 2025",
        "eventStartDate": "2025-08-10T10:00:00Z",
        "eventEndDate": "2025-08-10T18:00:00Z",
        "isCurrent": true,
        "tags": "tech,conference,innovation",
        "createdAt": "2025-01-15T09:30:00Z",
        "status": "upcoming",
        "interactionCode": "1754410087",
        "categoryId": "550e8400-e29b-41d4-a716-446655440000"
      }
    ],
    "total": 98,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}
```

### 2. Get Current Event

**GET** `/api/v2/site-events/current`

Retrieve the currently active event.

#### Example Response

```json
{
  "success": true,
  "message": "Current event retrieved successfully",
  "data": {
    "id": "3a16d581-08e4-4bc4-807f-6fd675a9a3a4",
    "eventTitle": "Current Active Event",
    "eventStartDate": "2025-08-05T10:00:00Z",
    "eventEndDate": "2025-08-05T18:00:00Z",
    "isCurrent": true,
    "tags": "current,active",
    "createdAt": "2025-01-15T09:30:00Z",
    "status": "active",
    "interactionCode": "1754410087"
  }
}
```

### 3. Get Single Event

**GET** `/api/v2/site-events/{id}`

Retrieve a specific event by its ID.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Event ID |

### 4. Get Event for Editing

**GET** `/api/v2/site-events/{id}/for-editing`

Retrieve an event with all associated resource information for editing purposes.

#### Example Response

```json
{
  "success": true,
  "message": "Event retrieved for editing successfully",
  "data": {
    "id": "3a16d581-08e4-4bc4-807f-6fd675a9a3a4",
    "eventTitle": "Tech Conference 2025",
    "eventStartDate": "2025-08-10T10:00:00Z",
    "eventEndDate": "2025-08-10T18:00:00Z",
    "tagName": "tech-conference",
    "agendaArticleTitle": "Conference Agenda",
    "agendaId": "550e8400-e29b-41d4-a716-446655440001",
    "backgroundArticleTitle": "Event Background",
    "backgroundId": "550e8400-e29b-41d4-a716-446655440002",
    "aboutArticleTitle": "About This Event",
    "aboutArticleId": "550e8400-e29b-41d4-a716-446655440003",
    "instructionsArticleTitle": "Event Instructions",
    "instructionsId": "550e8400-e29b-41d4-a716-446655440004",
    "surveyTitle": "Event Feedback Survey",
    "surveyId": "550e8400-e29b-41d4-a716-446655440005",
    "registerFormTitle": "Registration Form",
    "registerFormId": "550e8400-e29b-41d4-a716-446655440006",
    "cloudVideoTitle": "Event Live Stream",
    "cloudVideoId": "550e8400-e29b-41d4-a716-446655440007",
    "tags": "tech,conference,innovation",
    "categoryId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### 5. Create Event

**POST** `/api/v2/site-events`

Create a new event.

#### Request Body

```json
{
  "eventTitle": "New Tech Conference",
  "eventStartDate": "2025-09-15T10:00:00Z",
  "eventEndDate": "2025-09-15T18:00:00Z",
  "tagName": "tech-conf-2025",
  "agendaId": "550e8400-e29b-41d4-a716-446655440001",
  "backgroundId": "550e8400-e29b-41d4-a716-446655440002",
  "aboutEventId": "550e8400-e29b-41d4-a716-446655440003",
  "instructionsId": "550e8400-e29b-41d4-a716-446655440004",
  "surveyId": "550e8400-e29b-41d4-a716-446655440005",
  "registerFormId": "550e8400-e29b-41d4-a716-446655440006",
  "cloudVideoId": "550e8400-e29b-41d4-a716-446655440007",
  "categoryId": "550e8400-e29b-41d4-a716-446655440000",
  "tags": "tech,conference,innovation,2025"
}
```

#### Required Fields

- `eventTitle`: Event title (string)
- `eventStartDate`: Event start date (ISO 8601)
- `eventEndDate`: Event end date (ISO 8601)

#### Example Response

```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "id": "af5a98de-c840-4f97-8511-3a8878ad0b2e",
    "eventTitle": "New Tech Conference",
    "eventStartDate": "2025-09-15T10:00:00Z",
    "eventEndDate": "2025-09-15T18:00:00Z",
    "isCurrent": false,
    "tags": "tech,conference,innovation,2025",
    "createdAt": "2025-08-06T00:08:07Z",
    "status": "upcoming",
    "interactionCode": "1754410087"
  }
}
```

### 6. Update Event

**PUT** `/api/v2/site-events/{id}`

Update an existing event.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Event ID |

#### Request Body

Same as create event, but with the event ID included.

### 7. Delete Event

**DELETE** `/api/v2/site-events/{id}`

Soft delete an event (sets `IsDeleted` to true).

#### Example Response

```json
{
  "success": true,
  "message": "Event deleted successfully",
  "data": null
}
```

### 8. Toggle Current Event

**POST** `/api/v2/site-events/{id}/toggle-current`

Set an event as the current active event. This will unset any previously current event.

#### Example Response

```json
{
  "success": true,
  "message": "Current event status updated successfully",
  "data": null
}
```

## Event Status Values

Events automatically have their status calculated based on dates:

- **`upcoming`**: Event start date is in the future
- **`active`**: Current time is between start and end dates
- **`completed`**: Event end date is in the past
- **`cancelled`**: Event is soft deleted (`IsDeleted = true`)

## Resource Associations

Events can be associated with various resources:

- **Agenda**: Article containing event agenda
- **Background**: Article with event background information
- **About Event**: Article describing the event
- **Instructions**: Article with event instructions
- **Survey**: Survey for event feedback
- **Register Form**: Survey used as registration form
- **Cloud Video**: Live stream or recorded video
- **Category**: Event category for organization

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

Common HTTP status codes:
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (missing or invalid token)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

## Database Compatibility

This API maintains full compatibility with the existing SiteEvents table structure:
- All existing data is preserved
- No schema changes required
- Supports all existing fields and relationships
- Maintains audit trail (creation/modification timestamps)

## Integration with Resource Selectors

The API is designed to work seamlessly with existing resource selector components:
- Article picker for agenda, background, about, and instructions
- Survey picker for surveys and registration forms
- Video picker for cloud videos
- Category picker for event categorization
