import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import store from './store'

import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import '@/index.css';
// 引入权限校验
import '@/access.ts'

// 引入全局组件
import manageMode from '@/components/Manage/manageMode.vue'
import PictureUpload from '@/components/Picture/PictureUpload.vue'

const app = createApp(App)

// 注册全局组件
// 管理员的新增修改用户列表 弹窗
app.component('manageMode', manageMode)
// 图片上传组件
app.component('PictureUpload', PictureUpload)

app.use(store)
app.use(router)
app.use(Antd)

app.mount('#app')

