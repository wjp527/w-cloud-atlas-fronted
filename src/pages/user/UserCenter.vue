<template>
  <div class="UserCenter flex items-center justify-center flex-col w-full">
    <a-form
      class="w-full"
      :model="formState"
      name="basic"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
      @finish="onFinish"
      @finishFailed="onFinishFailed"
    >
      <a-form-item
        label="账号"
        name="userAccount"
        :rules="[{ required: true, message: 'Please input your userAccount!' }]"
      >
        <a-input v-model:value="formState.userAccount" />
      </a-form-item>
      <a-form-item
        label="用户名"
        name="userName"
        :rules="[{ required: true, message: 'Please input your userName!' }]"
      >
        <a-input v-model:value="formState.userName" />
      </a-form-item>

      <a-form-item
        label="用户简介"
        name="userProfile"
        :rules="[{ required: true, message: 'Please input your userProfile!' }]"
      >
        <a-input v-model:value="formState.userProfile" />
      </a-form-item>

      <a-form-item label="用户头像" name="userAvatar">
        <div id="PictureUpload">
          <a-upload
            list-type="picture-card"
            :show-upload-list="false"
            :custom-request="handleUpload"
            :before-upload="beforeUpload"
          >
            <img v-if="formState?.userAvatar" :src="formState.userAvatar" alt="avatar" />
            <div v-else>
              <loading-outlined v-if="loading"></loading-outlined>
              <plus-outlined v-else></plus-outlined>
              <div class="ant-upload-text">点击或拖拽上传图片</div>
            </div>
          </a-upload>
        </div>
      </a-form-item>


      <a-form-item
        label="用户标识"
        name="id"
      >
        <a-typography-link copyable>
          {{ loginUser.id }}
        </a-typography-link>
      </a-form-item>

      <a-form-item :wrapper-col="{ offset: 4, span: 16 }">
        <a-button type="primary" html-type="submit">保存</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
// 引入用户信息
import { useUserStore } from '@/store/User'
import { storeToRefs } from 'pinia'
import { updateUserUsingPost, userUploadFileUsingPost } from '@/api/userController'
import { message } from 'ant-design-vue'
import type { UploadProps } from 'ant-design-vue'
// 用户仓库
const userStore = useUserStore()
// 该登录账号的用户信息
const { loginUser } = storeToRefs(userStore)

const formState = ref<API.LoginUserVO>({
  id: 0,
  userAccount: '',
  userName: '',
  userProfile: '',
  userAvatar: '',
})
// 初始化用户信息

const init = async () => {
  await userStore.fetchLoginUser()
  formState.value = JSON.parse(JSON.stringify(loginUser.value))
}

/**
 * 图片上传处理函数

 * @param param0 file 文件信息

 */
const loading = ref<boolean>(false)
const handleUpload = async ({ file }: any) => {
  loading.value = true

  try {
    // 调用上传接口
    const res = await userUploadFileUsingPost({}, file)
    if (res.code === 0 && res.data) {
      message.success('上传图片成功')
      formState.value.userAvatar = res.data
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

onMounted(() => {
  init()
})

const onFinish = async () => {
  const res = await updateUserUsingPost(formState.value)
  if (res.code === 0) {
    message.success('修改成功')
    init()
  } else {
    message.error('修改失败')
  }
}

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo)
}
</script>

<style lang="less" scoped>
.UserCenter {
}
</style>
