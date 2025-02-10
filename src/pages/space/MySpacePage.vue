<template>
  <div class="MySpace">我的空间正在加载...</div>
</template>
<script lang="ts" setup name="MySpace">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/User'
import { storeToRefs } from 'pinia'
import { listSpaceVoByPageUsingPost } from '@/api/spaceController'
import { message } from 'ant-design-vue'
import { SPACE_TYPE_ENUM } from '@/constants/space'
// 路由跳转对象
const router = useRouter()

// 用户仓库
const userStore = useUserStore()
const { loginUser } = storeToRefs(userStore)

// 检查用户是否有个人空间
const checkUserSpace = async () => {
  if (!loginUser.value.id) {
    router.replace('/user/login')
  }

  // 如果用户已经登陆，会获取该用户已创建的空间
  const res = await listSpaceVoByPageUsingPost({
    userId: loginUser.value.id,
    current: 1,
    pageSize: 1,
    spaceType: SPACE_TYPE_ENUM.PRIVATE,
  })
  if (res.code === 0) {
    const len = res.data.records.length
    console.log(len, 'len')
    if (len > 0) {
      const id = res.data.records[0].id
      router.replace('/space/detail/' + id)
    } else {
      // 没有空间，跳转到创建空间的页面
      router.replace('/space/addSpace')
      message.warn('请先创建空间')
    }
  } else {
    message.error('加载我的空间失败: ' + res.message)
  }
}

// 在页面加载时检查用户空间
onMounted(() => {
  checkUserSpace()
})
</script>

<style lang="less" scoped>
.MySpace {
  // background-color: pink;
}
</style>
