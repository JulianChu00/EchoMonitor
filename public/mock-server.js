// 启动命令：npm run mock
import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
})

// 模拟设备数据生成
function generateDeviceData() {
  const statusRoll = Math.random()
  const status = statusRoll > 0.95 ? 'error'
                : statusRoll > 0.8 ? 'warning'
                : 'normal'

  const baseTemp = status === 'error' ? 85 : status === 'warning' ? 70 : 45
  const baseLoad = status === 'error' ? 95 : status === 'warning' ? 75 : 40

  return {
    deviceId: 'DEV-' + Math.floor(Math.random() * 1000),
    timestamp: Date.now(),
    temperature: +(baseTemp + Math.random() * 10 - 5).toFixed(1),
    load: Math.min(100, Math.max(0, Math.floor(baseLoad + Math.random() * 20 - 10))),
    status
  }
}

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id)

  // 心跳响应
  socket.on('heartbeat', (data) => {
    socket.emit('heartbeat:ack', { ts: Date.now() })
  })

  // 手动请求数据
  socket.on('`request`:data', () => {
    socket.emit('device:data', generateDeviceData())
  })

  // 自动推送：每2秒推送一次
  const timer = setInterval(() => {
    socket.emit('device:data', generateDeviceData())
  }, 2000)

  socket.on('disconnect', () => {
    clearInterval(timer)
    console.log('🔌 Client disconnected:', socket.id)
  })
})

const PORT = 3001
httpServer.listen(PORT, () => {
  console.log(`🚀 Mock server running at http://localhost:${PORT}`)
})