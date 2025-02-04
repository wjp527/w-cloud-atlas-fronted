import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import store from './store'

import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import '@/index.css';
// 引入权限校验
import '@/access.ts'

// 图片裁剪组件
import VueCropper from 'vue-cropper';
import 'vue-cropper/dist/index.css'
// echarts图表组件库
import VChart from "vue-echarts";
import "echarts";
// 词云图
import 'echarts-wordcloud';


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
// 分享弹窗组件
import ShowModal from '@/components/Modal/ShowModal.vue'
// 批量编辑组件
import BatchEditPictureModal from '@/components/Modal/BatchEditPictureModal.vue'
// 引入图片裁切组件
import ImageCropper from '@/components/Test/ImageCropper.vue'
// 引入AI扩图组件
import ImageOutPainting from '@/components/Modal/ImageOutPainting.vue'
// 空间使用分析
import SpaceUsageAnalyze from '@/components/analyze/SpaceUsageAnalyze.vue'
// 空间图片分析分类
import SpaceCategoryAnalyze from '@/components/analyze/SpaceCategoryAnalyze.vue'
// 标签分析
import SpaceTagAnalyze from '@/components/analyze/SpaceTagAnalyze.vue'
// 图片大小分段分析
import SpaceSizeAnalyze from '@/components/analyze/SpaceSizeAnalyze.vue'
// 用户上传行为分析
import SpaceUserAnalyze from '@/components/analyze/SpaceUserAnalyze.vue'
// 空间使用排行分析
import SpaceRankAnalyze from '@/components/analyze/SpaceRankAnalyze.vue'
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
// 分享弹窗组件
app.component('ShowModal', ShowModal)
// 批量编辑组件
app.component('BatchEditPictureModal', BatchEditPictureModal)
// 图片裁切组件
app.component('ImageCropper', ImageCropper)
// AI扩图组件
app.component('ImageOutPainting', ImageOutPainting)
// 空间使用分析
app.component('SpaceUsageAnalyze', SpaceUsageAnalyze)

// 空间图片分析分类
app.component('SpaceCategoryAnalyze', SpaceCategoryAnalyze)
// 标签分析
app.component('SpaceTagAnalyze', SpaceTagAnalyze)
// 图片大小分段分析
app.component('SpaceSizeAnalyze', SpaceSizeAnalyze)
// 用户上传行为分析
app.component('SpaceUserAnalyze', SpaceUserAnalyze)
// 空间使用排行分析
app.component('SpaceRankAnalyze', SpaceRankAnalyze)


// 引入颜色选择器组件
import Vue3ColorPicker from "vue3-colorpicker";
import "vue3-colorpicker/style.css";

app.use(store)
app.use(router)
app.use(Antd)
// 引入颜色选择器组件
app.use(Vue3ColorPicker)
// 引入图片裁剪组件
app.use(VueCropper)
// 引入图表组件
app.component('v-chart', VChart)

app.mount('#app')

