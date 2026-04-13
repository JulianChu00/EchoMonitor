import { io, Socket } from 'socket.io-client'
import type { DeviceData } from '@/types'

class SocketService {
  private socket: Socket | null = null
  private reconnectCount = 0
  private readonly MAX_RECONNECT = 5

  connect(url: string, callbacks: {
    onConnect?: () => void
    onData?: (data: DeviceData) => void
    onError?: (err: Error) => void
    onDisconnect?: () => void
  }) {
    this.socket = io(url, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.MAX_RECONNECT,
      reconnectionDelay: 1000
    })

    this.socket.on('connect', () => {
      console.log('✅ Socket connected')
      this.reconnectCount = 0
      callbacks.onConnect?.()
    })

    this.socket.on('device:data', (data: DeviceData) => {
      callbacks.onData?.(data)
    })

    this.socket.on('connect_error', (err: Error) => {
      console.error('❌ Connection error:', err)
      callbacks.onError?.(err)
    })

    this.socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected')
      callbacks.onDisconnect?.()
    })

    // 心跳保活
    this.heartbeat()
  }

  private heartbeat() {
    setInterval(() => {
      this.socket?.emit('heartbeat', { ts: Date.now() })
    }, 30000)
  }

  disconnect() {
    this.socket?.disconnect()
    this.socket = null
  }

  emit(event: string, data?: any) {
    this.socket?.emit(event, data)
  }
}

export default new SocketService()