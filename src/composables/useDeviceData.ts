import { ref, onMounted, onUnmounted } from 'vue'
import type { DeviceData } from '@/types'
import socket from '@/utils/socket'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8081'

export function useDeviceData() {
  const latestData = ref<DeviceData | DeviceData[] | null>(null)
  const history = ref<DeviceData[]>([])
  const MAX_HISTORY = 100

  const onData = (data: DeviceData | DeviceData[]) => {
    latestData.value = data
    
    if (Array.isArray(data)) {
      data.forEach(device => {
        history.value.unshift(device)
      })
    } else {
      history.value.unshift(data)
    }
    
    if (history.value.length > MAX_HISTORY) {
      history.value = history.value.slice(0, MAX_HISTORY)
    }
  }

  onMounted(() => {
    socket.connect(SOCKET_URL, {
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
    refresh: () => socket.emit('request:data')
  }
}