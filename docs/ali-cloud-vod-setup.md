# Ali Cloud VOD Setup Guide

This guide explains how to configure Ali Cloud Video on Demand (VOD) service in the NextEvent Go application.

## Configuration Copied from Old .NET Project

The Ali Cloud settings have been copied from the original .NET project's `appsettings.json` files:

### From Production Settings (`appsettings.Production.json`):
```json
"ali": {
    "region": {
        "Id": "cn-shanghai"
    },
    "accesskey": {
        "Id": "YOUR_ACCESS_KEY_ID",
        "Secret": "YOUR_ACCESS_KEY_SECRET"
    }
}
```

### From Development Settings (`appsettings.Development.json`):
```json
"ali": {
    "region": {
        "Id": "cn-shanghai"
    },
    "accesskey": {
        "Id": "YOUR_ACCESS_KEY_ID",
        "Secret": "YOUR_ACCESS_KEY_SECRET"
    }
}
```

## Configuration in Go Project

### 1. YAML Configuration Files

The Ali Cloud settings are now available in all configuration files:

#### `configs/config.yaml` (default):
```yaml
ali_cloud:
  region:
    id: "cn-shanghai"
  access_key:
    id: "YOUR_ACCESS_KEY_ID"
    secret: "YOUR_ACCESS_KEY_SECRET"
  vod:
    enabled: false  # Default disabled
    endpoint: "vod.cn-shanghai.aliyuncs.com"
```

#### `configs/development.yaml`:
```yaml
ali_cloud:
  region:
    id: "cn-shanghai"
  access_key:
    id: "YOUR_ACCESS_KEY_ID"
    secret: "YOUR_ACCESS_KEY_SECRET"
  vod:
    enabled: false  # Disabled in development
    endpoint: "vod.cn-shanghai.aliyuncs.com"
```

#### `configs/production.yaml`:
```yaml
ali_cloud:
  region:
    id: "${ALI_CLOUD_REGION_ID}"
  access_key:
    id: "${ALI_CLOUD_ACCESS_KEY_ID}"
    secret: "${ALI_CLOUD_ACCESS_KEY_SECRET}"
  vod:
    enabled: "${ALI_CLOUD_VOD_ENABLED}"
    endpoint: "vod.cn-shanghai.aliyuncs.com"
```

### 2. Environment Variables

Add these environment variables to enable Ali Cloud VOD:

```bash
# Ali Cloud Configuration
ALI_CLOUD_REGION_ID=cn-shanghai
ALI_CLOUD_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
ALI_CLOUD_ACCESS_KEY_SECRET=YOUR_ACCESS_KEY_SECRET

# Enable Ali Cloud VOD
ALI_CLOUD_VOD_ENABLED=true
ALI_CLOUD_VOD_ENDPOINT=vod.cn-shanghai.aliyuncs.com
```

## How It Works

### 1. Development Mode (VOD Disabled)
- Videos are stored locally in `/uploads/videos/`
- PlaybackUrl points to local file: `/uploads/videos/filename.mp4`
- CoverUrl points to local cover: `/uploads/videos/covers/filename.jpg`

### 2. Production Mode (VOD Enabled)
- Videos are uploaded to Ali Cloud VOD
- Real Ali Cloud SDK integration gets actual PlaybackUrl and CoverUrl
- Asynchronous processing handles video processing delays
- Automatic retry mechanism for video info retrieval

### 3. Database Fields
The following fields in the `VideoUploads` table are populated:
- `PlaybackUrl`: The URL for video playback
- `CoverUrl`: The URL for video cover image
- `CloudUrl`: Alias for PlaybackUrl (for compatibility)

## Implementation Details

### Real SDK Integration
- Uses `github.com/alibabacloud-go/vod-20170321/v4` SDK
- Calls `CreateUploadVideo` API to get upload credentials
- Calls `GetVideoInfo` and `GetPlayInfo` APIs to get URLs
- Handles asynchronous video processing with retry mechanism

### Backward Compatibility
- Existing data remains compatible
- No database schema changes required
- Old videos continue to work
- New videos get proper Ali Cloud URLs when enabled

## Testing

### 1. Development Testing
```bash
# VOD disabled - uses local files
ALI_CLOUD_VOD_ENABLED=false
go run main.go
```

### 2. Production Testing
```bash
# VOD enabled - uses Ali Cloud
ALI_CLOUD_VOD_ENABLED=true
ALI_CLOUD_ACCESS_KEY_ID=your_key_id
ALI_CLOUD_ACCESS_KEY_SECRET=your_secret
go run main.go
```

## Security Notes

1. **Credentials**: The access key and secret are copied from the working .NET project
2. **Environment Variables**: Use environment variables in production for security
3. **Region**: Currently configured for `cn-shanghai` region
4. **Endpoint**: Uses the standard Ali Cloud VOD endpoint

## Troubleshooting

### Common Issues
1. **"VOD client not initialized"**: Check that `ALI_CLOUD_VOD_ENABLED=true`
2. **"Failed to get video info"**: Video may still be processing, check async logs
3. **Empty PlaybackUrl**: Video processing not complete, will be updated automatically

### Logs to Monitor
- `✅ Ali Cloud VOD client initialized successfully`
- `🚀 Uploading to Ali Cloud VOD: filename`
- `✅ Video processing completed! Updated PlaybackUrl and CoverUrl`
- `⚠️ Video still processing, will check later`

## Migration from .NET

The Go implementation maintains the same functionality as the .NET version:
- Same Ali Cloud credentials and region
- Same video processing workflow
- Same database fields and API responses
- Same asynchronous processing approach

This ensures a seamless migration from the .NET project to the Go project.
