<template>
  <div class="manageMode">
    <a-modal
      v-model:open="open"
      :title="modalData.id ? '编辑' : '新增'"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <!-- 弹窗内容 -->
      <a-form :model="modalData" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
        <a-form-item label="账号" name="userAccount" v-if="!modalData.id">
          <a-input v-model:value="modalData.userAccount" />
        </a-form-item>
        <a-form-item label="用户名" name="userName">
          <a-input v-model:value="modalData.userName" />
        </a-form-item>
        <a-form-item label="简介" name="userProfile">
          <a-input v-model:value="modalData.userProfile" />
        </a-form-item>
        <a-form-item label="角色权限" name="userRole">
          <a-select v-model:value="modalData.userRole" style="width: 120px">
            <a-select-option value="user">用户</a-select-option>
            <a-select-option value="admin">管理员</a-select-option>
            <a-select-option value="ban">禁用</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="用户头像" name="userAvatar">
          <a-upload
            name="avatar"
            list-type="picture-card"
            class="avatar-uploader"
            :show-upload-list="false"
            :before-upload="beforeUpload"
            :custom-request="handleUpload"
          >
            <img v-if="modalData.userAvatar" :src="modalData.userAvatar" alt="avatar" />
            <div v-else>
              <loading-outlined v-if="loading"></loading-outlined>
              <plus-outlined v-else></plus-outlined>
              <div class="ant-upload-text">Upload</div>
            </div>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import type { UploadProps } from 'ant-design-vue'
import { userUploadFileUsingPost } from '@/api/userController'

interface Props {
  open: boolean
  modalData: any
  submitForm: (data: any) => void
}

const props = defineProps<Props>()
const emit = defineEmits(['update:open'])

// 使用本地状态同步父组件的 open
const open = ref(props.open)
const modalData = ref(props.modalData)
// 监听父组件的 open 变化
watch(
  () => props.open,
  (newVal) => {
    open.value = newVal
  },
)
watch(
  () => props.modalData,
  (newVal) => {
    modalData.value = newVal
  },
)

const handleOk = (e: MouseEvent) => {
  open.value = false
  emit('update:open', false) // 通知父组件更新 open 的值
  // 通知父组件提交表单
  modalData.value = { ...modalData.value, id: props.modalData.id }
  emit('submitForm', modalData.value)
}

const handleCancel = () => {
  open.value = false
  emit('update:open', false) // 通知父组件更新 open 的值
}

// 图片上传
function getBase64(img: Blob, callback: (base64Url: string) => void) {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result as string))
  reader.readAsDataURL(img)
}

const loading = ref<boolean>(false)

// 上传图片
const handleUpload = async ({ file }: any) => {
  loading.value = true

  try {
    // 调用上传接口
    const res = await userUploadFileUsingPost({}, file)
    if (res.code === 0 && res.data) {
      message.success('上传图片成功')
      modalData.value.userAvatar = res.data
    } else {
      message.error('上传图片失败:' + res.message)
    }
  } catch (error) {
    message.error('上传图片失败,error:' + error.message)
  } finally {
    loading.value = false
  }
}

// 上传图片前校验
const beforeUpload = (file: UploadProps['fileList'][number]) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('You can only upload JPG file!')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!')
  }
  return isJpgOrPng && isLt2M
}
</script>
