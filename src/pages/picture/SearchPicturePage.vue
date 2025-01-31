<template>
  <div class="SearchPicturePage">
    <h2 class="text-[28px] mb-4">以图搜图</h2>
    <a-card title="图片预览" class="flex justify-center flex-col w-60">
      <!--
            object-fit: contain: 保持图片的宽高比，将图像缩放至完全适应容器的大小。
          -->
      <div class="flex justify-center flex-col">
        <a-image :src="picture.url" style="height: 180px; object-fit: contain" />
      </div>
    </a-card>

    <h3 class="text-[24px] mb-4">识图结果</h3>
    <a-list
      :grid="{
        gutter: 16,
        xs: 1,
        sm: 2,
        md: 3,
        lg: 4,
        xl: 5,
        xxl: 6,
      }"
      item-layout="vertical"
      size="large"
      :data-source="dataList"
      :loading="loading"
    >
      <template #renderItem="{ item }">
        <a-list-item style="padding: 0">
          <a :href="item.fromUrl" target="_blank">
            <a-card hoverable>
              <template #cover>
                <img
                  :src="item.thumbUrl"
                  :alt="item.thumbUrl"
                  style="height: 180px; object-fit: cover"
                />
              </template>
            </a-card>
          </a>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>
<script lang="ts" setup name="SearchPicturePage">
import { getPictureVoByIdUsingGet, searchPictureByPictureUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const loading = ref(false)

const picture = ref<API.PictureVO>({})
// 获取图片id
const pictureId = computed(() => {
  return route.query.pictureId
})

// 获取图片详情
const fetchPictureDetail = async () => {
  const res = await getPictureVoByIdUsingGet({ id: pictureId.value as string })
  try {
    if (res.code === 0) {
      picture.value = res.data
    } else {
      message.error(res.message)
    }
  } catch (error: any) {
    message.error(error)
  }
}

// 以图搜图得到的结果
const dataList = ref<API.PictureVO[]>([])

const searchImage = async () => {
  loading.value = true
  const res = await searchPictureByPictureUsingPost({ pictureId: pictureId.value as string })
  if (res.code === 0) {
    dataList.value = res.data
  } else {
    message.error('以图搜图失败: ' + res.message)
  }
  loading.value = false
}

onMounted(() => {
  fetchPictureDetail()
  searchImage()
})
</script>

<style lang="less" scoped>
/deep/ .ant-card {
  height: 100% !important;
}
.SearchPicturePage {
  padding-bottom: 100px;
}
</style>
