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

// ✅ 改动1：提到外面
let resizeObserver: ResizeObserver | null = null

const initChart = async () => {
  if (!chartRef.value) return
  await nextTick()

  chartInstance = echarts.init(chartRef.value, props.theme)
  chartInstance.setOption(props.option)

  // 响应式：窗口变化时重绘
  // ✅ 改动2：赋值给外部变量
  resizeObserver = new ResizeObserver(() => {
    chartInstance?.resize()
  })
  resizeObserver.observe(chartRef.value)
}

// ✅ 改动3：生命周期移到顶层
onUnmounted(() => {
  resizeObserver?.disconnect()
  chartInstance?.dispose()
  chartInstance = null
})

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