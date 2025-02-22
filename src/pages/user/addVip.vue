<template>
  <div class="AddCouponPage">
    <h2 class="text-[24px]">添加兑换码</h2>

    <div class="mb-10"></div>
    <a-form layout="vertical" :model="formData" @finish="handleFinish" class="mb-10">
      <a-form-item name="vipCode" label="兑换码">
        <a-input v-model:value="formData.vipCode" placeholder="请输入兑换码" allow-clear />
      </a-form-item>

      <a-form-item>
        <a-button :loading="loading" type="primary" html-type="submit" class="w-full mb-10">
          添加兑换码
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts" setup name="AddCouponPage">
import { ref } from 'vue'
import { FormProps } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { exchangeVipUsingPost } from '@/api/userController'

const router = useRouter()

const loading = ref<boolean>(false)
// 表单数据
const formData = ref({
  vipCode: '',
})

// 提交表单
const handleFinish: FormProps['onFinish'] = async () => {
  loading.value = true
  const res = await exchangeVipUsingPost({ ...formData.value })
  if (res.code === 0) {
    message.success('兑换码添加成功')
    router.push('/')
  } else {
    message.error('兑换码添加失败: ' + res.message)
  }
  loading.value = false
}
</script>

<style lang="less" scoped>
.AddCouponPage {
  max-width: 720px;
  margin: 0 auto;
}
</style>
