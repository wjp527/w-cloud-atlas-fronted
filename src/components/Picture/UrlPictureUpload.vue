<template>
  <div id="UrlPictureUpload" class="mt-4 mb-4">
    <a-input-group compact>
      <a-input
        v-model:value="fileUrl"
        style="width: calc(100% - 80px)"
        placeholder="请输入图片链接"
      />
      <a-button class="w-20" type="primary" @click="handleUpload">保存</a-button>
    </a-input-group>

    <div class="flex justify-center mt-1">
      <img v-if="picture?.url" :src="picture.url" alt="avatar" />
    </div>
  </div>
</template>
<script lang="ts" setup name="UrlPictureUpload">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { uploadPictureByUrlUsingPost } from '@/api/pictureController'

interface Props {
  picture?: API.PictureVO
  spaceId?: number

  onSuccess?: (newPicture: API.PictureVO) => void
}
const props = defineProps<Props>()

const loading = ref<boolean>(false)
const fileUrl = ref<string>('')

const handleUpload: API.PictureUploadRequest = async () => {
  loading.value = true

  try {
    const params: API.PictureUploadRequest = {
      fileUrl: fileUrl.value,
      spaceId: props.spaceId,
    }

    // 如果有图片id，则更新该图片，否则新增图片
    if (props.picture) {
      params.id = props.picture?.id
    }

    const res = await uploadPictureByUrlUsingPost(params)
    if (res.code === 0 && res.data) {
      message.success('上传图片成功')
      props?.onSuccess(res.data)
    } else {
      message.error('上传图片失败:' + res.message)
    }
  } catch (error) {
    message.error('上传图片失败,error:' + error.message)
  } finally {
    loading.value = false
  }
}
</script>
<style lang="less" scoped>
img {
  max-width: 100% !important;
  max-height: 230px !important;
}
</style>
