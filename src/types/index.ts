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