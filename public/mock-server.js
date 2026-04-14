// 启动命令：npm run mock
import 'dotenv/config'
import { createServer } from 'http'
import { Server } from 'socket.io'

const PORT = process.env.PORT || 10000
const httpServer = createServer()

const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? "https://echo-monitor-fawn.vercel.app/"
      : "*",
    methods: ['GET', 'POST']
  }
})

// 模拟固定设备列表
const devices = [
  { deviceId: 'DEV-001', baseTemp: 45, baseLoad: 40 },
  { deviceId: 'DEV-002', baseTemp: 55, baseLoad: 55 },
  { deviceId: 'DEV-003', baseTemp: 65, baseLoad: 70 }
]

// 模拟设备数据生成 - 基于设备基础值波动
function generateDeviceData(device) {
  // 温度波动 ±5°C
  const tempVariation = (Math.random() - 0.5) * 10
  const temperature = Math.max(0, Math.min(100, device.baseTemp + tempVariation))
  
  // 负载波动 ±15%
  const loadVariation = (Math.random() - 0.5) * 30
  const load = Math.max(0, Math.min(100, Math.floor(device.baseLoad + loadVariation)))
  
  // 随机小幅变化状态（只有5%概率状态突变）
  const statusRoll = Math.random()
  const status = statusRoll > 0.95 ? 'error'
                : statusRoll > 0.85 ? 'warning'
                : 'normal'
  
  return {
    deviceId: device.deviceId,
    timestamp: Date.now(),
    temperature: +temperature.toFixed(1),
    load,
    status
  }
}

// 所有设备数据
function generateAllDevicesData() {
  return devices.map(device => generateDeviceData(device))
}

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id)

  // 定时更新设备基础值（模拟设备负载变化）
  setInterval(() => {
    devices.forEach(device => {
      // 每隔一段时间，设备基础值缓慢变化
      device.baseTemp += (Math.random() - 0.5) * 4
      device.baseTemp = Math.max(30, Math.min(90, device.baseTemp))
      
      device.baseLoad += (Math.random() - 0.5) * 10
      device.baseLoad = Math.max(20, Math.min(95, device.baseLoad))
    })
  }, 5000)

  socket.on('heartbeat', () => {
    socket.emit('heartbeat:ack', { ts: Date.now() })
  })

  socket.on('request:data', () => {
    socket.emit('device:data', generateAllDevicesData())
  })

  // 每2秒推送所有设备数据
  const timer = setInterval(() => {
    socket.emit('device:data', generateAllDevicesData())
  }, 2000)

  socket.on('disconnect', () => {
    clearInterval(timer)
    console.log('🔌 Client disconnected:', socket.id)
  })
})

httpServer.listen(PORT, () => {
  console.log(`🚀 Mock server running at http://localhost:${PORT}`)
})
