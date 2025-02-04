<template>
  <div class="SpaceAnalyzePage pb-10">
    <h2 class="text-[28px]">空间图库分析</h2>
    <div v-if="queryAll" class="text-[18px] mt-5 mb-5">全部空间</div>
    <div v-else-if="queryPublic" class="text-[18px] mt-5 mb-5">公共空间</div>
    <div v-else class="text-[18px] mt-5 mb-5">
      <a :href="`/space/detail/${spaceId}`" target="_blank">特定空间: {{ spaceId }}</a>
    </div>

    <a-row :gutter="[16, 16]">
      <!-- 空间使用分析 -->
      <a-col :xs="24" :md="12">
        <SpaceUsageAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
      </a-col>

      <!-- 空间图片分析分类 -->
      <a-col :xs="24" :md="12">
        <SpaceCategoryAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
      </a-col>

      <!-- 标签分析 -->
      <a-col :xs="24" :md="12">
        <SpaceTagAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
      </a-col>

      <!-- 图片大小分段分析 -->
      <a-col :xs="24" :md="12">
        <SpaceSizeAnalyze :spaceId="spaceId" :queryAll="queryAll" :queryPublic="queryPublic" />
      </a-col>

      <!-- 用户上传行为分析 -->
      <a-col :xs="24" :md="12">
        <SpaceUserAnalyze
          :spaceId="spaceId"
          :queryAll="queryAll != 1 ? false : queryAll"
          :queryPublic="queryPublic != 1 ? false : queryPublic"
          timeDimension="daily"
        />
      </a-col>

      <!-- 空间使用排行分析 -->
      <a-col :xs="24" :md="12" v-if="isAdmin">
        <SpaceRankAnalyze />
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts" setup name="SpaceAnalyzePage">
import { useUserStore } from '@/store/User'
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 空间ID
const spaceId = computed(() => {
  return route?.query?.spaceId as string
})

// 是否查询全部空间数据
const queryAll = computed(() => {
  return !!route?.query?.queryAll
})

// 是否查询公共空间数据
const queryPublic = computed(() => {
  return !!route?.query?.queryPublic
})

// 用户信息存储仓库
const userStore = useUserStore()

// 是否有管理员权限
const isAdmin = computed(() => {
  return userStore.loginUser.userRole === 'admin'
})

onMounted(() => {})
</script>

<style lang="less" scoped>
/deep/ .ant-card {
  height: 100% !important;
}
</style>
