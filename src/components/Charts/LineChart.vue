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
    data: props.data.slice().reverse().map(d =>
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
    data: props.data.slice().reverse().map(d => d.temperature),
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