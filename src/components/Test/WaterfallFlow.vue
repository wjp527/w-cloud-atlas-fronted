<template>
  <div class="waterfall-container">
    <div v-for="(column, columnIndex) in columnData" :key="columnIndex" class="waterfall-column">
      <div v-for="item in column" :key="item.id" class="waterfall-item">
        <a-card hoverable @click="doDetail(item.id)">
          <template #cover>
            <div class="image-container">
              <!-- 使用自定义错误状态 -->
              <div v-show="item.error" class="error-overlay">
                <ExclamationCircleOutlined style="font-size: 24px" />
                <span>加载失败</span>
              </div>
              <img
                v-lazy="item.thumbnailUrl ?? item.url"
                :alt="item.title"
                @load="onImageLoad(item)"
                @error="onImageError(item)"
                style="width: 100%; height: auto; display: block"
              />
              <div class="p-2">
                <p class="text-base font-bold w-[140px] mb-2 inline-block truncate">
                  {{ item.name }}
                </p>
                <div class="mb-2">
                  <div class="flex items-center h-10">
                    <div class="mr-2 text-sm text-gray-500">分类:</div>
                    <a-tag color="#108ee9" v-if="item.category">{{ item.category }}</a-tag>
                    <a-tag v-else>无</a-tag>
                  </div>
                </div>
                <div class="">
                  <div class="flex items-center">
                    <div class="mr-2 text-sm text-gray-500">标签:</div>
                    <a-tag
                      v-for="tag in item.tags"
                      :key="tag.id"
                      color="blue"
                      v-if="item.tags.length > 0"
                    >
                      {{ tag }}
                    </a-tag>
                    <a-tag v-else>无</a-tag>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template #actions v-if="showOp">
            <ShareAltOutlined @click="(e) => doShare(item, e)" />
            <search-outlined @click="(e) => doSearch(item, e)" />
            <edit-outlined v-if="canEdit" @click="(e) => doEdit(item, e)" />
            <a-popconfirm
              v-if="canDelete"
              title="是否要删除该图片?"
              ok-text="Yes"
              cancel-text="No"
              @confirm="doDeleteConfirm(item)"
            >
              <delete-outlined @click="(e) => doDelete(item, e)" />
            </a-popconfirm>
          </template>
        </a-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="WaterfallFlow">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { debounce } from 'lodash'
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  ShareAltOutlined,
} from '@ant-design/icons-vue'
import { deletePictureUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'

// 默认图片，你需要替换成实际的图片路径
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
const router = useRouter()

interface Props {
  data: any[]
  showOp?: boolean
  loading?: boolean
  onReload?: () => void
  canEdit?: boolean
  canDelete?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  showOp: false,
  loading: false,
  canEdit: false,
  canDelete: false,
})

const items = ref<any[]>([])
const columnsCount = ref(4)
const columnHeights = ref<number[]>([])
const columnData = ref<any[][]>([])

// 初始化列高度
const initColumnHeights = () => {
  columnHeights.value = new Array(columnsCount.value).fill(0)
}

// 找出最短的列
const findShortestColumn = () => {
  const minHeight = Math.min(...columnHeights.value)
  return columnHeights.value.indexOf(minHeight)
}

const adjustColumnsCount = () => {
  const width = window.innerWidth
  if (width < 576) {
    columnsCount.value = 1
  } else if (width < 768) {
    columnsCount.value = 2
  } else if (width < 992) {
    columnsCount.value = 3
  } else {
    columnsCount.value = 4
  }
  distributeItems()
}

// 处理窗口大小变化
const handleResize = debounce(() => {
  adjustColumnsCount()
}, 200)

// 监听数据变化
watch(
  () => props.data,
  async (newValue) => {
    items.value = newValue.map((item) => ({
      ...item,
      loading: true,
      loaded: false,
      error: false,
    }))
    await nextTick()
    distributeItems()
  },
  { deep: true },
)

// 详情页跳转
const doDetail = (id: number) => {
  router.push(`/picture/detail/${id}`)
}

// 分享功能
const showModalRef = ref()
const shareLink = ref('')

const doShare = (picture: API.PictureVO, e: any) => {
  e.stopPropagation()
  shareLink.value = `${window.location.protocol}//${window.location.host}/picture/detail/${picture.id}`
  if (showModalRef.value) {
    showModalRef.value.handleOpen()
  }
}

// 以图搜图
const doSearch = (item: any, e: any) => {
  e.stopPropagation()
  window.open('/search_picture?pictureId=' + item.id)
}

// 修改
const doEdit = (item: any, e: any) => {
  e.stopPropagation()
  router.push({
    path: '/picture/addPicture',
    query: {
      id: item.id,
      spaceId: item.spaceId,
    },
  })
}

const doDelete = async (item: any, e: any) => {
  e.stopPropagation()
}

// 删除确认
const doDeleteConfirm = async (item: any) => {
  try {
    const res = await deletePictureUsingPost({ id: item.id })
    if (res?.code === 0) {
      message.success('删除成功')
      props.onReload?.()
    } else {
      message.error('删除失败：' + res?.message)
    }
  } catch (error) {
    message.error('删除失败')
  }
}

// 懒加载
const onImageLoad = (item: any) => {
  item.loading = false
  item.loaded = true
  item.error = false
  distributeItems()
}

const onImageError = (item: any) => {
  item.loading = false
  item.loaded = false
  item.error = true
}

const distributeItems = () => {
  initColumnHeights()
  columnData.value = Array.from({ length: columnsCount.value }, () => [])

  items.value.forEach((item) => {
    if (!item.hasOwnProperty('loading')) {
      item.loading = true
      item.loaded = false
      item.error = false
    }
    const shortestColumnIndex = findShortestColumn()
    columnData.value[shortestColumnIndex].push(item)
    columnHeights.value[shortestColumnIndex] += 300
  })
}

onMounted(() => {
  adjustColumnsCount()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="less" scoped>
.waterfall-container {
  display: flex;
  gap: 16px;
  margin: 16px auto;
  max-width: 1600px;
  padding: 0 16px;
}

.waterfall-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.waterfall-item {
  width: 100%;
  break-inside: avoid;
  margin-bottom: 16px;
}

.image-container {
  position: relative;
  width: 100%;
  min-height: 200px;
  // background: #f5f5f5;
  overflow: hidden;
  // 控制 loading 图片大小
  :deep(img[lazy='loading']) {
    width: 100vw !important;
    height: 100vh !important;
    object-fit: contain;
    margin: auto;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  // 实际图片加载完成后恢复原有样式
  :deep(img[lazy='loaded']) {
    width: 100% !important;
    height: auto !important;
    position: static;
    transform: none;
  }
  img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
    transition: opacity 0.3s ease-in-out;
  }
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  z-index: 1;
}

.error-overlay {
  color: #ff4d4f;

  span {
    margin-top: 8px;
    font-size: 14px;
  }
}

.loading-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.description-content {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

:deep(.ant-card) {
  height: 100%;
}

:deep(.ant-card-cover) {
  overflow: hidden;
}
</style>
