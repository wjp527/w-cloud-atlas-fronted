<template>
  <div class="UserCenter">
    <a-form
      :model="formState"
      name="basic"
      :label-col="{ span: 8 }"
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

      <a-form-item
        label="用户头像"
        name="userAvatar"
        :rules="[{ required: true, message: 'Please input your userAvatar!' }]"
      >
        <a-input v-model:value="formState.userAvatar" />
      </a-form-item>

      <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
        <a-button type="primary" html-type="submit">Submit</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
// 引入用户信息
import { useUserStore } from '@/store/User'
import { storeToRefs } from 'pinia'
import { updateUserUsingPost } from '@/api/userController'
import { message } from 'ant-design-vue'
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
