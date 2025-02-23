<template>
  <div class="GlobalSider" v-if="loginUser.id">
    <a-layout-sider collapsible style="background: #fff" breakpoint="lg">
      <a-menu v-model:selectedKeys="current" mode="inline" :items="items" @click="doMenuClick" />
    </a-layout-sider>
  </div>
</template>
<script lang="ts" setup name="GlobalSider">
import { h, onMounted, ref, computed, watchEffect } from 'vue'
import { PictureOutlined, TeamOutlined, UserSwitchOutlined } from '@ant-design/icons-vue'
import { MenuProps, message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/User'
import { SPACE_TYPE_ENUM } from '@/constants/space'
import { listMyTeamSpaceUsingPost } from '@/api/spaceUserController'
const userStore = useUserStore()
const { loginUser } = storeToRefs(userStore)
const router = useRouter()

// 固定的菜单列表
const fixedMenuItems = ref<MenuProps['items']>([
  {
    key: '/',
    icon: () => h(PictureOutlined),
    label: '公共图库',
    title: '公共图库',
  },
  {
    key: '/my_space',

    icon: () => h(UserSwitchOutlined),
    label: '我的空间',
    title: '添加图片',
  },
  {
    key: `/space/addSpace?type=${SPACE_TYPE_ENUM.TEAM}`,

    icon: () => h(TeamOutlined),
    label: '团队空间',
    title: '创建团队',
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
  return filterMenus(menuItems.value)
})

/**
 * 菜单点击事件 
 * @param param0
 */
const doMenuClick = ({ key }: { key: string }) => {
  router.push(key)
}
// 当前要高亮的菜单
const current = ref<string[]>([])
// 监听路由变化，更新当前要高亮的菜单
router.afterEach((to) => {
  current.value = [to.path]
})

// 初始化
const init = async () => {
  await userStore.fetchLoginUser()
}

const teamSpaceList = ref<API.SpaceVO[]>([])
const menuItems = computed(() => {
  if (teamSpaceList.value.length > 0) {
    const teamMenus = teamSpaceList.value.map((item) => {
      console.log(teamSpaceList.value, 'item')
      return {
        key: `/space/detail/${item?.spaceId}`,
        icon: () => h(PictureOutlined),
        label: item.space?.spaceName,
        title: item.space?.spaceName,
      }
    })

    const teamSpaceMenuGroup = {
      type: 'group',
      label: '我的团队',
      children: teamMenus,
      key: 'teamSpace',
    }
    return [...fixedMenuItems.value, teamSpaceMenuGroup] as MenuProps['items']
  }
  return fixedMenuItems.value
})
const fetchTeamSpaceList = async () => {
  const res = await listMyTeamSpaceUsingPost()
  if (res.code == 0) {
    teamSpaceList.value = res.data
  } else {
    message.error('获取团队空间失败:' + res.message)
  }
}

watchEffect(() => {
  if (loginUser.value) {
    fetchTeamSpaceList()
  }
})

onMounted(() => {
  init()
})
</script>

<style lang="less" scoped>
.GlobalSider {
  background-color: #fff !important;
  // background-color: unset;
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

/deep/ .ant-layout-sider-trigger {
  background-color: #fff !important;
  color: #333 !important;
}

/deep/ .ant-menu {
  border: none !important;
}
</style>
