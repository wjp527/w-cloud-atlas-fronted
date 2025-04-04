<template>
  <div>
    <div class="global-header">
      <a-row :wrap="false">
        <a-col>
          <!-- <a-col flex="200px"> -->
          <router-link to="/">
            <div class="titlt-bar">
              <div class="logo"></div>
              <div class="title">π立方</div>
            </div>
          </router-link>
        </a-col>
        <a-col flex="auto" v-if="loginUser?.id">
          <a-menu
            v-model:selectedKeys="current"
            mode="horizontal"
            :items="items"
            @click="doMenuClick"
          />
        </a-col>

        <a-col flex="120px">
          <div class="user-login-status">
            <div v-if="loginUser?.id">
              <a-dropdown>
                <a class="ant-dropdown-link" @click.prevent>
                  <a-avatar :src="loginUser.userAvatar" />
                  {{ loginUser.userName }}
                </a>
                <template #overlay>
                  <a-menu>
                    <a-menu-item>
                      <router-link to="/user/center">个人中心</router-link>
                    </a-menu-item>
                    <a-menu-item>
                      <UserSwitchOutlined />
                      <router-link to="/my_space">我的空间</router-link>
                    </a-menu-item>
                    <a-menu-item>
                      <UserSwitchOutlined />
                      <router-link to="/user/addVip">添加会员</router-link>
                    </a-menu-item>
                    <a-menu-item @click="handleLogout" class="flex items-center">
                      <LogoutOutlined />
                      退出登录
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>
            <div v-else>
              <a-button type="primary" @click="handleLogin">登录</a-button>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>
  </div>
</template>
<script lang="ts" setup name="GlobalHeader">
import { h, onMounted, ref, computed } from 'vue'
import { HomeOutlined, LogoutOutlined, UserSwitchOutlined } from '@ant-design/icons-vue'
import { MenuProps, message } from 'ant-design-vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/User'
import { userLogoutUsingPost, getLoginUserUsingGet } from '@/api/userController'
const userStore = useUserStore()
const { loginUser } = storeToRefs(userStore)

const router = useRouter()
const route = useRoute()
// 未经过滤的菜单
const originItems = ref<MenuProps['items']>([
  {
    key: '/',
    icon: () => h(HomeOutlined),
    label: '首页',
    title: '首页',
  },
  {
    key: '/picture/addPicture',
    label: '添加图片',
    title: '添加图片',
  },
  {
    key: '/admin/userManage',
    label: '用户管理',
    title: '用户管理',
  },
  {
    key: '/admin/pictureManage',
    label: '图片管理',
    title: '图片管理',
  },
  {
    key: '/admin/spaceManage',
    label: '空间管理',
    title: '空间管理',
  },
  {
    key: '/websiteIntroduction',
    label: '网站介绍',
    title: '网站介绍',
  },
  {
    key: 'others',
    label: h(
      'a',
      {
        href: 'https://github.com/wjp527',
        target: '_blank',
      },
      'GitHub',
    ),
    title: 'GitHub',
  },
])

// 根据权限动态显示菜单
const filterMenus = (menus = [] as MenusProps['items']) => {
  return menus.filter((menu) => {
    if (!menu.key) {
      return false
    }
    if (menu.key.startsWith('/admin')) {
      const loginUser = userStore.loginUser
      if (!loginUser || loginUser.userRole != 'admin') {
        return false
      }
    }
    return true
  })
}

// 根据权限动态显示菜单
const items = computed(() => {
  return filterMenus(originItems.value)
})

// 只有非登录和注册页面才显示头部
const isShowHeader = computed(() => {
  return (
    !router.currentRoute.value.path.includes('/login') &&
    !router.currentRoute.value.path.includes('/register')
  )
})

/**
 * 菜单点击事件
 * @param param0
 */
const doMenuClick = ({ key }: { key: string }) => {
  // 如何获取上一次跳转的路径
  const lastPath = route.path
  console.log(lastPath, 'lastPath')
  if (key === 'others') {
    router.push({
      path: lastPath,
    })
    return
  }
  router.push({
    path: key,
  })
}
// 当前要高亮的菜单
const current = ref<string[]>([])
// 监听路由变化，更新当前要高亮的菜单
router.afterEach((to) => {
  current.value = [to.path]
})

// 用户登录
const handleLogin = async () => {
  router.replace('/user/login')
}

// 退出登录
const handleLogout = async () => {
  const res: any = await userLogoutUsingPost()
  if (res.code === 0) {
    message.success('退出登录成功')
    loginUser.value = {
      userName: '未登录',
    }
    router.replace('/user/login')
  } else {
    message.error('退出登录失败:' + res.message)
  }
}

// 初始化

const init = async () => {
  const res = await getLoginUserUsingGet()
  if (res.code === 40100) {
    loginUser.value = {}
  }
}
onMounted(() => {
  init()
})
</script>

<style lang="less" scoped>
/deep/ .ant-row {
  display: flex;
  justify-content: space-between;
}
.global-header {
  background-color: unset;
  padding: 0;

  .titlt-bar {
    display: flex;
    align-items: center;
    height: 100%;

    .logo {
      background: url('@/assets/logo.png') no-repeat center center;
      background-size: contain;
      width: 48px;
      height: 48px;
      margin-right: 10px;
    }

    .title {
      color: #333;
      font-size: 18px;
      font-weight: 600;
    }
  }

  .user-login-status {
  }
}

.logo {
  background: url('@/assets/logo.png') no-repeat center center;
  background-size: contain;
  width: 58px;
  height: 58px;
  margin: 0 auto;
}
</style>
