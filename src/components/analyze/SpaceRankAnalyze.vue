<template>
  <div class="SpaceRankAnalyze">
    <a-card title="空间使用排行分析">
      <!-- 图表组件 -->
      <v-chart :option="options" style="max-width: 100%; height: 300px" :loading="loading" />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { getSpaceRankAnalyzeUsingPost } from '@/api/pictureAnalyzeController'
import { computed, ref, watchEffect } from 'vue'
import { message } from 'ant-design-vue'

interface Props {
  topN?: number
}

const props = withDefaults(defineProps<Props>(), {
  topN: 10,
})

// 图表数据
const dataList = ref<API.SpaceCategoryAnalyzeRequest>()

// 加载状态
const loading = ref(true)

const fetchData = async () => {
  try {
    const res = await getSpaceRankAnalyzeUsingPost({
      // ...props,
      topN: props.topN,
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
  const spaceNames = dataList.value.map((item) => item.spaceName)
  const usageData = dataList.value.map((item) => (item.totalSize / (1024 * 1024)).toFixed(2)) // 转为 MB

  return {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: spaceNames,
    },
    yAxis: {
      type: 'value',
      name: '空间使用量 (MB)',
    },
    series: [
      {
        name: '空间使用量 (MB)',
        type: 'bar',
        data: usageData,
        itemStyle: {
          color: '#5470C6', // 自定义柱状图颜色
        },
      },
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
.SpaceRankAnalyze {
}
</style>
