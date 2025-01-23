<template>
  <div class="AddPictureBatchPage">
    <h2 class="text-[24px]">批量导入图片</h2>

    <div class="mb-10"></div>
    <a-form layout="vertical" :model="formData" @finish="handleFinish" class="mb-10">
      <a-form-item name="searchText" label="关键词">
        <a-input v-model:value="formData.searchText" placeholder="请输入关键词" allow-clear />
      </a-form-item>

      <a-form-item name="source" label="源">
        <a-select
          v-model:value="formData.source"
          :options="PIC_BATCH_OPTIONS"
          style="min-width: 180px"
          placeholder="请选择图片来源"
          allow-clear
          class="mb-4"
        ></a-select>
      </a-form-item>

      <a-form-item name="page" label="开始页码">
        <a-input v-model:value="formData.page" placeholder="请输入关键词" allow-clear />
      </a-form-item>

      <a-form-item name="count" label="抓取数量">
        <a-input-number
          v-model:value="formData.count"
          :min="1"
          :max="30"
          placeholder="请输入抓取数量"
          allow-clear
          style="min-width: 180px"
        />
      </a-form-item>
      <a-form-item name="namePrefix" label="名称前缀键词">
        <a-input
          v-model:value="formData.namePrefix"
          placeholder="请输入图片名称前缀,会自动补充序号"
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
          执行任务
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script lang="ts" setup name="AddPictureBatchPage">
import { ref } from 'vue'
import type { FormProps } from 'ant-design-vue'
import { uploadPictureBatchUsingPost , pictureTagCategoryUsingGet} from '@/api/pictureController'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PIC_BATCH_OPTIONS } from '@/constants/picture'
const router = useRouter()

const loading = ref<boolean>(false)
// 表单数据
const formData = ref<API.PictureUploadByBatchRequest>({})

// 搜索 记得从第一页开始搜索
const handleFinish: FormProps['onFinish'] = async () => {
  loading.value = true
  // 批量上传图片
  const res = await uploadPictureBatchUsingPost({
    ...formData.value,
  })
  if (res.code === 0) {
    message.success('操作成功')
    router.push('/admin/pictureManage')
  } else {
    message.error('操作失败: ', res.message)
  }

  loading.value.valvue = false
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

</script>

<style lang="less" scoped>
.AddPictureBatchPage {
  max-width: 720px;
  margin: 0 auto;
  // background-color: pink;
}
</style>
