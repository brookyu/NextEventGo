import React from 'react'
import { Calendar, Radio, Key, Link, AlertCircle, Info, Copy } from 'lucide-react'

interface LiveConfigTabProps {
  formData: any
  errors: Record<string, string>
  onChange: (field: string, value: any) => void
}

const LiveConfigTab: React.FC<LiveConfigTabProps> = ({ formData, errors, onChange }) => {
  const [validationErrors, setValidationErrors] = React.useState<string[]>([])

  const validateDatesBeforeKeyGeneration = () => {
    const errors: string[] = []
    
    // Check for empty start date
    if (!formData.scheduledStartTime) {
      errors.push("Scheduled start time is required for live streaming")
    }
    
    // Validate date range if both dates are provided
    if (formData.scheduledStartTime && formData.videoEndTime) {
      const startTime = new Date(formData.scheduledStartTime)
      const endTime = new Date(formData.videoEndTime)
      
      if (endTime.getTime() <= startTime.getTime()) {
        errors.push("End time must be after start time")
      }
    }
    
    return errors
  }

  const generateStreamKey = () => {
    // Validate dates first
    const validationErrors = validateDatesBeforeKeyGeneration()
    if (validationErrors.length > 0) {
      console.error("Date validation failed:", validationErrors)
      return null
    }
    
    // Calculate key based on start and end time
    const startTime = new Date(formData.scheduledStartTime)
    const endTime = formData.videoEndTime ? new Date(formData.videoEndTime) : new Date(startTime.getTime() + 2 * 60 * 60 * 1000) // Default 2 hours
    
    // Use start time and duration in the key calculation
    const startTimestamp = startTime.getTime()
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000) // Duration in seconds
    const dateString = startTime.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD format
    
    return `nextevent_${dateString}_${startTimestamp}_${duration}`
  }

  const handleGenerateStreamKey = async () => {
    // Clear previous validation errors
    setValidationErrors([])
    
    // Validate dates before proceeding
    const dateValidationErrors = validateDatesBeforeKeyGeneration()
    if (dateValidationErrors.length > 0) {
      // Show validation errors to user
      setValidationErrors(dateValidationErrors)
      dateValidationErrors.forEach(error => console.error(error))
      return
    }

    // If we have a CloudVideo ID, use the API to generate a proper Ali Cloud stream key
    if (formData.id) {
      try {
        const response = await fetch(`http://localhost:8080/api/v2/cloud-videos/${formData.id}/generate-stream-key`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to generate stream key')
        }

        const result = await response.json()

        // Update form data with the new stream key and URLs
        onChange('streamKey', result.streamKey)
        onChange('cloudUrl', result.pushUrl)
        onChange('playbackUrl', result.playbackUrl)
        
        // Clear validation errors on success
        setValidationErrors([])

        // You could add a toast notification here
        console.log('Stream key generated successfully:', result)
      } catch (error) {
        console.error('Error generating stream key:', error)
        setValidationErrors(['Failed to generate stream key. Please try again.'])
        // Fallback to local generation
        const newStreamKey = generateStreamKey()
        if (newStreamKey) {
          onChange('streamKey', newStreamKey)
          setValidationErrors([]) // Clear errors on success
        }
      }
    } else {
      // For new CloudVideos, generate a temporary key
      const newStreamKey = generateStreamKey()
      if (newStreamKey) {
        onChange('streamKey', newStreamKey)
        setValidationErrors([]) // Clear errors on success
      }
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toISOString().slice(0, 16) // Format for datetime-local input
  }

  const handleDateTimeChange = (field: string, value: string) => {
    onChange(field, value ? new Date(value).toISOString() : '')
    // Clear validation errors when dates are changed
    if (validationErrors.length > 0) {
      setValidationErrors([])
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Radio className="w-5 h-5 text-red-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Live Streaming Configuration
            </h3>
            <p className="text-sm text-red-700 mt-1">
              Configure live streaming settings for this CloudVideo. Users will be able to watch the live stream and interact with bound content.
            </p>
          </div>
        </div>
      </div>

      {/* Streaming Schedule */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Streaming Schedule
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Time */}
          <div>
            <label htmlFor="scheduledStartTime" className="block text-sm font-medium text-gray-700 mb-2">
              Scheduled Start Time *
            </label>
            <input
              type="datetime-local"
              id="scheduledStartTime"
              value={formatDateTime(formData.scheduledStartTime)}
              onChange={(e) => handleDateTimeChange('scheduledStartTime', e.target.value)}
              className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.scheduledStartTime ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.scheduledStartTime && (
              <div className="flex items-center mt-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.scheduledStartTime}
              </div>
            )}
          </div>

          {/* End Time */}
          <div>
            <label htmlFor="videoEndTime" className="block text-sm font-medium text-gray-700 mb-2">
              Scheduled End Time
            </label>
            <input
              type="datetime-local"
              id="videoEndTime"
              value={formatDateTime(formData.videoEndTime)}
              onChange={(e) => handleDateTimeChange('videoEndTime', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional. If not set, defaults to 2 hours from start time.
            </p>
          </div>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Validation Errors
              </h3>
              <div className="text-sm text-red-700 mt-1">
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stream Key Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Key className="w-5 h-5 mr-2" />
          Stream Key Configuration
        </h3>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">
              Stream Key
            </label>
            <button
              type="button"
              onClick={handleGenerateStreamKey}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Generate New Key
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={formData.streamKey || ''}
              onChange={(e) => onChange('streamKey', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
              placeholder="Stream key will be generated automatically"
              readOnly
            />
            {formData.streamKey && (
              <button
                type="button"
                onClick={() => copyToClipboard(formData.streamKey)}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="Copy stream key"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="mt-3 text-xs text-gray-600">
            <p>This stream key will be used to authenticate your streaming software with the live streaming service.</p>
          </div>
        </div>
      </div>

      {/* Streaming URLs */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Link className="w-5 h-5 mr-2" />
          Streaming URLs
        </h3>

        <div className="space-y-3">
          {/* RTMP Push URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RTMP Push URL (for streaming software)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={formData.streamKey ? `rtmp://push.nextevent.com/live/${formData.streamKey}` : ''}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 font-mono text-sm"
                readOnly
              />
              {formData.streamKey && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(`rtmp://push.nextevent.com/live/${formData.streamKey}`)}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Copy RTMP URL"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Playback URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Playback URL (for viewers)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={formData.streamKey ? `rtmp://play.nextevent.com/live/${formData.streamKey}` : ''}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 font-mono text-sm"
                readOnly
              />
              {formData.streamKey && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(`rtmp://play.nextevent.com/live/${formData.streamKey}`)}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Copy playback URL"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Live Streaming Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Info className="w-5 h-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Live Streaming Setup Instructions
            </h3>
            <div className="text-sm text-blue-700 space-y-2">
              <div>
                <strong>1. Configure your streaming software:</strong>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Use the RTMP Push URL as your streaming server</li>
                  <li>Set your stream key in the streaming software</li>
                  <li>Configure video quality (recommended: 1080p, 30fps)</li>
                </ul>
              </div>
              <div>
                <strong>2. Test your stream:</strong>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Start streaming before the scheduled time to test</li>
                  <li>Check audio and video quality</li>
                  <li>Verify the playback URL works for viewers</li>
                </ul>
              </div>
              <div>
                <strong>3. Go live:</strong>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Start streaming at the scheduled time</li>
                  <li>Monitor viewer engagement and comments</li>
                  <li>Interact with bound content (articles, surveys)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stream Status Preview */}
      {formData.scheduledStartTime && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-800 mb-2">
            Stream Configuration Summary
          </h3>
          <div className="text-sm text-green-700 space-y-1">
            <p><strong>Start:</strong> {new Date(formData.scheduledStartTime).toLocaleString()}</p>
            {formData.videoEndTime && (
              <p><strong>End:</strong> {new Date(formData.videoEndTime).toLocaleString()}</p>
            )}
            <p><strong>Duration:</strong> {
              formData.videoEndTime 
                ? `${Math.round((new Date(formData.videoEndTime).getTime() - new Date(formData.scheduledStartTime).getTime()) / (1000 * 60))} minutes`
                : '2 hours (default)'
            }</p>
            <p><strong>Stream Key:</strong> {formData.streamKey ? 'Configured' : 'Not set'}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default LiveConfigTab
