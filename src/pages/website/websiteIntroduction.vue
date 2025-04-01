<template>
  <div class="websiteIntroduction">
    <a-typography>
      <a-typography-title>π立方</a-typography-title>
      <a-typography-paragraph> π立方 暗喻: "存储 + 智能 + 协同" 三维一体 </a-typography-paragraph>
      <a-typography-title :level="2">项目介绍:</a-typography-title>
      <a-typography-paragraph>
        {{ introduction }}
      </a-typography-paragraph>
    </a-typography>
  </div>
</template>
<script lang="ts" setup name="websiteIntroduction">
const introduction =
  '基于 Vue 3 + Spring Boot + COS + WebSocket 的企业级智能协同云图库平台。项目应用场景广泛，可作为表情包网站、设计素材网站、壁纸网站、个人云盘、企业活动相册等。用户可以在平台公开上传和检索图片素材；管理员可以上传、审核和管理分析图片；个人用户可将图片上传至私有空间进行批量管理、检索、编辑和分析；企业可开通团队空间并邀请成员，共享图片并实时协同编辑图片。技术栈包括 MySQL、Redis + Caffeine 多级缓存、COS 对象存储、Sa-Token 、WebSocket 实时通讯、JUC、Disruptor、AI 绘图大模型、设计模式等。'
</script>

<style lang="less" scoped></style>
