<template>
  <div class="HomePage">
    <div class="flex justify-center mb-4 w-max[480px]">
      <a-input-search
        v-model:value="searchParams.searchText"
        placeholder="搜索海量图片"
        enter-button="搜索"
        @search="doSearch"
        class="w-[500px]"
      />
    </div>

    <!-- 分类和标签筛选 -->
    <a-tabs v-model:active-key="selectedCategory" @change="doSearch">
      <a-tab-pane key="all" tab="全部"></a-tab-pane>
      <a-tab-pane v-for="category in categoryList" :key="category" :tab="category"></a-tab-pane>
    </a-tabs>

    <div class="flex m-4">
      <span>标签: </span>
      <a-checkable-tag
        v-for="(tag, index) in tagList"
        :key="tag"
        v-model:checked="selectedTagList[index]"
        @change="init()"
      >
        {{ tag }}
      </a-checkable-tag>
    </div>

    <WaterfallFlow :data="dataList" />

    <div class="m-[100px] h-40" style="text-align: right">
      <a-pagination
        v-model:current="pagination.current"
        :total="pagination.total"
        show-less-items
        @change="handleChange"
      />
    </div>
  </div>
</template>
<script lang="ts" setup name="HomePage">
import { computed, onMounted, ref } from 'vue'
import { listPictureVoByPageUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { pictureTagCategoryUsingGet } from '@/api/pictureController'

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
  tagList: [],
})
// 数据总数
const total = ref(0)
// 初始化数据
const init = async () => {
  loading.value = true
  const params = {
    ...searchParams.value,
    tags: [] as string[],
  }
  if (selectedCategory.value !== 'all') {
    params.category = selectedCategory.value
  } else {
    params.category = ''
  }

  // 不懂
  selectedTagList.value.forEach((useTag, index) => {
    if (useTag) {
      params.tags.push(tagList.value[index])
    }
  })

  const res = await listPictureVoByPageUsingPost(params)

  dataList.value = res.data?.records || []
  console.log(dataList.value,'dataList');
  total.value = res.data?.total || 0
  loading.value = false
}

// 分页
const pagination = computed(() => {
  return {
    current: searchParams.value.current,
    pageSize: searchParams.value.pageSize,
    total: total.value,
    onChange: handleChange,
  }
})

// 搜索
const doSearch = async () => {
  searchParams.value.current = 1
  // searchParams.value.category = selectedCategory.value
  // searchParams.value.tagList = selectedTagList.value

  init()
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

onMounted(() => {
  searchParams.value.current = 1

  init()
  initOptions()
})
</script>

<style lang="less" scoped>
.HomePage {
  // margin-bottom: 10000px;
  // background-color: pink;
}
</style>
