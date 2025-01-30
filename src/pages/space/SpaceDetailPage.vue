<template>
  <div class="SpaceDetailPage">
    <!-- 空间信息 -->
    <a-flex justify="space-between" align="center">
      <h2 class="text-[24px] mb-4">{{ space.spaceName }}</h2>

      <a-space size="middle">
        <a-button type="primary" :href="`/picture/addPicture?spaceId=${id}`" target="_blank"
          >创建图片</a-button
        >
      </a-space>
    </a-flex>
    <a-flex vertical>
      <a-tooltip :title="`占用空间:${formatSize(space.totalSize)} / ${formatSize(space.maxSize)}`">
        <a-progress :percent="((space.totalSize * 100) / space.maxSize).toFixed(2)" />
      </a-tooltip>

      <a-tooltip :title="`占用数量:${space.totalCount} / ${space.maxCount}`">
        <a-progress
          :percent="((space.totalCount * 100) / space.maxCount).toFixed(2)"
          status="active"
        />
      </a-tooltip>
    </a-flex>

    <!-- 搜索表单 -->
    <PictureSearchForm :onSearch="onSearch" />

    <!-- 图片列表 -->
    <WaterfallFlow :data="dataList" :showOp="true" :onReload="init" />
  </div>
</template>
<script lang="ts" setup name="SpaceDetailPage">
import { getSpaceVoByIdUsingGet } from '@/api/spaceController'
import { message } from 'ant-design-vue'
import { onMounted, ref, h, computed } from 'vue'
import {
  listPictureVoByPageUsingPost,
  pictureTagCategoryUsingGet,
  listPictureVoByPageWithCacheManagerUsingPost,
} from '@/api/pictureController'
import { formatSize } from '@/utils/file'

interface Props {
  id: string | number
}

const props = defineProps<Props>()
const space = ref<API.SpaceVO>({})

// 获取空间详情
const fetchSpaceDetail = async () => {
  const res = await getSpaceVoByIdUsingGet({ id })
  try {
    if (res.code === 0) {
      space.value = res.data
      searchParams.value.spaceId = space.value.id
      init()
      initOptions()
    } else {
      message.error('获取失败: ' + res.message)
    }
  } catch (error: any) {
    message.error(error.message)
  }
}

const id = props.id as string

const dataList = ref<API.PictureVO[]>([])
const loading = ref(true)
// 搜索参数
const searchParams = ref({
  current: 1,
  pageSize: 12,
  // 排序字段
  sortField: 'createTime',
  // 排序顺序
  // 升序
  // sortOrder: 'ascend',
  // 降序
  sortOrder: 'descend',
  // 搜索文本
  searchText: '',
  // 分类
  category: 'all',
  // 标签
  tags: [],
  tagList: [],
  // 空间id
  spaceId: '',
})
// 数据总数
const total = ref(0)

// 初始化数据
const init = async () => {
  loading.value = true
  console.log(selectedCategory.value, '--')
  const params = {
    ...searchParams.value,
    // tags: [] as string[],
  }

  if (params.category !== 'all') {
    // params.category = selectedCategory.value
  } else {
    params.category = ''
  }

  // 不懂
  selectedTagList.value.forEach((useTag, index) => {
    if (useTag) {
      params.tags.push(tagList.value[index])
    }
  })

  console.log(params, 'params')
  const res = await listPictureVoByPageUsingPost(params)
  // const res = await listPictureVoByPageWithCacheManagerUsingPost(params)
  if (res.code == 0) {
    dataList.value = res.data?.records || []
    console.log(dataList.value, 'dataList')
    total.value = res.data?.total || 0
  } else {
    message.error('获取失败: ' + res.message)
  }

  loading.value = false
}

// 分类选项
const categoryList = ref<string[]>([])
// 标签选项
const tagList = ref<string[]>([])
// 查看全部
const selectedCategory = ref<string>('all')
const selectedTagList = ref<string[]>([])
// 初始化分类和标签
const initOptions = async () => {
  const res = await pictureTagCategoryUsingGet()
  try {
    if (res?.code === 0) {
      categoryList.value = res.data?.categoryList ?? []
      tagList.value = res.data?.tagList ?? []
    } else {
      message.error('获取分类和标签失败: ', res.message)
    }
  } catch (error) {
    message.error('获取分类和标签失败: ', error)
  }
}

// 分页
const handleChange = (page: number, pageSize: number) => {
  pageSize = 12
  searchParams.value.current = page
  searchParams.value.pageSize = pageSize
  init()
}

// 触发搜索
const onSearch = (newSearchParams: API.PictureQueryRequest) => {
  searchParams.value = {
    ...searchParams.value,
    ...newSearchParams,
    current: 1,
  }

  console.log(newSearchParams, 'newSearchParams')
  console.log(searchParams.value, 'searchParams')

  init()
}

onMounted(() => {
  fetchSpaceDetail()
})
</script>

<style lang="less" scoped>
/deep/ .ant-card {
  height: 100% !important;
}
</style>
