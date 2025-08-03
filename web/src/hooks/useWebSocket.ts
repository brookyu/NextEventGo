import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
}

interface UseWebSocketReturn {
  socket: Socket | null
  isConnected: boolean
  sendMessage: (type: string, data: any) => void
  subscribe: (event: string, callback: (data: any) => void) => () => void
}

export function useWebSocket(enabled: boolean = true): UseWebSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { token } = useAuthStore()
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  useEffect(() => {
    // Temporarily disable WebSocket functionality
    console.log('WebSocket temporarily disabled')
    return

    if (!enabled || !token) {
      return
    }

    // Create socket connection
    const newSocket = io(import.meta.env.VITE_WS_URL || 'ws://localhost:8080', {
      auth: {
        token,
      },
      transports: ['websocket'],
      upgrade: true,
      rememberUpgrade: true,
    })

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('WebSocket connected')
      setIsConnected(true)
      reconnectAttempts.current = 0
      
      // Show connection success toast only after reconnection
      if (reconnectAttempts.current > 0) {
        toast.success('Connection restored')
      }
    })

    newSocket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason)
      setIsConnected(false)
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        newSocket.connect()
      }
    })

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      setIsConnected(false)
      
      reconnectAttempts.current++
      
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        toast.error('Connection failed. Please refresh the page.')
        newSocket.disconnect()
      }
    })

    // Real-time event handlers
    newSocket.on('event:created', (data) => {
      toast.success(`New event created: ${data.title}`)
    })

    newSocket.on('event:updated', (data) => {
      toast.success(`Event updated: ${data.title}`)
    })

    newSocket.on('attendee:checkin', (data) => {
      toast.success(`${data.userName} checked in to ${data.eventTitle}`)
    })

    newSocket.on('wechat:message', (data) => {
      // Handle WeChat message notifications
      console.log('WeChat message received:', data)
    })

    newSocket.on('system:notification', (data) => {
      switch (data.type) {
        case 'info':
          toast(data.message)
          break
        case 'success':
          toast.success(data.message)
          break
        case 'warning':
          toast(data.message, { icon: '⚠️' })
          break
        case 'error':
          toast.error(data.message)
          break
        default:
          toast(data.message)
      }
    })

    setSocket(newSocket)

    // Cleanup on unmount
    return () => {
      newSocket.disconnect()
      setSocket(null)
      setIsConnected(false)
    }
  }, [enabled, token])

  const sendMessage = (type: string, data: any) => {
    if (socket && isConnected) {
      socket.emit(type, data)
    } else {
      console.warn('WebSocket not connected, cannot send message')
    }
  }

  const subscribe = (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback)
      
      // Return unsubscribe function
      return () => {
        socket.off(event, callback)
      }
    }
    
    return () => {}
  }

  return {
    socket,
    isConnected,
    sendMessage,
    subscribe,
  }
}
