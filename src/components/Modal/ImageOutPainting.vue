<template>
  <div class="ImageOutPainting">
    <a-modal class="" v-model:open="visible" :title="title" :footer="false" @cancel="handleCancel">
      <a-tabs v-model:activeKey="chooseAIModel">
        <a-tab-pane key="outpainting" tab="扩图">
          <a-row :gutter="12" class="mb-4">
            <a-col :span="12">
              <h4 class="text-[18px] mb-1">原始图片</h4>
              <img :src="picture?.url" :alt="picture?.name" class="w-full" />
            </a-col>
            <a-col :span="12">
              <h4 class="text-[18px] mb-1">扩图结果</h4>
              <img
                v-if="resultImageUrl"
                :src="resultImageUrl"
                :alt="picture?.name"
                class="w-full"
              />
              <a-skeleton
                :active="true"
                v-if="!!taskId"
                :paragraph="{ rows: 6 }"
                class="mt-[8px]"
              />
            </a-col>
          </a-row>
        </a-tab-pane>
        <a-tab-pane key="imagesynthesis" tab="图配文" force-render>
          <a-select
            v-model:value="AIImageSynthesisTitle"
            mode="tags"
            style="width: 100%"
            placeholder="Tags Mode"
            :options="options"
          ></a-select>
          <a-row :gutter="12" class="mb-4">
            <a-col :span="12">
              <h4 class="text-[18px] mb-1">原始图片</h4>
              <img :src="picture?.url" :alt="picture?.name" class="w-full" />
            </a-col>
            <a-col :span="12">
              <h4 class="text-[18px] mb-1">图配文结果</h4>
              <img
                v-if="resultImageUrl"
                :src="resultImageUrl"
                :alt="picture?.name"
                class="w-full"
              />
              <a-skeleton
                :active="true"
                v-if="!!taskId"
                :paragraph="{ rows: 6 }"
                class="mt-[8px]"
              />
            </a-col> </a-row
        ></a-tab-pane>
      </a-tabs>

      <a-space class="flex justify-center">
        <a-button
          type="primary"
          ghost
          class="w-[100px] mr-4"
          :disabled="
            chooseAIModel === 'imagesynthesis' && !taskId && AIImageSynthesisTitle.length === 0
          "
          :loading="!!taskId"
          @click="createTask"
          >生成图片</a-button
        >
        <a-button
          type="primary"
          class="w-[100px]"
          v-if="resultImageUrl"
          :loading="uploadLoading"
          @click="handleUpload"
          >应用结果</a-button
        >
      </a-space>
    </a-modal>
  </div>
</template>

<script lang="ts" setup name="ImageOutPainting">
import {
  createPictureImageSynthesisTaskUsingPost,
  createPictureOutPaintingTaskUsingPost,
  getPictureImageSynthesisTaskUsingGet,
  getPictureOutPaintingTaskUsingGet,
  uploadPictureByUrlUsingPost,
} from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { ref, onMounted, onUnmounted } from 'vue'
import 'vue-cropper/dist/index.css'

interface Props {
  title?: string
  picture?: API.Picture
  spaceId?: number
  onSuccess: (data: any) => void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'AI处理',
})

// 选择AI模型
const chooseAIModel = ref('outpainting')
const visible = ref<boolean>(false)

// AI扩图后的图片
const resultImageUrl = ref<string>('')

/**
 * 创建任务: AI扩图、AI图配文等任务创建

 */
const taskId = ref<string>('')
const createTask = async () => {
  switch (chooseAIModel.value) {
    case 'outpainting':
      await createAIOutPaintingTask()
      break
    case 'imagesynthesis':
      await createAIImageSynthesisTask()
      break
  }
}

/**
 * 创建AI扩图任务
 */
const createAIOutPaintingTask = async () => {
  resultImageUrl.value = ''
  if (!props.picture?.id) {
    return
  }
  const res = await createPictureOutPaintingTaskUsingPost({
    pictureId: props.picture?.id,
    parameters: {
      // 图像居中，按比例缩放
      xScale: 2,
      yScale: 2,
    },
  })

  if (res.code == 0 && res.data) {
    message.success('AI扩图任务创建成功，正在生成图片...')
    console.log(res.data.output.taskId)
    taskId.value = res.data.output.taskId
    // 开启轮询查询任务结果
    startPolling()
  } else {
    message.error('AI扩图任务创建失败:' + res.message)
  }
}

/**
 * 创建AI图配文任务
 */
const createAIImageSynthesisTask = async () => {
  resultImageUrl.value = ''
  if (!props.picture?.id) {
    return
  }
  const res = await createPictureImageSynthesisTaskUsingPost({
    title: AIImageSynthesisTitle.value,
    pictureId: props.picture?.id,
    parameters: {
      n: 1,
    },
  })

  if (res.code == 0 && res.data) {
    message.success('AI图配文任务创建成功，正在生成图片...')
    console.log(res.data.output.taskId)
    taskId.value = res.data.output.taskId
    // 开启轮询查询任务结果
    startPolling()
  } else {
    message.error('AI图配文任务创建失败:' + res.message)
  }
}
// 轮询定时器
let pollingTimer: NodeJS.Timeout = null
// 开启轮询
const startPolling = () => {
  if (!taskId.value) {
    return
  }

  // 生成扩图结果图片，记得清楚定时器

  switch (chooseAIModel.value) {
    case 'outpainting':
      startAIOutPaintingResult()
      break
    case 'imagesynthesis':
      startAIImageSynthesisResult()
      break
  }
}

// AI扩图 获取结果图片
const startAIOutPaintingResult = async () => {
  // 生成扩图结果图片，记得清楚定时器

  pollingTimer = setInterval(async () => {
    try {
      const res = await getPictureOutPaintingTaskUsingGet({
        taskId: taskId.value,
      })
      console.log(res.data, 'res.data')
      if (res.code == 0 && res.data) {
        const taskResult = res.data?.output
        // AI扩图成功
        if (taskResult?.taskStatus === 'SUCCEEDED') {
          message.success('AI扩图成功')
          resultImageUrl.value = taskResult.outputImageUrl
          // 关闭轮询
          clearPolling()
        } else if (taskResult?.taskStatus === 'FAILED') {
          message.error('AI扩图失败:' + error)

          // 关闭轮询
          clearPolling()
        }
      }
    } catch (error) {
      console.error('轮询任务状态失败: ' + error)
      message.error('AI扩图失败:' + error)
      // 关闭轮询
      clearPolling()
    }
  }, 3000)
}

// AI图配文 获取结果图片
const startAIImageSynthesisResult = async () => {
  // 生成扩图结果图片，记得清楚定时器

  pollingTimer = setInterval(async () => {
    try {
      const res = await getPictureImageSynthesisTaskUsingGet({
        taskId: taskId.value,
      })
      console.log(res.data, 'res.data')
      if (res.code == 0 && res.data) {
        const taskResult = res.data?.output
        // AI扩图成功
        if (taskResult?.taskStatus === 'SUCCEEDED') {
          message.success('AI图配文成功')
          resultImageUrl.value = taskResult.results[0]?.url
          // 关闭轮询
          clearPolling()
        } else if (taskResult?.taskStatus === 'FAILED') {
          message.error('AI图配文失败:' + error)

          // 关闭轮询
          clearPolling()
        }
      }
    } catch (error) {
      console.error('轮询任务状态失败: ' + error)
      message.error('AI图配文失败:' + error)
      // 关闭轮询
      clearPolling()
    }
  }, 3000)
}

// 关闭轮询
const clearPolling = () => {
  if (taskId.value) {
    clearInterval(pollingTimer)
    pollingTimer = null
    taskId.value = ''
  }
}

/**
 * 图片上传处理函数

 * @param param0 file 文件信息

 */
const uploadLoading = ref<boolean>(false)
const handleUpload = async () => {
  uploadLoading.value = true

  try {
    const params: API.PictureUploadRequest = {
      fileUrl: resultImageUrl.value,
      spaceId: props.spaceId,
    }

    // 如果有图片id，则更新该图片，否则新增图片
    if (props.picture) {
      params.id = props.picture?.id
    }

    const res = await uploadPictureByUrlUsingPost(params)
    console.log(res, '================')
    if (res.code === 0 && res.data) {
      message.success('上传图片成功')
      props.onSuccess(res.data)
      // 关闭弹窗
      handleCancel()
    } else {
      console.log(res, '456')
      message.error('上传图片失败:' + res.message)
    }
  } catch (error) {
    console.log(456)
    message.error('上传图片失败,error:' + error.message)
  } finally {
    uploadLoading.value = false
  }
}

// 填写图配文的标题

const AIImageSynthesisTitle = ref([])

const options = ref([
  {
    label: '测试',
    value: '测试',
  },
  {
    label: '动漫',
    value: '动漫',
  },
])

/**
 * 打开弹窗
 * @param e 鼠标事件对象
 */
const handleOpen = (e: MouseEvent) => {
  visible.value = true
}
/**
 * 关闭弹窗
 */
const handleCancel = () => {
  visible.value = false
}

// 暴露方法给父组件使用
defineExpose({
  handleOpen,
})
onMounted(() => {
  console.log('Component mounted')
})

// 清理定时器，避免内存泄露
onUnmounted(() => {
  clearPolling()
})
</script>

<style scoped lang="less" scope>
.vue-cropper {
  height: 400px !important;
}
</style>
