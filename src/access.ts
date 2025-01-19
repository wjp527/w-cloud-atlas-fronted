import router from '@/router'
import { useUserStore } from '@/store/User'
import { message } from 'ant-design-vue'

// 是否为首次获取登录用户
let firstFetchLoginUser = true
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  let loginUser = userStore.loginUser
  if (firstFetchLoginUser) {
    // 确保页面刷新时，首次加载，能等待后端返回用户信息后再校验权限
    await userStore.fetchLoginUser()
    loginUser = userStore.loginUser
    firstFetchLoginUser = false
  }

  const toUrl = to.path
  // 可以自己定义权限逻辑，比如管理员才能访问， /admin 开头的页面
  if (toUrl.startsWith('/admin')) {
    if (!loginUser || loginUser.userRole != 'admin') {
      message.error('您没有权限访问该页面')
      // 跳转到登录页面，并携带当前路径
      next(`/user/login?redirect=${to.fullPath}`)
      return;
    }
  }
  next()
})
