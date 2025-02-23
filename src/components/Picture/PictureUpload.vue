<template>
  <div id="PictureUpload">
    <a-upload
      list-type="picture-card"
      :show-upload-list="false"
      :custom-request="handleUpload"
      :before-upload="beforeUpload"
    > 
      <img v-if="picture?.url" :src="picture.url" alt="avatar" />
      <div v-else>
        <loading-outlined v-if="loading"></loading-outlined>
        <plus-outlined v-else></plus-outlined>
        <div class="ant-upload-text">点击或拖拽上传图片</div>
      </div>
    </a-upload>
  </div>
</template>
<script lang="ts" setup name="PictureUpload">
import { ref } from 'vue'
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { UploadProps } from 'ant-design-vue'
import { uploadPictureUsingPost } from '@/api/pictureController'

interface Props {
  picture?: API.PictureVO
  spaceId?: number
  onSuccess?: (newPicture: API.PictureVO) => void
}
const props = defineProps<Props>()

const loading = ref<boolean>(false)

/**
 * 图片上传处理函数

 * @param param0 file 文件信息

 */
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
 * 上传前校验
 * @param file 文件
 * @returns 是否上传
 */
const beforeUpload = (file: UploadProps['fileList'][number]) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('不支持的文件格式，推荐使用jpg、png格式')
  }
  // 图片大小校验
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过2M')
  }
  return isJpgOrPng && isLt2M
}
</script>
<style lang="less" scoped>
/deep/.ant-upload {
  width: 100% !important;
  height: 100% !important;
  min-height: 152px !important;
}

/deep/.ant-upload img {
  max-width: 100% !important;
  max-height: 230px !important;
}
.PictureUpload {
  .avatar-uploader > .ant-upload {
    width: 128px;
    height: 128px;
  }

  .ant-upload-select-picture-card i {
    font-size: 32px;
    color: #999;
  }

  .ant-upload-select-picture-card .ant-upload-text {
    margin-top: 8px;
    color: #666;
  }
}
</style>
