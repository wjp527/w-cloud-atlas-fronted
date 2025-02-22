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
        @change="doSearch"
      >
        {{ tag }}
      </a-checkable-tag>
    </div>

    <WaterfallFlow
      :data="displayData"
      :loading="loading"
      :show-op="true"
      :can-edit="true"
      :can-delete="true"
    />
 
    <div ref="loadMoreTrigger" class="load-more-trigger" :class="{ loading: loading }">
      <transition name="fade">
   
        <div v-if="loading" class="loading-container">
          <a-spin />
        </div>
      </transition>
      <transition name="fade">
        <div v-if="!hasMore && dataList.length > 0" class="no-more">没有更多数据了</div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts" setup name="HomePage">
import { computed, nextTick, onMounted, ref, onUnmounted } from 'vue'
import {
  listPictureVoByPageUsingPost,
  listPictureVoByPageWithCacheManagerUsingPost,
} from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { pictureTagCategoryUsingGet } from '@/api/pictureController'
import { useIntersectionObserver } from '@vueuse/core'

const dataList = ref<API.PictureVO[]>([])
const loading = ref(false)
const hasMore = ref(true)
const preloadedData = ref<API.PictureVO[]>([])
// 添加当前页码记录
const currentPage = ref(1)
// 数据去重函数
const removeDuplicates = (newData: API.PictureVO[], existingData: API.PictureVO[]) => {
  const existingIds = new Set(existingData.map((item) => item.id))
  return newData.filter((item) => !existingIds.has(item.id))
}
// 计算属性合并显示数据

const displayData = computed(() => {
  return [...dataList.value, ...preloadedData.value]
})

// 搜索参数
const searchParams = ref({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
  searchText: '',
  category: 'all',
  tagList: [],
})

// 预处理图片数据
const preprocessImages = async (images: API.PictureVO[]) => {
  return Promise.all(
    images.map((item) => {
      return new Promise<API.PictureVO>((resolve) => {
        const img = new Image()
        img.src = item.thumbnailUrl ?? item.url

        const timeoutId = setTimeout(() => {
          resolve({
            ...item,
            loaded: true,
            aspectRatio: 1,
            imgHeight: 200,
          })
        }, 3000)

        img.onload = () => {
          clearTimeout(timeoutId)
          const aspectRatio = img.height / img.width
          resolve({
            ...item,
            loaded: true,
            aspectRatio,
            imgHeight: Math.round(200 * aspectRatio),
          })
        }

        img.onerror = () => {
          clearTimeout(timeoutId)
          resolve({
            ...item,
            loaded: true,
            aspectRatio: 1,
            imgHeight: 200,
          })
        }
      })
    }),
  )
}

// 预加载下一页数据
const preloadNextPage = async () => {
  if (loading.value || !hasMore.value || preloadedData.value.length > 0) return

  const params = {
    ...searchParams.value,
    current: currentPage.value + 1, // 使用记录的页码
    tags: [] as string[],
  }

  if (selectedCategory.value !== 'all') {
    params.category = selectedCategory.value
  } else {
    params.category = ''
  }

  selectedTagList.value.forEach((useTag, index) => {
    if (useTag) {
      params.tags.push(tagList.value[index])
    }
  })

  try {
    const res = await listPictureVoByPageWithCacheManagerUsingPost(params)
    const newData = await preprocessImages(res.data?.records || [])
    preloadedData.value = newData
  } catch (error) {
    console.error('预加载失败:', error)
  }
}

// 初始化数据方法
const init = async (isLoadMore = false) => {
  if (loading.value) return
  if (!isLoadMore && !hasMore.value) return

  loading.value = true

  try {
    if (isLoadMore && preloadedData.value.length > 0) {
      // 使用预加载的数据，进行去重
      const uniqueData = removeDuplicates(preloadedData.value, dataList.value)
      if (uniqueData.length > 0) {
        dataList.value = [...dataList.value, ...uniqueData]
        currentPage.value++
      }
      preloadedData.value = []
      preloadNextPage()
    } else {
      const params = {
        ...searchParams.value,
        current: isLoadMore ? currentPage.value + 1 : 1, // 使用记录的页码
        tags: [] as string[],
      }

      if (selectedCategory.value !== 'all') {
        params.category = selectedCategory.value
      } else {
        params.category = ''
      }

      selectedTagList.value.forEach((useTag, index) => {
        if (useTag) {
          params.tags.push(tagList.value[index])
        }
      })

      const res = await listPictureVoByPageWithCacheManagerUsingPost(params)
      const newData = await preprocessImages(res.data?.records || [])

      if (!isLoadMore) {
        dataList.value = newData
        currentPage.value = 1
      } else {
        // 加载更多时进行去重
        const uniqueData = removeDuplicates(newData, dataList.value)
        if (uniqueData.length > 0) {
          dataList.value = [...dataList.value, ...uniqueData]
          currentPage.value++
        }
      }

      hasMore.value = dataList.value.length < (res.data?.total || 0)

      if (hasMore.value) {
        preloadNextPage()
      }
    }
  } catch (error) {
    message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}
// 搜索方法
const doSearch = () => {
  currentPage.value = 1 // 重置页码
  hasMore.value = true
  preloadedData.value = []
  dataList.value = []
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
  init()
}

// 滚动处理
const loadMoreTrigger = ref<HTMLElement | null>(null)
let scrollThrottle: NodeJS.Timeout | null = null

const handleScroll = () => {
  if (scrollThrottle) return
  if (!hasMore.value) return // 添加这个判断

  scrollThrottle = setTimeout(() => {
    const scrollHeight = document.documentElement.scrollHeight
    const scrollTop = window.scrollY
    const clientHeight = document.documentElement.clientHeight

    if (scrollHeight - scrollTop - clientHeight < clientHeight * 1.5) {
      preloadNextPage()
    }

    scrollThrottle = null
  }, 100)
}

// 分类和标签相关
const categoryList = ref<string[]>([])
const tagList = ref<string[]>([])
const selectedCategory = ref<string>('all')
const selectedTagList = ref<string[]>([])

const initOptions = async () => {
  try {
    const res = await pictureTagCategoryUsingGet()
    if (res?.code === 0) {
      categoryList.value = res.data?.categoryList ?? []
      tagList.value = res.data?.tagList ?? []
      selectedTagList.value = new Array(tagList.value.length).fill(false)
    } else {
      message.error('获取分类和标签失败: ' + res.message)
    }
  } catch (error) {
    message.error('获取分类和标签失败')
  }
}

// 滚动加载监听
useIntersectionObserver(
  loadMoreTrigger,
  ([{ isIntersecting }]) => {
    if (isIntersecting && !loading.value && hasMore.value) {
      if (scrollThrottle) clearTimeout(scrollThrottle)
      scrollThrottle = setTimeout(() => {
        init(true)
      }, 200) // 增加节流时间
    }
  },
  {
    threshold: 0.1,
    rootMargin: '200px',
  },
)

onMounted(() => {
  init()
  initOptions()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (scrollThrottle) clearTimeout(scrollThrottle)
})
</script>

<style lang="less" scoped>
.HomePage {
  padding-bottom: 50px;
  min-height: 100vh;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.load-more-trigger {
  height: 50px;
  margin-top: 20px;
  position: relative;
  bottom: 0;
  transition: opacity 0.3s;

  &.loading {
    opacity: 0.7;
  }
}

.no-more {
  text-align: center;
  color: #999;
  padding: 20px 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
