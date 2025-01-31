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
// 图片上传组件
import PictureUpload from '@/components/Picture/PictureUpload.vue'
// 在线url导入图片组件
import UrlPictureUpload from '@/components/Picture/UrlPictureUpload.vue'
// 瀑布流组件
import WaterfallFlow from './components/Test/WaterfallFlow.vue';
// 图片搜索表单组件
import PictureSearchForm from '@/components/Picture/PictureSearchForm.vue'

const app = createApp(App)

// 注册全局组件
// 管理员的新增修改用户列表 弹窗
app.component('manageMode', manageMode)
// 图片上传组件
app.component('PictureUpload', PictureUpload)
// 在线url导入图片组件
app.component('UrlPictureUpload', UrlPictureUpload)
// 瀑布流组件
app.component('WaterfallFlow', WaterfallFlow)
// 图片搜索表单组件
app.component('PictureSearchForm', PictureSearchForm)

// 引入颜色选择器组件
import Vue3ColorPicker from "vue3-colorpicker";
import "vue3-colorpicker/style.css";

app.use(store)
app.use(router)
app.use(Antd)
app.use(Vue3ColorPicker)

app.mount('#app')

