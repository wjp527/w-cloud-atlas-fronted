<template>
  <div id="basicLayout">
    <a-layout class="h-screen">
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>

      <a-layout>
        <GlobalSider />
        <a-layout-content class="content">
          <router-view />
        </a-layout-content>
      </a-layout>

      <a-layout-footer class="footer">
        <a href="https://github.com/wjp527" target="_blank"> wjp </a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>
<script lang="ts" setup name="BasicLayout">
import GlobalHeader from '@/components/GlobalHeader/GlobalHeader.vue'
import GlobalSider from '@/components/GlobalSider/GlobalSider.vue'
</script>

<style lang="less" scoped>
#basicLayout {
  .header {
    padding-inline: 20px;
    background-color: #fff;
    color: unset;
    margin-bottom: 6px;
  }
  .content {
    padding: 28px;
    // background: linear-gradient(to right, #efefef, #ffffff);
    // background-color: pink;
    background-color: #fff;

    // height: calc(100% - 120px);
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
