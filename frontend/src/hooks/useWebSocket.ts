import { useState, useEffect, useRef, useCallback } from 'react';

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: Date;
}

interface WebSocketOptions {
  enabled?: boolean;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (data: any) => void;
  protocols?: string | string[];
}

interface UseWebSocketReturn {
  isConnected: boolean;
  connectionStatus: WebSocketStatus;
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: any) => void;
  disconnect: () => void;
  reconnect: () => void;
}

export const useWebSocket = (
  url: string,
  options: WebSocketOptions = {}
): UseWebSocketReturn => {
  const {
    enabled = true,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    heartbeatInterval = 30000,
    onOpen,
    onClose,
    onError,
    onMessage,
    protocols
  } = options;

  const [connectionStatus, setConnectionStatus] = useState<WebSocketStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isManuallyClosedRef = useRef(false);

  // Get WebSocket URL
  const getWebSocketUrl = useCallback(() => {
    if (url.startsWith('ws://') || url.startsWith('wss://')) {
      return url;
    }

    // Convert relative URL to WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}${url.startsWith('/') ? url : `/${url}`}`;
    
    return wsUrl;
  }, [url]);

  // Send heartbeat to keep connection alive
  const sendHeartbeat = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }));
    }
  }, []);

  // Start heartbeat
  const startHeartbeat = useCallback(() => {
    if (heartbeatInterval > 0) {
      heartbeatTimeoutRef.current = setInterval(sendHeartbeat, heartbeatInterval);
    }
  }, [sendHeartbeat, heartbeatInterval]);

  // Stop heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearInterval(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!enabled || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      setConnectionStatus('connecting');
      
      const wsUrl = getWebSocketUrl();
      wsRef.current = new WebSocket(wsUrl, protocols);

      wsRef.current.onopen = (event) => {
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        isManuallyClosedRef.current = false;
        startHeartbeat();
        onOpen?.(event);
      };

      wsRef.current.onclose = (event) => {
        setConnectionStatus('disconnected');
        stopHeartbeat();
        onClose?.(event);

        // Attempt to reconnect if not manually closed
        if (!isManuallyClosedRef.current && reconnectAttemptsRef.current < reconnectAttempts) {
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      wsRef.current.onerror = (event) => {
        setConnectionStatus('error');
        stopHeartbeat();
        onError?.(event);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle heartbeat response
          if (data.type === 'pong') {
            return;
          }

          const message: WebSocketMessage = {
            type: data.type || 'message',
            data: data.data || data,
            timestamp: new Date(data.timestamp || Date.now())
          };

          setLastMessage(message);
          onMessage?.(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('error');
    }
  }, [
    enabled,
    getWebSocketUrl,
    protocols,
    reconnectAttempts,
    reconnectInterval,
    startHeartbeat,
    stopHeartbeat,
    onOpen,
    onClose,
    onError,
    onMessage
  ]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    isManuallyClosedRef.current = true;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    stopHeartbeat();

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setConnectionStatus('disconnected');
  }, [stopHeartbeat]);

  // Reconnect to WebSocket
  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    setTimeout(connect, 100);
  }, [disconnect, connect]);

  // Send message through WebSocket
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const messageToSend = typeof message === 'string' 
        ? message 
        : JSON.stringify({
            ...message,
            timestamp: new Date().toISOString()
          });
      
      wsRef.current.send(messageToSend);
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
    }
  }, []);

  // Connect on mount and when enabled changes
  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isManuallyClosedRef.current = true;
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      stopHeartbeat();
      
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [stopHeartbeat]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, reduce activity
        stopHeartbeat();
      } else {
        // Page is visible, resume activity
        if (connectionStatus === 'connected') {
          startHeartbeat();
        } else if (enabled && connectionStatus === 'disconnected') {
          // Try to reconnect if disconnected
          connect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [connectionStatus, enabled, connect, startHeartbeat, stopHeartbeat]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      if (enabled && connectionStatus === 'disconnected') {
        reconnect();
      }
    };

    const handleOffline = () => {
      setConnectionStatus('disconnected');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enabled, connectionStatus, reconnect]);

  return {
    isConnected: connectionStatus === 'connected',
    connectionStatus,
    lastMessage,
    sendMessage,
    disconnect,
    reconnect
  };
};

// Hook for managing multiple WebSocket connections
export const useMultipleWebSockets = (
  connections: Array<{ url: string; options?: WebSocketOptions }>
) => {
  const [sockets, setSockets] = useState<Record<string, UseWebSocketReturn>>({});

  useEffect(() => {
    const newSockets: Record<string, UseWebSocketReturn> = {};
    
    connections.forEach(({ url, options }) => {
      // This would need to be implemented differently in a real scenario
      // as hooks can't be called conditionally
      // newSockets[url] = useWebSocket(url, options);
    });

    setSockets(newSockets);
  }, [connections]);

  return sockets;
};

// Utility function to create WebSocket URL
export const createWebSocketUrl = (path: string, params?: Record<string, string>) => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  let url = `${protocol}//${host}${path.startsWith('/') ? path : `/${path}`}`;
  
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }
  
  return url;
};

// Hook for WebSocket with automatic JSON parsing
export const useJsonWebSocket = (url: string, options: WebSocketOptions = {}) => {
  const { onMessage, ...restOptions } = options;
  
  const handleMessage = useCallback((data: any) => {
    try {
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      onMessage?.(parsedData);
    } catch (error) {
      console.error('Failed to parse JSON message:', error);
      onMessage?.(data);
    }
  }, [onMessage]);

  return useWebSocket(url, {
    ...restOptions,
    onMessage: handleMessage
  });
};
