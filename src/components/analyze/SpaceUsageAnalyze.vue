<template>
  <div class="SpaceUsageAnalyze">
    <a-flex gap="middle">
      <a-card title="存储空间" style="width: 50%">
        <div class="h-[320px] flex justify-center flex-col text-center">
          <h3 class="text-[16px]">
            {{ formatSize(data?.usedSize) }} /
            {{ data?.maxSize ? formatSize(data.maxSize) : '无限制' }}
          </h3>
          <a-progress type="circle" :percent="data?.sizeUsageRatio ?? 0" />
        </div>
      </a-card>

      <a-card title="图片数量" style="width: 50%">
        <div class="h-[320px] flex justify-center flex-col text-center">
          <h3 class="text-[16px]">
            {{ data?.usedCount }} /
            {{ data?.maxCount ?? '无限制' }}
          </h3>
          <a-progress type="circle" :percent="data?.countUsageRatio ?? 0" />
        </div>
      </a-card>
    </a-flex>
  </div>
</template>

<script setup lang="ts">
import { getSpaceUsageAnalyzeUsingPost } from '@/api/pictureAnalyzeController'
import { formatSize } from '@/utils/file'
import { message } from 'ant-design-vue'
import { onMounted, ref, watchEffect } from 'vue'

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
const data = ref<API.SpaceUsageAnalyzeResponse>()

// 加载状态
const loading = ref(true)

const fetchData = async () => {
  try {
    const res = await getSpaceUsageAnalyzeUsingPost({
      // ...props,
      queryAll: props.queryAll,
      queryPublic: props.queryPublic,
      spaceId: props.spaceId,
    })
    if (res.code === 0 && res.data) {
      data.value = res.data
    } else {
      message.error('获取失败')
    }
    loading.value = false
  } catch (error) {
    message.error('获取失败:' + error.message)
    loading.value = false
  }
}

/**
 * 监听变量，参数发生变化时，重新获取数据。

 */
watchEffect(() => {
  fetchData()
})
</script>
