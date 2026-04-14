// 启动命令：npm run mock
import 'dotenv/config'
import { createServer } from 'http'
import { Server } from 'socket.io'

const PORT = process.env.PORT || 10000
const httpServer = createServer()
// --- CORS 动态配置 ---
const io = new Server(httpServer, {
  cors: {
    // 如果是生产环境，只允许你的前端域名；否则允许所有（本地开发）
    origin: process.env.NODE_ENV === 'production'
      ? "https://echo-monitor-fawn.vercel.app/"
      : "*",
    methods: ['GET', 'POST']
  }
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

httpServer.listen(PORT, () => {
  console.log(`🚀 Mock server running at http://localhost:${PORT}`)
})