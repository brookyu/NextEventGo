# Article Management API v2

This document describes the Article Management API v2 endpoints with enhanced features including WeChat integration, analytics, and improved content management.

## Base URL
```
https://api.nextevent.com/api/v2
```

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Article Management Endpoints

### 1. Create Article
**POST** `/articles`

Creates a new article with enhanced features.

**Authentication:** Required

**Request Body:**
```json
{
  "title": "Article Title",
  "summary": "Article summary",
  "content": "<p>Article content in HTML</p>",
  "author": "Author Name",
  "categoryId": "uuid",
  "siteImageId": "uuid",
  "promotionPicId": "uuid",
  "jumpResourceId": "uuid",
  "metaTitle": "SEO Meta Title",
  "metaDescription": "SEO Meta Description",
  "keywords": "keyword1,keyword2",
  "tagIds": ["uuid1", "uuid2"],
  "createdBy": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Article created successfully",
  "data": {
    "id": "uuid",
    "title": "Article Title",
    "summary": "Article summary",
    "content": "<p>Article content in HTML</p>",
    "author": "Author Name",
    "categoryId": "uuid",
    "promotionCode": "ABC123",
    "isPublished": false,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 2. Get Article
**GET** `/articles/{id}`

Retrieves an article by ID with optional relationship loading.

**Authentication:** Optional (public articles)

**Query Parameters:**
- `include_category` (boolean): Include category information
- `include_tags` (boolean): Include tags information  
- `include_images` (boolean): Include images information
- `track_view` (boolean): Track this view for analytics

**Response:**
```json
{
  "success": true,
  "message": "Article retrieved successfully",
  "data": {
    "id": "uuid",
    "title": "Article Title",
    "content": "<p>Article content</p>",
    "author": "Author Name",
    "viewCount": 150,
    "readCount": 120,
    "category": {
      "id": "uuid",
      "name": "Category Name"
    }
  }
}
```

### 3. Get Article by Promotion Code
**GET** `/articles/promo/{code}`

Retrieves an article by its promotion code for marketing campaigns.

**Authentication:** Optional

**Query Parameters:**
- `track_view` (boolean): Track this view for analytics (default: true)

**Response:** Same as Get Article

### 4. List Articles
**GET** `/articles`

Retrieves a paginated list of articles.

**Authentication:** Optional (public articles only)

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20, max: 100)
- `include_category` (boolean): Include category information

**Response:**
```json
{
  "success": true,
  "message": "Articles retrieved successfully",
  "data": {
    "data": [
      {
        "id": "uuid",
        "title": "Article Title",
        "summary": "Article summary",
        "author": "Author Name"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### 5. Update Article
**PUT** `/articles/{id}`

Updates an existing article.

**Authentication:** Required

**Request Body:**
```json
{
  "title": "Updated Title",
  "summary": "Updated summary",
  "content": "<p>Updated content</p>",
  "updatedBy": "uuid"
}
```

**Response:** Same as Create Article

### 6. Delete Article
**DELETE** `/articles/{id}`

Deletes an article.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Article deleted successfully"
}
```

### 7. Publish Article
**POST** `/articles/{id}/publish`

Publishes an article, making it publicly available.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Article published successfully",
  "data": {
    "id": "uuid",
    "isPublished": true,
    "publishedAt": "2024-01-01T00:00:00Z"
  }
}
```

## WeChat Integration Endpoints

### 1. Generate QR Code
**POST** `/articles/{id}/wechat/qrcode`

Generates a WeChat QR code for article sharing.

**Authentication:** Required

**Query Parameters:**
- `type` (string): QR code type - "permanent" or "temporary" (default: permanent)

**Response:**
```json
{
  "success": true,
  "message": "QR code generated successfully",
  "data": {
    "id": "uuid",
    "resourceId": "uuid",
    "qrCodeUrl": "https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=...",
    "sceneStr": "article_12345678",
    "qrCodeType": "permanent",
    "scanCount": 0,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 2. Get QR Codes
**GET** `/articles/{id}/wechat/qrcodes`

Retrieves all QR codes for an article.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "QR codes retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "qrCodeUrl": "https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=...",
      "scanCount": 25,
      "isActive": true
    }
  ]
}
```

### 3. Prepare WeChat Content
**GET** `/articles/{id}/wechat/content`

Optimizes article content for WeChat platform.

**Authentication:** Optional

**Response:**
```json
{
  "success": true,
  "message": "WeChat content prepared successfully",
  "data": {
    "articleId": "uuid",
    "content": "<p>Optimized content for WeChat</p>"
  }
}
```

### 4. Get WeChat Share Info
**GET** `/articles/{id}/wechat/share-info`

Gets comprehensive sharing information for WeChat.

**Authentication:** Optional

**Response:**
```json
{
  "success": true,
  "message": "WeChat share info retrieved successfully",
  "data": {
    "articleId": "uuid",
    "optimizedContent": "<p>Optimized content</p>",
    "qrCodes": [],
    "shareUrl": "https://api.nextevent.com/api/v2/articles/uuid"
  }
}
```

### 5. Track QR Code Scan
**POST** `/articles/wechat/qrcodes/{qrcode_id}/scan`

Tracks when a QR code is scanned.

**Authentication:** Optional (public for WeChat callbacks)

**Request Body:**
```json
{
  "userId": "uuid",
  "openId": "wechat_open_id",
  "deviceType": "mobile",
  "platform": "wechat",
  "scanTime": "2024-01-01T00:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "QR code scan tracked successfully"
}
```

### 6. Revoke QR Code
**POST** `/articles/wechat/qrcodes/{qrcode_id}/revoke`

Revokes a QR code, making it inactive.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "QR code revoked successfully"
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Rate Limiting
- 60 requests per minute per IP address
- Rate limit headers included in responses:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time

## Features
- ✅ Article CRUD operations
- ✅ WeChat QR code generation and management
- ✅ Content optimization for WeChat
- ✅ QR code scan tracking and analytics
- ✅ Promotion code access for marketing
- ✅ Comprehensive validation and error handling
- ✅ Rate limiting and security headers
- ✅ Pagination and filtering
- ✅ Analytics tracking integration
