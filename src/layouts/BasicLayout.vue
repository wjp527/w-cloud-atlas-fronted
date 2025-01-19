<template>
  <div id="basicLayout">
    <a-layout class="h-screen">
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
      <a-layout-footer class="footer">
        <a href="https://github.com/wjp527" target="_blank"> wjp </a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>
<script lang="ts" setup name="BasicLayout">
import GlobalHeader from '@/components/GlobalHeader/GlobalHeader.vue'
</script>

<style lang="less" scoped>
#basicLayout {
  .header {
    padding-inline: 20px;
    background-color: #fff;
    color: unset;
    margin-bottom: 16px;
  }
  .content {
    padding: 16px;
    background: linear-gradient(to right, #efefef, #ffffff);
    margin-bottom: 20px;

  }

  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #efefef;
    padding: 16px;
    text-align: center;
  }
}
</style>
