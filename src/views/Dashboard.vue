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
</script>™

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