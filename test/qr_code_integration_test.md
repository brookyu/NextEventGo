# QR Code Integration Test Plan

## Overview
This document outlines the testing strategy for the WeChat QR code integration feature for articles and surveys.

## Test Environment Setup

### Prerequisites
1. Go backend server running
2. React frontend development server running
3. MySQL database with survey and article data
4. WeChat API credentials configured (for production testing)

### Test Data Requirements
- At least 2 published surveys
- At least 2 published articles
- Mobile device or browser developer tools for mobile simulation

## Backend API Tests

### 1. WeChat QR Code Generation APIs

#### Test Case 1.1: Create Temporary QR Code
```bash
# Test WeChat client QR code generation
curl -X POST "http://localhost:8080/api/v1/surveys/{survey_id}/wechat/qrcode?type=temporary" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

**Expected Result:**
- Status: 501 (Not Implemented) - placeholder response
- Response contains survey ID and message about WeChat integration

#### Test Case 1.2: Create Permanent QR Code
```bash
curl -X POST "http://localhost:8080/api/v1/surveys/{survey_id}/wechat/qrcode?type=permanent" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

**Expected Result:**
- Status: 501 (Not Implemented) - placeholder response
- Response contains survey ID and message about WeChat integration

#### Test Case 1.3: Get Survey QR Codes
```bash
curl -X GET "http://localhost:8080/api/v1/surveys/{survey_id}/wechat/qrcodes" \
  -H "Authorization: Bearer {token}"
```

**Expected Result:**
- Status: 501 (Not Implemented) - placeholder response
- Response contains survey ID

#### Test Case 1.4: Get Survey WeChat Share Info
```bash
curl -X GET "http://localhost:8080/api/v1/surveys/{survey_id}/wechat/share-info" \
  -H "Authorization: Bearer {token}"
```

**Expected Result:**
- Status: 501 (Not Implemented) - placeholder response
- Response contains survey ID

### 2. Mobile Preview Endpoints

#### Test Case 2.1: Survey Mobile Preview
```bash
curl -X GET "http://localhost:8080/api/v1/mobile/surveys/{survey_id}?qr=test-qr-id&source=qr"
```

**Expected Result:**
- Status: 200
- Content-Type: text/html
- HTML page with survey information
- QR code tracking information displayed
- Redirect script to React app

#### Test Case 2.2: Survey Participation Page
```bash
curl -X GET "http://localhost:8080/api/v1/mobile/surveys/{survey_id}/participate?qr=test-qr-id"
```

**Expected Result:**
- Status: 200
- Content-Type: text/html
- HTML page with survey participation info
- Redirect script to React app

#### Test Case 2.3: Article Mobile Preview
```bash
curl -X GET "http://localhost:8080/api/v1/mobile/articles/{article_id}?qr=test-qr-id&source=qr"
```

**Expected Result:**
- Status: 200
- Content-Type: text/html
- HTML page with article information
- QR code tracking information displayed

#### Test Case 2.4: Invalid Survey ID
```bash
curl -X GET "http://localhost:8080/api/v1/mobile/surveys/invalid-id"
```

**Expected Result:**
- Status: 400
- Error message about invalid survey ID

#### Test Case 2.5: Non-existent Survey
```bash
curl -X GET "http://localhost:8080/api/v1/mobile/surveys/00000000-0000-0000-0000-000000000000"
```

**Expected Result:**
- Status: 404
- HTML error page indicating survey not found

## Frontend Component Tests

### 3. Survey WeChat Panel Component

#### Test Case 3.1: Component Rendering
1. Navigate to a survey detail page
2. Verify SurveyWeChatPanel component loads
3. Check that QR Codes and Sharing tabs are present
4. Verify "Generate QR Code" button is visible

#### Test Case 3.2: QR Code Generation Dialog
1. Click "Generate QR Code" button
2. Verify dialog opens with QR code type selection
3. Test both "permanent" and "temporary" options
4. Click "Generate" button
5. Verify mock QR code is created (placeholder functionality)

#### Test Case 3.3: QR Code Display
1. Verify mock QR codes are displayed in grid layout
2. Check QR code image, status badge, and scan count
3. Test "Download" and "Revoke" buttons
4. Verify QR code actions work correctly

### 4. QR Code Display Components

#### Test Case 4.1: QRCodeDisplay Component
1. Test component with mock QR code data
2. Verify QR code image displays correctly
3. Test all action buttons (Download, Share, Preview, Revoke)
4. Check status badges for different QR code states

#### Test Case 4.2: QRCodeDisplayCompact Component
1. Test compact display in list view
2. Verify all essential information is visible
3. Test action buttons in compact mode

#### Test Case 4.3: QRCodeGenerator Component
1. Test QR code generation dialog
2. Verify radio button selection for QR type
3. Test generation process with loading state
4. Verify success/error handling

### 5. Mobile Preview Pages

#### Test Case 5.1: Mobile Article Preview
1. Open `/mobile/articles/{id}?qr=test-qr` in mobile browser/simulator
2. Verify mobile-optimized layout
3. Check article content displays correctly
4. Test QR code info banner
5. Verify action buttons (like, bookmark, share)
6. Test back navigation

#### Test Case 5.2: Mobile Survey Preview
1. Open `/mobile/surveys/{id}?qr=test-qr` in mobile browser/simulator
2. Verify survey information displays correctly
3. Check survey status and metadata
4. Test "Start Survey" button
5. Verify question preview section

#### Test Case 5.3: Mobile Survey Participation
1. Navigate from survey preview to participation page
2. Verify question navigation works
3. Test different question types (single choice, multiple choice, text, rating)
4. Test progress indicator
5. Verify survey submission flow

## Integration Tests

### 6. End-to-End QR Code Flow

#### Test Case 6.1: Complete Survey QR Code Flow
1. Create/select a published survey
2. Generate QR code via admin interface
3. Access mobile preview via QR code URL
4. Complete survey participation
5. Verify QR code scan tracking (when implemented)

#### Test Case 6.2: Complete Article QR Code Flow
1. Create/select a published article
2. Generate QR code via admin interface
3. Access mobile preview via QR code URL
4. Verify article content and interactions
5. Test sharing functionality

### 7. Error Handling Tests

#### Test Case 7.1: Network Error Handling
1. Test QR code generation with network issues
2. Verify error messages display correctly
3. Test retry functionality

#### Test Case 7.2: Invalid Data Handling
1. Test with invalid survey/article IDs
2. Test with expired QR codes
3. Test with revoked QR codes
4. Verify appropriate error pages display

## Performance Tests

### 8. Load Testing

#### Test Case 8.1: QR Code Generation Performance
1. Generate multiple QR codes simultaneously
2. Measure response times
3. Verify system stability

#### Test Case 8.2: Mobile Preview Performance
1. Test mobile page load times
2. Verify images load efficiently
3. Test on various mobile devices/browsers

## Security Tests

### 9. Security Validation

#### Test Case 9.1: QR Code Access Control
1. Test access to private surveys via QR codes
2. Verify authentication requirements
3. Test QR code parameter validation

#### Test Case 9.2: Mobile Preview Security
1. Test XSS prevention in mobile pages
2. Verify CSRF protection
3. Test input validation

## Test Results Documentation

### Expected Outcomes
- All API endpoints respond correctly (even with placeholder implementations)
- Mobile preview pages load and display properly
- Frontend components render without errors
- QR code generation flow works end-to-end
- Error handling works as expected

### Known Limitations
- WeChat API integration is mocked/placeholder
- QR code generation uses mock data
- Actual QR code scanning requires WeChat API credentials
- Survey submission is simulated

### Next Steps for Production
1. Implement actual WeChat API integration
2. Add real QR code generation with WeChat APIs
3. Implement QR code scan tracking
4. Add analytics and reporting
5. Optimize mobile page performance
6. Add comprehensive error logging

## Manual Testing Checklist

- [ ] Backend API endpoints respond correctly
- [ ] Mobile preview pages load properly
- [ ] Frontend components render without errors
- [ ] QR code generation dialog works
- [ ] Mobile survey participation flow works
- [ ] Error handling displays appropriate messages
- [ ] Mobile responsive design works on different screen sizes
- [ ] Navigation between pages works correctly
- [ ] All buttons and interactions function properly
- [ ] Loading states display correctly
