<template>
  <div class="SpaceUserAnalyze">
    <a-card title="空间图库用户分析">
      <!-- 图表组件 -->
      <v-chart :option="options" style="max-width: 100%; height: 300px" :loading="loading" />

      <template #extra>
        <a-space>
          <a-segmented v-model:value="value" :options="data" @change="changeDate" />
          <a-input-search
            v-model="params.userId"
            :options="timeDimension"
            enter-button="搜索用户"
            @search="doSearch"
          />
        </a-space>
      </template>
    </a-card>
  </div>
</template>
<script setup lang="ts">
import { message } from 'ant-design-vue'
import { getSpaceUserAnalyzeUsingPost } from '@/api/pictureAnalyzeController'
import { computed, ref, watchEffect, reactive } from 'vue'

interface Props {
  queryAll?: boolean
  queryPublic?: boolean
  spaceId?: number
  timeDimension?: string
  userId?: number
}

const props = withDefaults(defineProps<Props>(), {
  queryAll: false,
  queryPublic: false,
})

const params = ref<API.SpaceUserAnalyzeRequest>({
  queryAll: props.queryAll,
  queryPublic: props.queryPublic,
  spaceId: props.spaceId,
  timeDimension: props.timeDimension,
  userId: props.userId,
})

const data = reactive(['daily', 'week', 'month'])
const value = ref(data[0])

// 图表数据
const dataList = ref<API.SpaceUserAnalyzeResponse>()

// 加载状态
const loading = ref(true)

const fetchData = async () => {
  try {
    const res = await getSpaceUserAnalyzeUsingPost({
      // ...props,
      ...params.value,
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
  const periods = dataList.value.map((item) => item.period) // 时间区间
  const counts = dataList.value.map((item) => item.count) // 上传数量

  return {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: periods, name: '时间区间' },
    yAxis: { type: 'value', name: '上传数量' },
    series: [
      {
        name: '上传数量',
        type: 'line',
        data: counts,
        smooth: true, // 平滑折线
        emphasis: {
          focus: 'series',
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

// 切换时间维度
const changeDate = (val: string) => {
  params.value.timeDimension = val
}

// 搜索用户上传的图片信息
const doSearch = (val: string) => {
  params.value.userId = val
  fetchData()
}
</script>
