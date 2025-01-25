<script setup lang="ts" name="WaterfallFlow">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
// 加载动画组件
import { BreedingRhombusSpinner } from 'epic-spinners'
// 防抖
import { debounce } from 'lodash'

const router = useRouter()
interface Props {
  data: any
}
const props = defineProps<Props>()
const items = ref()
const columnsCount = ref(4) // 列数
const columnHeights = ref([]) // 每列的高度
const columnData = ref([]) // 存储每列的图片数据

// 监听 props.data 的变化
watch(
  () => props.data,
  (newValue) => {
    items.value = props.data
    // 使用 nextTick 确保 DOM 更新后分配图片
    nextTick(() => {
      distributeItems()
    })
    console.log(newValue, '-- watch')
  },
  { immediate: true }, // 确保在组件加载时就触发一次
)

// 初始化列高
const initColumnHeights = () => {
  columnHeights.value = Array(columnsCount.value).fill(0)
}

// 根据列高找到最矮的一列
const findShortestColumn = () => {
  return columnHeights.value.indexOf(Math.min(...columnHeights.value))
}

// 动态分配图片(保证与之前的顺序是一致的)
const distributeItems = () => {
  initColumnHeights()
  columnData.value = Array.from({ length: columnsCount.value }, () => [])

  // 存储加载完成的图片项及其原始索引
  const loadedItems = []

  items.value.forEach((item, index) => {
    // 添加 loaded 状态，默认 false
    item.loaded = false
    item.originalIndex = index // 记录原始索引
    const img = new Image()
    // 如果 thubnailUrl 存在，使用它；否则使用 url 属性作为图片源地址

    img.src = item.thumbnailUrl ?? item.url
    img.onload = () => {
      item.imgHeight = img.height * (200 / img.width) // 按比例计算图片高度
      loadedItems.push(item)
      item.loaded = true

      // 当所有图片加载完成后，进行排序并分配到列中
      if (loadedItems.length === items.value.length) {
        loadedItems.sort((a, b) => a.originalIndex - b.originalIndex)
        loadedItems.forEach((loadedItem) => {
          const columnIndex = findShortestColumn()
          columnData.value[columnIndex].push(loadedItem)
          columnHeights.value[columnIndex] += loadedItem.imgHeight
        })
      }
    }
    img.onerror = () => {
      console.error(`Image failed to load: ${item.thumbnailUrl}`)
      // 加载失败也可以设置 loaded 为 true 或提供备用图片逻辑
      item.loaded = true
      item.imgHeight = 0 // 假设加载失败高度为 0
      loadedItems.push(item)

      // 当所有图片加载完成后，进行排序并分配到列中
      if (loadedItems.length === items.value.length) {
        loadedItems.sort((a, b) => a.originalIndex - b.originalIndex)
        loadedItems.forEach((loadedItem) => {
          const columnIndex = findShortestColumn()
          columnData.value[columnIndex].push(loadedItem)
          columnHeights.value[columnIndex] += loadedItem.imgHeight
        })
      }
    }
  })
}

// 动态更新列数
const updateColumnsCount = debounce(() => {
  const containerWidth = window.innerWidth
  const newColumnsCount = containerWidth >= 1200 ? 4 : containerWidth >= 768 ? 2 : 1
  if (newColumnsCount !== columnsCount.value) {
    columnsCount.value = newColumnsCount
    distributeItems()
  }
}, 300) // 设置防抖延迟时间为 300ms

// 初始化监听
onMounted(() => {
  console.log(props.data, '--')
  updateColumnsCount() // 初始化时执行一次
  window.addEventListener('resize', updateColumnsCount)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateColumnsCount)
})

// 查看详情
const doDetail = (id: string) => {
  router.push(`/picture/detail/${id}`)
}
</script>

<template>
  <div id="waterfallContainer" class="waterfall-container">
    <!-- <pre>{{ columnData }}</pre> -->
    <div v-for="(column, columnIndex) in columnData" :key="columnIndex" class="waterfall-column">
      <div v-for="item in column" :key="item.id" class="waterfall-box">
        <a-card hoverable class="waterfall-box-img" @click="doDetail(item.id)">
          <template #cover>
            <!-- 懒加载动画 -->
            <div class="placeholder" v-if="!item.loaded">
              <breeding-rhombus-spinner :animation-duration="2000" :size="45" color="#1677ff" />
            </div>
            <img
              v-else
              alt="example"
              class="waterfall-box-img"
              :src="item.thumbnailUrl ?? item.url"
              style="height: 240px; object-fit: cover"
            />
          </template>
          <a-card-meta :title="item.name">
            <template #description>
              <a-flex>
                <a-tag color="blue">{{ item.category ?? '默认' }}</a-tag>
                <a-tag v-for="tag in item.tags" :key="tag">{{ tag }}</a-tag>
              </a-flex>
            </template>
          </a-card-meta>
        </a-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.waterfall-container {
  display: flex;
  gap: 16px;
  overflow: hidden;
}

.waterfall-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
}

.waterfall-box-img {
  width: 100% !important;
  height: auto !important;
  display: block !important;
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 240px;
  background: #f0f0f0;
  border-radius: 8px;
}
</style>
