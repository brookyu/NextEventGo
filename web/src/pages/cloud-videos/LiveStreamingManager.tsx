import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Radio, 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Users, 
  Eye, 
  MessageCircle,
  Calendar,
  Clock,
  Signal,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle,
  Copy,
  ExternalLink,
  Monitor,
  Smartphone,
  Volume2
} from 'lucide-react'

interface LiveStream {
  id: string
  title: string
  status: 'scheduled' | 'live' | 'ended' | 'error'
  scheduledStartTime: string
  actualStartTime?: string
  endTime?: string
  streamKey: string
  rtmpUrl: string
  playbackUrl: string
  viewerCount: number
  peakViewers: number
  chatEnabled: boolean
  recordingEnabled: boolean
  quality: string
  bitrate: number
}

const LiveStreamingManager: React.FC = () => {
  const [streams, setStreams] = useState<LiveStream[]>([])
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null)
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected')

  useEffect(() => {
    fetchStreams()
    // Simulate connection status updates
    const interval = setInterval(() => {
      setConnectionStatus(prev => {
        if (prev === 'disconnected') return 'connecting'
        if (prev === 'connecting') return 'connected'
        return 'connected'
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const fetchStreams = async () => {
    try {
      setLoading(true)
      // Mock stream data - in real implementation, this would come from API
      const mockStreams: LiveStream[] = [
        {
          id: '1',
          title: 'Product Launch Event',
          status: 'scheduled',
          scheduledStartTime: '2024-01-20T15:00:00Z',
          streamKey: 'nextevent_1705752000_abc123',
          rtmpUrl: 'rtmp://push.nextevent.com/live/nextevent_1705752000_abc123',
          playbackUrl: 'rtmp://play.nextevent.com/live/nextevent_1705752000_abc123',
          viewerCount: 0,
          peakViewers: 0,
          chatEnabled: true,
          recordingEnabled: true,
          quality: '1080p',
          bitrate: 3000
        },
        {
          id: '2',
          title: 'Weekly Team Meeting',
          status: 'live',
          scheduledStartTime: '2024-01-15T10:00:00Z',
          actualStartTime: '2024-01-15T10:02:00Z',
          streamKey: 'nextevent_1705320000_def456',
          rtmpUrl: 'rtmp://push.nextevent.com/live/nextevent_1705320000_def456',
          playbackUrl: 'rtmp://play.nextevent.com/live/nextevent_1705320000_def456',
          viewerCount: 45,
          peakViewers: 52,
          chatEnabled: true,
          recordingEnabled: false,
          quality: '720p',
          bitrate: 2000
        }
      ]
      setStreams(mockStreams)
      setSelectedStream(mockStreams[0])
    } catch (error) {
      console.error('Failed to fetch streams:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartStream = async (streamId: string) => {
    // TODO: Implement start stream functionality
    console.log('Starting stream:', streamId)
  }

  const handleStopStream = async (streamId: string) => {
    // TODO: Implement stop stream functionality
    console.log('Stopping stream:', streamId)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'text-red-600 bg-red-100'
      case 'scheduled': return 'text-blue-600 bg-blue-100'
      case 'ended': return 'text-gray-600 bg-gray-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <Wifi className="w-5 h-5 text-green-500" />
      case 'connecting': return <Signal className="w-5 h-5 text-yellow-500 animate-pulse" />
      case 'disconnected': return <WifiOff className="w-5 h-5 text-red-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Live Streaming Manager</h1>
              <p className="text-sm text-gray-500">Manage live streams and broadcasting</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getConnectionIcon()}
                <span className="text-sm text-gray-600 capitalize">{connectionStatus}</span>
              </div>
              <button className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <Radio className="w-4 h-4 mr-2" />
                Go Live
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stream List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Live Streams</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {streams.map((stream) => (
                  <div
                    key={stream.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedStream?.id === stream.id ? 'bg-primary-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedStream(stream)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 truncate">{stream.title}</h4>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(stream.status)}`}>
                        {stream.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {stream.viewerCount}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(stream.scheduledStartTime).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stream Details */}
          <div className="lg:col-span-2 space-y-6">
            {selectedStream && (
              <>
                {/* Stream Control */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedStream.title}</h2>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedStream.status)}`}>
                          {selectedStream.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          Scheduled: {new Date(selectedStream.scheduledStartTime).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {selectedStream.status === 'scheduled' && (
                        <button
                          onClick={() => handleStartStream(selectedStream.id)}
                          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Stream
                        </button>
                      )}
                      
                      {selectedStream.status === 'live' && (
                        <button
                          onClick={() => handleStopStream(selectedStream.id)}
                          className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <Square className="w-4 h-4 mr-2" />
                          End Stream
                        </button>
                      )}
                      
                      <button className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </button>
                    </div>
                  </div>

                  {/* Live Stats */}
                  {selectedStream.status === 'live' && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-red-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <Radio className="w-5 h-5 text-red-600 mr-2" />
                          <span className="text-sm font-medium text-red-800">LIVE</span>
                        </div>
                        <p className="text-xs text-red-600 mt-1">Broadcasting</p>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <Eye className="w-5 h-5 text-blue-600" />
                          <span className="text-lg font-bold text-blue-900">{selectedStream.viewerCount}</span>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">Current Viewers</p>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <Users className="w-5 h-5 text-green-600" />
                          <span className="text-lg font-bold text-green-900">{selectedStream.peakViewers}</span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">Peak Viewers</p>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <Clock className="w-5 h-5 text-purple-600" />
                          <span className="text-lg font-bold text-purple-900">
                            {selectedStream.actualStartTime ? 
                              Math.floor((Date.now() - new Date(selectedStream.actualStartTime).getTime()) / 60000) : 0
                            }m
                          </span>
                        </div>
                        <p className="text-xs text-purple-600 mt-1">Duration</p>
                      </div>
                    </div>
                  )}

                  {/* Stream URLs */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        RTMP Push URL (for streaming software)
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={selectedStream.rtmpUrl}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                          readOnly
                        />
                        <button
                          onClick={() => copyToClipboard(selectedStream.rtmpUrl)}
                          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                          title="Copy RTMP URL"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stream Key
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={selectedStream.streamKey}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                          readOnly
                        />
                        <button
                          onClick={() => copyToClipboard(selectedStream.streamKey)}
                          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                          title="Copy stream key"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Playback URL (for viewers)
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={selectedStream.playbackUrl}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                          readOnly
                        />
                        <button
                          onClick={() => copyToClipboard(selectedStream.playbackUrl)}
                          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                          title="Copy playback URL"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stream Settings */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Stream Configuration</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Quality Settings</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Resolution:</span>
                          <span className="font-medium">{selectedStream.quality}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Bitrate:</span>
                          <span className="font-medium">{selectedStream.bitrate} kbps</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Features</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Chat:</span>
                          <span className={`font-medium ${selectedStream.chatEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                            {selectedStream.chatEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Recording:</span>
                          <span className={`font-medium ${selectedStream.recordingEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                            {selectedStream.recordingEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveStreamingManager
