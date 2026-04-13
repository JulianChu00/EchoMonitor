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
    data: [{ value: props.currentLoad, name: '负载率' }],
    title: { offsetCenter: [0, '40%'], fontSize: 14 }
  }]
}))
</script>