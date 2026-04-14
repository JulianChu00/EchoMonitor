<template>
  <div class="dashboard">
    <header class="header">
      <div class="header-left">
        <div class="logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#3B82F6"/>
            <path d="M8 16h16M16 8v16M10 10l12 12M22 10L10 22" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <h1>Device Monitor</h1>
      </div>
      <div class="header-right">
        <div class="status-badge" :class="currentDevice?.status">
          <span class="status-dot"></span>
          {{ statusText }}
        </div>
        <button class="header-refresh-btn" @click="refresh" title="Refresh">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M14 8A6 6 0 1 1 8 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M8 2V5L10 3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </header>

    <main class="charts-container">
      <!-- 设备选择 tabs -->
      <div class="device-tabs">
        <button 
          v-for="device in devices" 
          :key="device.deviceId"
          class="device-tab"
          :class="{ active: selectedDeviceId === device.deviceId }"
          @click="selectedDeviceId = device.deviceId"
        >
          <span class="tab-device-id">{{ device.deviceId }}</span>
          <span class="tab-status-dot" :class="device.status"></span>
        </button>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-label">Temperature</div>
          <div class="stat-value" :class="temperatureClass">
            {{ currentDevice?.temperature?.toFixed(1) || '--' }}
            <span class="unit">°C</span>
          </div>
          <div class="stat-progress">
            <div class="progress-bar" :style="{ width: `${(currentDevice?.temperature || 0)}%` }" :class="temperatureClass"></div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Load</div>
          <div class="stat-value" :class="loadClass">
            {{ currentDevice?.load || '--' }}
            <span class="unit">%</span>
          </div>
          <div class="stat-progress">
            <div class="progress-bar" :style="{ width: `${currentDevice?.load || 0}%` }" :class="loadClass"></div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Last Update</div>
          <div class="stat-value update-time">{{ updateTime }}</div>
        </div>
      </div>

      <div class="charts-grid">
        <div class="chart-card">
          <div class="card-header">
            <h3>Temperature Trend - {{ selectedDeviceId }}</h3>
          </div>
          <LineChart :data="currentHistory" />
        </div>
        <div class="chart-card">
          <div class="card-header">
            <h3>Real-time Load - {{ selectedDeviceId }}</h3>
          </div>
          <GaugeChart
            :currentLoad="currentDevice?.load || 0"
            :status="currentDevice?.status || 'normal'"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDeviceData } from '@/composables/useDeviceData'
import LineChart from '@/components/Charts/LineChart.vue'
import GaugeChart from '@/components/Charts/GaugeChart.vue'
import type { DeviceData } from '@/types'

const { latestData, history, refresh } = useDeviceData()

const selectedDeviceId = ref('DEV-001')

const devices = computed(() => {
  if (!latestData.value) return []
  if (Array.isArray(latestData.value)) {
    return latestData.value
  }
  return [latestData.value]
})

const currentDevice = computed(() => {
  if (!latestData.value) return null
  if (Array.isArray(latestData.value)) {
    return latestData.value.find(d => d.deviceId === selectedDeviceId.value) || latestData.value[0]
  }
  return latestData.value
})

const currentHistory = computed(() => {
  if (!history.value || !Array.isArray(history.value)) return []
  const deviceHistory = history.value.filter(d => d.deviceId === selectedDeviceId.value)
  return deviceHistory.slice(0, 50)
})

const statusText = computed(() => {
  const map = { normal: 'Normal', warning: 'Warning', error: 'Error' }
  return map[currentDevice.value?.status || 'normal']
})

const temperatureClass = computed(() => {
  const temp = currentDevice.value?.temperature || 0
  if (temp >= 80) return 'danger'
  if (temp >= 60) return 'warning'
  return 'normal'
})

const loadClass = computed(() => {
  const load = currentDevice.value?.load || 0
  if (load >= 90) return 'danger'
  if (load >= 70) return 'warning'
  return 'normal'
})

const updateTime = computed(() =>
  currentDevice.value?.timestamp
    ? new Date(currentDevice.value.timestamp).toLocaleTimeString('zh-CN')
    : '--:--:--'
)
</script>

<style scoped lang="scss">
.dashboard {
  min-height: 100vh;
  background: #0f172a;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #1e293b;
  border-radius: 12px;
  border: 1px solid #334155;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    h1 {
      font-size: 20px;
      font-weight: 600;
      color: #f1f5f9;
      margin: 0;
      letter-spacing: 0.5px;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .status-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        animation: pulse 2s infinite;
      }

      &.normal {
        background: rgba(34, 197, 94, 0.15);
        color: #22c55e;
        .status-dot { background: #22c55e; }
      }

      &.warning {
        background: rgba(234, 179, 8, 0.15);
        color: #eab308;
        .status-dot { background: #eab308; }
      }

      &.error {
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
        .status-dot { background: #ef4444; }
      }
    }

    .header-refresh-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: #334155;
      border: none;
      border-radius: 8px;
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #3b82f6;
        color: white;
      }

      svg {
        transition: transform 0.3s;
      }

      &:hover svg {
        transform: rotate(180deg);
      }
    }
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.charts-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.device-tabs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  .device-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 8px;
    color: #94a3b8;
    cursor: pointer;
    transition: all 0.2s;

    .tab-device-id {
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 13px;
    }

    .tab-status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      
      &.normal { background: #22c55e; }
      &.warning { background: #eab308; }
      &.error { background: #ef4444; }
    }

    &:hover {
      border-color: #3b82f6;
    }

    &.active {
      background: #334155;
      border-color: #3b82f6;
      color: #f1f5f9;
    }
  }
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  .stat-card {
    background: #1e293b;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #334155;

    .stat-label {
      font-size: 12px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: #f1f5f9;
      margin-bottom: 12px;

      .unit {
        font-size: 16px;
        font-weight: 400;
        color: #94a3b8;
        margin-left: 4px;
      }

      &.normal { color: #22c55e; }
      &.warning { color: #eab308; }
      &.danger { color: #ef4444; }

      &.update-time {
        font-size: 20px;
        font-family: 'Monaco', 'Menlo', monospace;
        color: #f1f5f9;
      }
    }

    .stat-progress {
      height: 4px;
      background: #334155;
      border-radius: 2px;
      overflow: hidden;

      .progress-bar {
        height: 100%;
        border-radius: 2px;
        transition: width 0.3s ease;

        &.normal { background: #22c55e; }
        &.warning { background: #eab308; }
        &.danger { background: #ef4444; }
      }
    }
  }
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  flex: 1;

  .chart-card {
    background: #1e293b;
    border-radius: 12px;
    border: 1px solid #334155;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .card-header {
      padding: 16px 20px;
      border-bottom: 1px solid #334155;

      h3 {
        font-size: 14px;
        font-weight: 600;
        color: #f1f5f9;
        margin: 0;
        letter-spacing: 0.5px;
      }
    }
  }
}

@media (max-width: 1024px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);

    .stat-card:last-child {
      grid-column: span 2;
    }
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }

  .header {
    flex-direction: column;
    gap: 16px;
    padding: 16px;

    .header-left h1 {
      font-size: 16px;
    }

    .header-right {
      width: 100%;
      justify-content: space-between;
    }
  }

  .device-tabs {
    justify-content: center;
  }

  .stats-row {
    grid-template-columns: 1fr;

    .stat-card:last-child {
      grid-column: span 1;
    }

    .stat-value {
      font-size: 24px;
    }
  }
}
</style>