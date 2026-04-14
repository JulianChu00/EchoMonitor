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
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    textStyle: { color: '#f1f5f9' }
  },
  grid: { left: '8%', right: '4%', top: '10%', bottom: '15%' },
  xAxis: {
    type: 'category',
    data: props.data.slice().reverse().map(d =>
      new Date(d.timestamp).toLocaleTimeString()
    ),
    axisLine: { lineStyle: { color: '#334155' } },
    axisLabel: {
      color: '#94a3b8',
      rotate: 45,
      interval: 'auto'
    }
  },
  yAxis: {
    type: 'value',
    name: 'Temp (°C)',
    nameTextStyle: { color: '#94a3b8' },
    min: 0,
    max: 100,
    axisLine: { show: false },
    axisLabel: { color: '#94a3b8' },
    splitLine: { lineStyle: { color: '#334155', type: 'dashed' } }
  },
  series: [{
    data: props.data.slice().reverse().map(d => d.temperature),
    type: 'line',
    smooth: 0.4,
    symbol: 'circle',
    symbolSize: 6,
    lineStyle: {
      width: 3,
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 1, y2: 0,
        colorStops: [
          { offset: 0, color: '#22c55e' },
          { offset: 0.5, color: '#3b82f6' },
          { offset: 1, color: '#ef4444' }
        ]
      }
    },
    itemStyle: {
      color: '#3b82f6',
      borderWidth: 2,
      borderColor: '#1e293b'
    },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
          { offset: 1, color: 'rgba(59, 130, 246, 0.02)' }
        ]
      }
    }
  }]
}))
</script>