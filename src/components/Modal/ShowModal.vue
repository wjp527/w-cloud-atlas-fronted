<template>
  <div class="ShowModal">
    <a-modal v-model:open="visible" :title="title" :footer="false" @cancel="handleCancel">
      <h4>复制分享链接</h4>
      <a-typography-link copyable>
        {{ link }}
      </a-typography-link>

      <h4>手机扫码</h4>
      <a-space direction="vertical" align="center">
        <a-qrcode :value="link" />
      </a-space>
    </a-modal>
  </div>
</template>
<script lang="ts" setup name="ShowModal">
import { ref } from 'vue'

interface Props {
  title?: string
  link: string
}
const props = withDefaults(defineProps<Props>(), {
  title: '分享图片',
  link: 'https://github.com/wjp527',
})
const visible = ref<boolean>(false)

/**
 * 打开弹窗
 * @param e 鼠标事件对象
 */
const handleOpen = (e: MouseEvent) => {
  visible.value = true
}

/**
 * 关闭弹窗
 */
const handleCancel = () => {
  visible.value = false
}

// 暴露方法给父组件使用
defineExpose({
  handleOpen,
})
</script>

<style lang="less" scoped></style>
