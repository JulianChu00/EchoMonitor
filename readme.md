# 📦 简易设备监控面板项目规范文档
> Vue3 + TypeScript + ECharts + Socket.io 实战模板
> 🎯 目标：2个实时图表 + 模拟数据推送 + 响应式布局
> 🤖 用途：直接复制本文档给任意代码生成AI，即可输出完整可运行项目

---

## 📋 项目概览

| 配置项 | 值 |
|--------|-----|
| 框架 | Vue 3.4 + `<script setup>` + TypeScript |
| 构建工具 | Vite 5 |
| 可视化 | ECharts 5.4（按需引入） |
| 实时通信 | Socket.io-client 4.7 + Mock服务端 |
| 样式方案 | SCSS + CSS Grid/Flex 响应式 |
| 包管理器 | pnpm（推荐）/ npm / yarn |

---

## 🗂️ 项目目录结构

```
device-monitor/
├── public/
│   └── mock-server.js          # Node.js模拟服务端（含Socket.io）
├── src/
│   ├── assets/                 # 静态资源
│   ├── components/
│   │   └── Charts/
│   │       ├── BaseChart.vue   # 图表基础封装（resize自适应）
│   │       ├── LineChart.vue   # 折线图：设备温度趋势
│   │       └── GaugeChart.vue  # 仪表盘：设备实时负载
│   ├── composables/
│   │   └── useDeviceData.ts    # 数据订阅逻辑封装
│   ├── utils/
│   │   ├── socket.ts           # Socket.io单例管理
│   │   └── echarts-config.ts   # ECharts全局配置
│   ├── services/
│   │   └── mock-api.ts         # 模拟数据结构定义
│   ├── views/
│   │   └── Dashboard.vue       # 主监控面板（响应式布局）
│   ├── App.vue
│   ├── main.ts
│   ├── style.scss              # 全局样式
│   └── types/
│       └── index.ts            # TypeScript类型定义
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## ⚙️ 配置文件（直接生成）

### `package.json`
```json
{
  "name": "device-monitor",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "mock": "node public/mock-server.js"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "echarts": "^5.4.3",
    "socket.io-client": "^4.7.2",
    "sass": "^1.69.5"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "@types/echarts": "^4.9.22",
    "typescript": "^5.2.2",
    "vite": "^5.0.0",
    "vue-tsc": "^1.8.22",
    "socket.io": "^4.7.2"
  }
}
```

### `vite.config.ts`
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/socket.io': {
        target: 'ws://localhost:3001',
        ws: true
      }
    }
  }
})
```

### `tsconfig.json`（关键配置）
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## 🔌 核心模块代码

### `src/types/index.ts`
```typescript
// 设备数据类型定义
export interface DeviceData {
  deviceId: string
  timestamp: number
  temperature: number    // 温度（℃）
  load: number          // 负载（0-100%）
  status: 'normal' | 'warning' | 'error'
}

// 图表配置类型
export interface ChartOption {
  title: string
  type: 'line' | 'gauge'
  unit: string
  color?: string
}
```

### `src/utils/socket.ts`
```typescript
import { io, Socket } from 'socket.io-client'
import type { DeviceData } from '@/types'

class SocketService {
  private socket: Socket | null = null
  private reconnectCount = 0
  private readonly MAX_RECONNECT = 5

  connect(url: string, callbacks: {
    onConnect?: () => void
    onData?: ( DeviceData) => void
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
```

### `src/composables/useDeviceData.ts`
```typescript
import { ref, onMounted, onUnmounted } from 'vue'
import type { DeviceData } from '@/types'
import socket from '@/utils/socket'

export function useDeviceData() {
  const latestData = ref<DeviceData | null>(null)
  const history = ref<DeviceData[]>([])
  const MAX_HISTORY = 50 // 保留50条历史数据

  const onData = ( DeviceData) => {
    latestData.value = data
    history.value.unshift(data)
    if (history.value.length > MAX_HISTORY) {
      history.value.pop()
    }
  }

  onMounted(() => {
    socket.connect('http://localhost:3001', {
      onData,
      onError: (err) => console.error('数据订阅失败', err)
    })
  })

  onUnmounted(() => {
    socket.disconnect()
  })

  return {
    latestData,
    history,
    refresh: () => socket.emit('request:data') // 手动触发刷新
  }
}
```

### `src/components/Charts/BaseChart.vue`
```vue
<template>
  <div ref="chartRef" class="chart-wrapper"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, GaugeChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent,
  GridComponent, LegendComponent
} from 'echarts/components'

// 注册必要组件
echarts.use([
  CanvasRenderer, LineChart, GaugeChart,
  TitleComponent, TooltipComponent,
  GridComponent, LegendComponent
])

const props = defineProps<{
  option: echarts.EChartsCoreOption
  theme?: 'light' | 'dark'
}>()

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

const initChart = async () => {
  if (!chartRef.value) return
  await nextTick()

  chartInstance = echarts.init(chartRef.value, props.theme)
  chartInstance.setOption(props.option)

  // 响应式：窗口变化时重绘
  const resizeObserver = new ResizeObserver(() => {
    chartInstance?.resize()
  })
  resizeObserver.observe(chartRef.value)

  // 组件卸载时清理
  onUnmounted(() => {
    resizeObserver.disconnect()
    chartInstance?.dispose()
    chartInstance = null
  })
}

watch(() => props.option, (newOption) => {
  chartInstance?.setOption(newOption, { notMerge: true })
}, { deep: true })

onMounted(initChart)
</script>

<style scoped lang="scss">
.chart-wrapper {
  width: 100%;
  height: 100%;
  min-height: 300px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
</style>
```

### `src/components/Charts/LineChart.vue`
```vue
<!-- 温度趋势折线图 -->
<template>
  <BaseChart :option="chartOption" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'
import type { DeviceData } from '@/types'

const props = defineProps<{
  data: DeviceData[]
}>()

const chartOption = computed(() => ({
  title: {
    text: '🌡️ 设备温度趋势',
    left: 'center',
    textStyle: { fontSize: 16 }
  },
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
     props.data.slice().reverse().map(d =>
      new Date(d.timestamp).toLocaleTimeString()
    ),
    axisLabel: { rotate: 45, interval: 0 }
  },
  yAxis: {
    type: 'value',
    name: '温度 (℃)',
    min: 0,
    max: 100,
    splitLine: { lineStyle: { type: 'dashed' } }
  },
  series: [{
     props.data.slice().reverse().map(d => d.temperature),
    type: 'line',
    smooth: true,
    symbol: 'none',
    lineStyle: { width: 3, color: '#409EFF' },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(64,158,255,0.3)' },
          { offset: 1, color: 'rgba(64,158,255,0.01)' }
        ]
      }
    }
  }],
  grid: { left: '12%', right: '8%', top: '60', bottom: '60' }
}))
</script>
```

### `src/components/Charts/GaugeChart.vue`
```vue
<!-- 负载仪表盘 -->
<template>
  <BaseChart :option="chartOption" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'
import type { DeviceData } from '@/types'

const props = defineProps<{
  currentLoad: number
  status: 'normal' | 'warning' | 'error'
}>()

const getColor = () => {
  switch(props.status) {
    case 'error': return '#F56C6C'
    case 'warning': return '#E6A23C'
    default: return '#67C23A'
  }
}

const chartOption = computed(() => ({
  title: {
    text: '⚡ 实时负载',
    left: 'center',
    textStyle: { fontSize: 16 }
  },
  series: [{
    type: 'gauge',
    startAngle: 210,
    endAngle: -30,
    min: 0,
    max: 100,
    splitNumber: 5,
    itemStyle: { color: getColor() },
    progress: { show: true, width: 18 },
    pointer: { show: false },
    axisLine: { lineStyle: { width: 18 } },
    axisTick: { show: false },
    splitLine: { distance: -18, length: 12, lineStyle: { width: 2 } },
    axisLabel: { distance: -22, fontSize: 12 },
    detail: {
      fontSize: 24,
      offsetCenter: [0, '20%'],
      formatter: '{value}%',
      color: 'inherit'
    },
     [{ value: props.currentLoad, name: '负载率' }],
    title: { offsetCenter: [0, '40%'], fontSize: 14 }
  }]
}))
</script>
```

### `src/views/Dashboard.vue`
```vue
<template>
  <div class="dashboard">
    <header class="header">
      <h1>🖥️ 设备监控面板</h1>
      <div class="status" :class="latestData?.status">
        {{ statusText }}
      </div>
    </header>

    <main class="charts-grid">
      <div class="chart-card">
        <LineChart :data="history" />
      </div>
      <div class="chart-card">
        <GaugeChart
          :currentLoad="latestData?.load || 0"
          :status="latestData?.status || 'normal'"
        />
      </div>
    </main>

    <footer class="footer">
      <span>最后更新: {{ updateTime }}</span>
      <button @click="refresh">🔄 手动刷新</button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDeviceData } from '@/composables/useDeviceData'
import LineChart from '@/components/Charts/LineChart.vue'
import GaugeChart from '@/components/Charts/GaugeChart.vue'

const { latestData, history, refresh } = useDeviceData()

const statusText = computed(() => {
  const map = { normal: '🟢 运行正常', warning: '🟡 注意预警', error: '🔴 设备异常' }
  return map[latestData.value?.status || 'normal']
})

const updateTime = computed(() =>
  latestData.value
    ? new Date(latestData.value.timestamp).toLocaleString('zh-CN')
    : '--'
)
</script>

<style scoped lang="scss">
.dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);

  h1 {
    font-size: 20px;
    color: #303133;
    margin: 0;
  }

  .status {
    padding: 6px 16px;
    border-radius: 20px;
    font-weight: 500;
    &.normal { background: #f0f9eb; color: #67c23a; }
    &.warning { background: #fdf6ec; color: #e6a23c; }
    &.error { background: #fef0f0; color: #f56c6c; }
  }
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  flex: 1;

  .chart-card {
    background: transparent;
    border-radius: 12px;
    min-height: 400px;
  }
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #fff;
  border-radius: 12px;
  font-size: 14px;
  color: #606266;

  button {
    padding: 8px 20px;
    background: #409eff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover { background: #66b1ff; }
    &:active { transform: scale(0.98); }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .footer {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
```

---

## 🧪 模拟服务端（`public/mock-server.js`）

```javascript
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
  socket.on('request:data', () => {
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
```

---

## 🚀 运行指南

```bash
# 1. 安装依赖
pnpm install

# 2. 启动模拟服务端（新终端）
pnpm run mock

# 3. 启动前端项目（另一个终端）
pnpm run dev

# 4. 访问 http://localhost:3000
```

✅ 预期效果：
- 页面显示2个图表：温度折线图 + 负载仪表盘
- 数据每2秒自动刷新（来自Socket.io推送）
- 窗口缩放时图表自适应
- 状态色块随数据变化（绿/黄/红）

---

## 🔧 扩展建议（可选）

1. **真实后端对接**：替换`mock-server.js`为Java/Node.js真实服务，保持`device:data`事件名一致
2. **多设备支持**：在`DeviceData`增加`deviceList`数组，图表增加设备切换下拉框
3. **告警功能**：当`status==='error'`时，用`ElNotification`弹出浏览器通知
4. **数据持久化**：用`localStorage`缓存最近1小时数据，断网时降级展示
5. **主题切换**：在`echarts.init()`传入`theme`参数，配合CSS变量实现暗黑模式

---

> 💡 **给生成AI的提示**：
> 1. 严格按目录结构创建文件
> 2. TypeScript类型必须完整，禁止`any`
> 3. ECharts必须按需引入，避免全量打包
> 4. Socket.io需处理重连和错误边界
> 5. 响应式布局优先使用`grid-template-columns: repeat(auto-fit, minmax(320px, 1fr))`

✅ 文档结束 · 可直接复制使用