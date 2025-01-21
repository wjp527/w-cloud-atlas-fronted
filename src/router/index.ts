import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: '首页',
      component: () => import('../pages/Home/HomePage.vue'),
    },
    {
      path: '/user/login',
      name: '用户登录',
      component: () => import('../pages/user/UserLoginPage.vue'),
    },
    {
      path: '/user/register',
      name: '用户注册',
      component: () => import('../pages/user/UserRegisterPage.vue'),
    },
    {
      path: '/user/center',
      name: '个人中心',
      component: () => import('../pages/user/UserCenter.vue'),
    },
    {
      path: '/admin/userManage',
      name: '用户管理',
      component: () => import('../pages/admin/UserManagePage.vue'),
    },
    {
      path: '/admin/pictureManage',
      name: '图片管理',
      component: () => import('../pages/admin/PictureManagePage.vue'),
    },
    {
      path: '/picture/addPicture',
      name: '添加图片',
      component: () => import('../pages/picture/AddPicturePage.vue'),
    },
    {
      path: '/picture/detail/:id',
      name: '图片详情',
      props: true,
      component: () => import('../pages/picture/PictureDetailPage.vue'),
    },
    {
      path: '/pic',
      name: 'pic',
      component: () => import('../pages/test/pic.vue')
    }
  ],
})

export default router
