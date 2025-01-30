<template>
  <a-config-provider :locale="locale">
    <div id="app">
      <BasicLayout />
    </div>
  </a-config-provider>
</template>

<script setup lang="ts">
// 引入布局组件
import BasicLayout from '@/layouts/BasicLayout.vue'

import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')

const locale = zhCN
</script>

<style lang="less" scoped></style>
