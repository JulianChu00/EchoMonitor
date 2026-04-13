import { ref, onMounted, onUnmounted } from 'vue'
import type { DeviceData } from '@/types'
import socket from '@/utils/socket'

export function useDeviceData() {
  const latestData = ref<DeviceData | null>(null)
  const history = ref<DeviceData[]>([])
  const MAX_HISTORY = 50 // 保留50条历史数据

  const onData = (data: DeviceData) => {
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