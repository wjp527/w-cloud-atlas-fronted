<template>
  <div class="SpaceTagAnalyze">
    <a-card title="图库分析分类">
      <!-- 图表组件 -->
      <div ref="tagWordCloud" class="max-w h-[320px]"></div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { getSpaceTagAnalyzeUsingPost } from '@/api/pictureAnalyzeController'
import { computed, onMounted, ref, watchEffect } from 'vue'

interface Props {
  queryAll?: boolean
  queryPublic?: boolean
  spaceId?: number
}

const props = withDefaults(defineProps<Props>(), {
  queryAll: false,
  queryPublic: false,
})

const tagWordCloud = ref(null)

// 图表数据
const dataList = ref<API.SpaceTagAnalyzeRequest>()

// 加载状态
const loading = ref(true)

const fetchData = async () => {
  try {
    const res = await getSpaceTagAnalyzeUsingPost({
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
    initOptions()
  } catch (error) {
    message.error('获取失败:' + error.message)
    loading.value = false
  }
}
import * as echarts from 'echarts'
const initOptions = () => {
  const chart = echarts.init(tagWordCloud.value)
  const tagData = dataList.value.map((item) => {
    return {
      name: item.tag,
      value: item.count,
    }
  })
  const option = {
    tooltip: {
      show: true, // 启用提示框
      formatter: '{b}: {c}', // 提示框显示内容
    },
    series: [
      {
        type: 'wordCloud',
        size: ['20%', '80%'], // 控制词云的大小范围
        rotationRange: [-90, 90], // 设置词语的旋转角度范围
        rotationStep: 45, // 旋转角度的步长
        shape: 'circle', // 设置词云的形状
        gridSize: 8, // 词语间的间隙大小
        drawOutOfBound: false, // 词语是否可以绘制在边界外
        textStyle: {
          color: function () {
            return (
              'rgb(' +
              [
                Math.round(Math.random() * 255),
                Math.round(Math.random() * 255),
                Math.round(Math.random() * 255),
              ].join(',') +
              ')'
            ) // 随机生成颜色
          },
        },
        data: tagData,
      },
    ],
  }

  chart.setOption(option)
}

/**
 * 监听变量，参数发生变化时，重新获取数据。

 */
watchEffect(() => {
  fetchData()
})

onMounted(() => {
  // 检查是否为有效的 DOM 元素
  fetchData()
})
</script>

<style lang="less" scoped>
.SpaceTagAnalyze {
}
</style>
