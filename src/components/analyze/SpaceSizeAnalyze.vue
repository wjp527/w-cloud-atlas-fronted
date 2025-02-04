<template>
  <div class="SpaceSizeAnalyze">
    <a-card title="图库分析大小">
      <!-- 图表组件 -->
      <v-chart :option="options" style="max-width: 100%; height: 300px" :loading="loading" />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { getSpaceSizeAnalyzeUsingPost } from '@/api/pictureAnalyzeController'
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

// 图表数据
const dataList = ref<API.SpaceSizeAnalyzeRequest>()

// 加载状态
const loading = ref(true)

const fetchData = async () => {
  try {
    const res = await getSpaceSizeAnalyzeUsingPost({
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
  const pieData = dataList.value.map((item) => ({
    name: item.sizeRange,
    value: item.count,
  }))

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      top: 'bottom',
    },
    series: [
      {
        name: '图片大小',
        type: 'pie',
        radius: '50%',
        data: pieData,
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
.SpaceSizeAnalyze {
}
</style>
