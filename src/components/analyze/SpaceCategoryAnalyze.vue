<template>
  <div class="SpaceCategoryAnalyze">
    <a-card title="空间图片分析分类">
      <!-- 图表组件 -->
      <v-chart
        ref="spaceCategoryAnalyzeRef"
        :option="options"
        style="max-width: 100%; height: 300px"
        :loading="loading"
      />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { getSpaceCategoryAnalyzeUsingPost } from '@/api/pictureAnalyzeController'
import { computed, ref, watchEffect } from 'vue'

interface Props {
  queryAll?: boolean
  queryPublic?: boolean
  spaceId?: number
}

const props = withDefaults(defineProps<Props>(), {
  queryAll: false,
  queryPublic: false,
})

const spaceCategoryAnalyzeRef = ref(null)

// 图表数据
const dataList = ref<API.SpaceCategoryAnalyzeRequest>()

// 加载状态
const loading = ref(true)

const fetchData = async () => {
  try {
    const res = await getSpaceCategoryAnalyzeUsingPost({
      // ...props,
      queryAll: props.queryAll,
      queryPublic: props.queryPublic,
      spaceId: props.spaceId,
    })
    if (res.code === 0 && res.data) {
      dataList.value = res.data
    } else {
      message.error('获取失败')
    }
    loading.value = false
  } catch (error) {
    message.error('获取失败:' + error.message)
    loading.value = false
  }
}

// 切记: 图表数据需要是响应式的，否则图表不会更新。
// 这里用的是 计算属性
const options = computed(() => {
  if (!dataList.value) return {}
  // 处理图表数据
  // x轴
  const categories = dataList.value.map((item) => item.category)
  const countData = dataList.value.map((item) => item.count)
  const sizeData = dataList.value.map((item) => (item.totalSize / 1024 / 1024).toFixed(2))

  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['图片数量', '图片总大小'], top: 'bottom' },
    xAxis: { type: 'category', data: categories },
    yAxis: [
      {
        type: 'value',
        name: '图片数量',
        axisLine: { show: true, lineStyle: { color: '#5470C6' } }, // 左轴颜色
      },
      {
        type: 'value',
        name: '图片总大小 (MB)',
        position: 'right',
        axisLine: { show: true, lineStyle: { color: '#91CC75' } }, // 右轴颜色
        splitLine: {
          lineStyle: {
            color: '#91CC75', // 调整网格线颜色
            type: 'dashed', // 线条样式：可选 'solid', 'dashed', 'dotted'
          },
        },
      },
    ],
    series: [
      { name: '图片数量', type: 'bar', data: countData, yAxisIndex: 0 },
      { name: '图片总大小', type: 'bar', data: sizeData, yAxisIndex: 1 },
    ],
  }
})
/**
 * 监听变量，参数发生变化时，重新获取数据。

 */
watchEffect(() => {
  fetchData()
})
</script>

<style lang="less" scoped>
.SpaceCategoryAnalyze {
}
</style>
