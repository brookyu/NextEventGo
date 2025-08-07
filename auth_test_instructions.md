# Authentication Test Instructions

## Issue Fixed
The frontend was redirecting to login page because the authentication token wasn't being properly set in the API client.

## Changes Made

### 1. Updated API Client (`web/src/api/client.ts`)
- Added automatic token injection from localStorage in request interceptor
- Updated base URL to point to Go backend: `http://localhost:8080/api/v1`

### 2. Updated Auth Store (`web/src/store/authStore.ts`)
- Added `initialize()` method to restore token on app start
- Added automatic token setting in API client on login/logout
- Fixed API URL to use correct backend endpoint

### 3. Updated App Component (`web/src/App.tsx`)
- Added initialization call on app start
- Added debug logging for authentication state

## Testing Steps

### Step 1: Login
1. Open http://localhost:3001/login
2. Use credentials:
   - Username: `admin`
   - Password: `admin123`
3. Should redirect to dashboard after successful login

### Step 2: Access WeChat Users
1. Navigate to http://localhost:3001/users
2. Should NOT redirect to login page
3. Should display WeChat users list with real data

### Step 3: Verify API Calls
1. Open browser developer tools (F12)
2. Go to Network tab
3. Navigate to users page
4. Should see API calls to:
   - `GET http://localhost:8080/api/v1/users/statistics`
   - `GET http://localhost:8080/api/v1/users/`
5. All requests should have `Authorization: Bearer [token]` header

## Expected Results

### Authentication Flow
- ✅ Login page loads correctly
- ✅ Login with admin/admin123 works
- ✅ Token is stored in localStorage
- ✅ Token is automatically added to API requests
- ✅ Protected routes are accessible after login

### WeChat Users Page
- ✅ Page loads without redirect to login
- ✅ Statistics show: 18,014 total users
- ✅ User list displays real data
- ✅ Pagination works
- ✅ Search and filters functional

### API Integration
- ✅ All API calls include Authorization header
- ✅ Backend responds with real data
- ✅ Error handling works correctly

## Troubleshooting

### If still redirected to login:
1. Check browser console for errors
2. Verify localStorage has 'auth-storage' key
3. Check Network tab for failed API calls
4. Ensure backend is running on port 8080

### If API calls fail:
1. Verify backend is running: `go run ./cmd/api`
2. Check CORS settings
3. Verify token format in Authorization header

### If data doesn't load:
1. Check database connection
2. Verify MySQL is running
3. Check table name: `WeiChatUsers` (not `WeChatUsers`)

## Backend Status
- ✅ API server running on http://localhost:8080
- ✅ Database connected to NextEventDB6
- ✅ 18,014 WeChat users available
- ✅ Authentication endpoints working
- ✅ CORS configured for frontend

## Frontend Status
- ✅ Development server running on http://localhost:3001
- ✅ Authentication store configured
- ✅ API client configured
- ✅ WeChat users components ready
- ✅ Routing configured

## Next Steps After Login
1. Test all WeChat user management features
2. Verify create/edit/delete operations
3. Test filtering and search functionality
4. Check responsive design on mobile
5. Test error handling scenarios
