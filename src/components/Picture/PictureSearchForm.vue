<template>
  <div id="PictureSearchForm">
    <!-- 搜索 -->
    <a-form
      name="searchForm"
      layout="inline"
      :model="searchParams"
      @finish="handleFinish"
      @finishFailed="handleFinishFailed"
      class="mb-10"
    >
      <a-form-item name="searchText" label="关键词">
        <a-input
          v-model:value="searchParams.searchText"
          placeholder="从名称和简介搜索"
          allow-clear
          class="mb-4"
        >
          <template #prefix><PictureOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
        </a-input>
      </a-form-item>

      <a-form-item name="category" label="分类" style="width: 200px">
        <a-select
          v-model:value="searchParams.category"
          :options="categoryOptions"
          mode="category"
          style="width: 100%"
          placeholder="请输入图片分类"
          allow-clear
          class="mb-4"
        ></a-select>
      </a-form-item>

      <a-form-item name="tags" label="标签" style="width: 200px">
        <a-select
          v-model:value="searchParams.tags"
          :options="tagOptions"
          mode="tags"
          style="width: 100%"
          placeholder="请输入图片标签"
          allow-clear
          class="mb-4"
        ></a-select>
      </a-form-item>

      <!-- 时间范围 -->
      <a-form-item name="dateRange" label="日期" style="width: 500px">
        <a-range-picker
          style="width: 400px"
          v-model:value="dateRange"
          show-time
          format="YYYY/MM/DD HH:mm:ss"
          :presets="rangePresets"
          @change="onRangeChange"
          class="mb-4"
        />
      </a-form-item>

      <a-form-item name="name" label="名称">
        <a-input v-model:value="searchParams.name" class="mb-4" placeholder="名称" allow-clear>
          <template #prefix><PictureOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
        </a-input>
      </a-form-item>

      <a-form-item name="introduction" label="简介">
        <a-input
          v-model:value="searchParams.introduction"
          class="mb-4"
          placeholder="简介"
          allow-clear
        />
      </a-form-item>

      <a-form-item name="picWidth" label="宽度">
        <a-input-number v-model:value="searchParams.picWidth" class="mb-4" />
      </a-form-item>

      <a-form-item name="picHeight" label="高度">
        <a-input-number v-model:value="searchParams.picHeight" class="mb-4" />
      </a-form-item>


      <a-form-item>
        <a-button type="primary" html-type="submit"> 搜索 </a-button>
        <a-button @click="handleReset" class="ml-4"> 重置 </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script lang="ts" setup name="PictureSearchForm">
import { onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import type { FormProps } from 'ant-design-vue'
import { listPictureByPageUsingPost, pictureTagCategoryUsingGet } from '@/api/pictureController'
import { PictureOutlined, SoundTwoTone } from '@ant-design/icons-vue'
import dayjs, { Dayjs } from 'dayjs'

// 外部传来的参数
interface Props {
  onSearch?: (searchParams: API.PictureQueryRequest) => void
}

const props = defineProps<Props>()

// 搜索参数
const searchParams = ref({})

// 搜索数据
const doSearch = () => {
  props.onSearch?.({ ...searchParams.value })
}

const managePictureList = ref([])
const managePictureListTotal = ref(0)

// 初始化
const init = async () => {
  loading.value = true
  const res = await listPictureByPageUsingPost({
    ...searchParams.value,
    // 查找公共图库的图片
    nullSpaceId: true,
  })
  if (res.code === 0) {
    managePictureList.value = res.data.records
    managePictureListTotal.value = res.data.total
    onSearch(managePictureList.value, managePictureListTotal.value)
  } else {
    message.error(res.message)
  }
  loading.value = false
}

// 搜索
const loading = ref(false)
// 搜索 记得从第一页开始搜索
const handleFinish: FormProps['onFinish'] = () => {
  loading.value = true
  props.onSearch?.({ ...searchParams.value })
}
const handleFinishFailed: FormProps['onFinishFailed'] = (errors) => {
  console.log(errors)
}

// 重置
const handleReset = () => {
  loading.value = true
  Object.keys(searchParams.value).forEach((key) => {
    searchParams.value[key] = undefined
  })
  dateRange.value = []

  console.log(dateRange.value, '===')
  props.onSearch?.({ ...searchParams.value })
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

// 时间范围
type RangeValue = [Dayjs, Dayjs]
const dateRange = ref()

const onRangeChange = (dates: RangeValue, dateStrings: string[]) => {
  if (dates != null && dates.length >= 2 && dateRange.value.length === 2) {
    searchParams.value.startEditTime = dates[0].toDate()
    searchParams.value.endEditTime = dates[1].toDate()
  } else {
    console.log('jinqul')
    searchParams.value.startEditTime = undefined
    searchParams.value.endEditTime = undefined
  }
}

const rangePresets = ref([
  { label: 'Last 7 Days', value: [dayjs().add(-7, 'd'), dayjs()] },
  { label: 'Last 14 Days', value: [dayjs().add(-14, 'd'), dayjs()] },
  { label: 'Last 30 Days', value: [dayjs().add(-30, 'd'), dayjs()] },
  { label: 'Last 90 Days', value: [dayjs().add(-90, 'd'), dayjs()] },
])

onMounted(() => {
  doSearch()
  initOptions()
})
</script>

<style lang="less" scoped></style>
