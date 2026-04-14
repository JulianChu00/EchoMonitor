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
    case 'error': return '#ef4444'
    case 'warning': return '#eab308'
    default: return '#22c55e'
  }
}

const chartOption = computed(() => ({
  backgroundColor: 'transparent',
  series: [{
    type: 'gauge',
    startAngle: 200,
    endAngle: -20,
    min: 0,
    max: 100,
    splitNumber: 10,
    itemStyle: {
      color: getColor(),
      shadowColor: getColor(),
      shadowBlur: 20,
      shadowOffsetX: 0,
      shadowOffsetY: 0
    },
    progress: {
      show: true,
      width: 20,
      roundCap: true,
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [
            { offset: 0, color: '#22c55e' },
            { offset: 0.7, color: '#eab308' },
            { offset: 1, color: '#ef4444' }
          ]
        }
      }
    },
    pointer: { show: false },
    axisLine: {
      lineStyle: {
        width: 20,
        color: [[1, '#334155']]
      },
      roundCap: true
    },
    axisTick: { show: false },
    splitLine: { show: false },
    axisLabel: {
      show: true,
      distance: -30,
      color: '#94a3b8',
      fontSize: 11,
      formatter: (value: number) => {
        if (value === 0 || value === 50 || value === 100) {
          return value.toString()
        }
        return ''
      }
    },
    detail: {
      fontSize: 36,
      fontWeight: 700,
      offsetCenter: [0, '15%'],
      formatter: '{value}%',
      color: getColor(),
      textShadowColor: 'rgba(0,0,0,0.3)',
      textShadowBlur: 10
    },
    data: [{ value: props.currentLoad, name: 'Load' }],
    title: {
      offsetCenter: [0, '45%'],
      fontSize: 13,
      fontWeight: 500,
      color: '#94a3b8'
    }
  }]
}))
</script>