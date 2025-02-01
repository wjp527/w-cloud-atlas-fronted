<template>
  <div class="BatchEditPictureModal">
    <a-modal v-model:open="visible" :title="title" :footer="false" @cancel="handleCancel">
      <a-typography-paragraph type="secondary">只对当前页面生效</a-typography-paragraph>

      <a-form layout="vertical" :model="formData" @finish="handleFinish" class="mb-10">
        <a-form-item name="nameRule" label="命名规则">
          <a-input
            v-model:value="formData.nameRule"
            placeholder="请输入命名规则，输入{序号}可动态生成"
            allow-clear
          />
        </a-form-item>

        <a-form-item name="category" label="分类">
          <a-auto-complete
            v-model:value="formData.category"
            :options="categoryOptions"
            placeholder="请输入图片分类"
            allow-clear
          />
        </a-form-item>
        <a-form-item name="tags" label="标签">
          <a-select
            v-model:value="formData.tags"
            :options="tagOptions"
            mode="tags"
            style="width: 100%"
            placeholder="请输入图片标签"
            allow-clear
          ></a-select>
        </a-form-item>

        <a-form-item>
          <a-button :loading="loading" type="primary" html-type="submit" class="w-full mb-10">
            批量保存
          </a-button>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup name="BatchEditPictureModal">
import { ref } from 'vue'
import type { FormProps } from 'ant-design-vue'
import { editPictureByBatchUsingPost, pictureTagCategoryUsingGet } from '@/api/pictureController'
import { message } from 'ant-design-vue'

interface Props {
  title: string
  pictureList: number[]
  spaceId: number
  onSuccess: () => void
}
const props = withDefaults(defineProps<Props>(), {
  title: '批量编辑图片',
})

const loading = ref<boolean>(false)
// 表单数据
const formData = ref<API.PictureEditByBatchRequest>({
  category: '',
  tags: [],
  nameRule: '',
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

// 分类选项
const categoryOptions = ref<string[]>([])
// 标签选项
const tagOptions = ref<string[]>([])
// 初始化分类和标签
const initOptions = async () => {
  const res = await pictureTagCategoryUsingGet()
  try {
    if (res?.code === 0) {
      categoryOptions.value = (res.data?.categoryList ?? []).map((item: string) => {
        return {
          label: item,
          value: item,
        }
      })
      tagOptions.value = (res.data?.tagList ?? []).map((item: string) => {
        return {
          label: item,
          value: item,
        }
      })
    } else {
      message.error('获取分类和标签失败: ', res.message)
    }
  } catch (error) {
    message.error('获取分类和标签失败: ', error)
  }
}
// 初始化分类和标签
initOptions()

// 批量编辑
const handleFinish: FormProps['onFinish'] = async () => {
  if (!props.pictureList) {
    return
  }
  loading.value = true

  // 批量上传图片
  const res = await editPictureByBatchUsingPost({
    // 图片id列表
    pictureIdList: props.pictureList.map((item) => item.id),
    // 空间id
    spaceId: props.spaceId,
    ...formData.value,
  })
  if (res.code === 0) {
    message.success('操作成功')
    // 关闭弹窗
    visible.value = false
    // 执行回调函数
    props.onSuccess?.()
  } else {
    message.error('操作失败: ', res.message)
  }

  loading.value = false
}

// 暴露方法给父组件使用
defineExpose({
  handleOpen,
})
</script>

<style lang="less" scoped></style>
