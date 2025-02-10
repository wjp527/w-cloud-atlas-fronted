<template>
  <div class="ImageCropper">
    <a-modal class="" v-model:open="visible" :title="title" :footer="false" @cancel="handleCancel">
      <!-- 图片裁切 -->
      <vue-cropper
        ref="cropperRef"
        :img="imageUrl"
        output-type="png"
        :info="true"
        :can-move="false"
        :can-move-box="true"
        :fixed-box="false"
        :auto-crop="true"
        :center-box="true"
      ></vue-cropper>

      <!-- 图片操作 -->
      <div class="flex justify-center mt-4">
        <a-space>
          <a-button @click="rotateLeft" class="btn">左旋</a-button>
          <a-button @click="rotateRight" class="btn">右旋</a-button>
          <a-button @click="changeScale(1)" class="btn">放大</a-button>
          <a-button @click="changeScale(-1)" class="btn">缩小</a-button>
          <a-button type="primary" @click="handleConfirm">确认</a-button>
        </a-space>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup name="ImageCropper">
import { uploadPictureUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { ref, onMounted, computed } from 'vue'
import { VueCropper } from 'vue-cropper'
import 'vue-cropper/dist/index.css'

interface Props {
  imageUrl?: string
  title?: string
  picture?: API.Picture
  spaceId: number | string
  onSuccess: (data: any) => void
}

const props = withDefaults(defineProps<Props>(), {
  title: '裁切图片',
})
const visible = ref<boolean>(false)
const cropperRef = ref<InstanceType<typeof VueCropper> | null>(null)

const changeScale = (num: number) => {
  num = num || 1
  cropperRef.value?.changeScale(num)
}

const rotateLeft = () => {
  cropperRef.value?.rotateLeft()
}

const rotateRight = () => {
  cropperRef.value?.rotateRight()
}

// 确认裁切图片
const handleConfirm = () => {
  cropperRef.value.getCropBlob((blob: Blob) => {
    // blob 为已经裁切好的图片 blob 对象
    const fileName = (props.picture?.name || 'image') + '.png'
    const file = new File([blob], fileName, { type: blob.type })
    // 上传图片
    handleUpload({ file })
    // const file = new File([blob], fileName, { type: 'image/png' })
  })
}

/**
 * 图片上传处理函数

 * @param param0 file 文件信息

 */
const loading = ref<boolean>(false)
const handleUpload = async ({ file }: any) => {
  loading.value = true

  try {
    const params: API.PictureUploadRequest = props.picture?.id ? { id: props.picture.id } : {}
    params.spaceId = props.spaceId

    // 调用上传接口
    const res = await uploadPictureUsingPost(params, {}, file)
    if (res.code === 0 && res.data) {
      message.success('上传图片成功')
      props?.onSuccess(res.data)
      handleCancel()
    } else {
      message.error('上传图片失败:' + res.message)
    }
  } catch (error) {
    message.error('上传图片失败,error:' + error.message)
  } finally {
    loading.value = false
  }
}

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
</script>

<style scoped lang="less" scope>
.vue-cropper {
  height: 400px !important;
}
</style>
