<template>
  <div class="AddPicturePage">
    <div class="text-2xl font-bold mb-4">
      {{ pictureForm.id ? '修改图片' : '新增图片' }}
    </div>

    <a-typography-paragraph v-if="spaceId" type="secondary">
      保存至空间:
      <a :href="`/space/detail/${spaceId}`">{{ spaceId }}</a>
    </a-typography-paragraph>

    <!-- 选择上传方式 -->
    <a-tabs v-model:activeKey="uploadType">
      <a-tab-pane key="file" tab="图片上传">
        <!-- 本地文件上传 -->
        <PictureUpload :picture="picture" :spaceId="spaceId" @success="onSuccess" />
      </a-tab-pane>
      <a-tab-pane key="url" tab="URL上传" force-render>
        <!-- Url图片上传 -->
        <UrlPictureUpload :picture="picture" :spaceId="spaceId" @success="onSuccess" />
      </a-tab-pane>
    </a-tabs>

    <div v-if="picture" class="editBar w-full flex justify-center">
      <a-button
        :icon="h(EditOutlined)"
        type="primary"
        ghost
        html-type="submit"
        class="mb-4 mt-4 mr-4"
        @click="doEditPicture()"
      >
        编辑图片
      </a-button>

      <a-button
        :icon="h(EditOutlined)"
        type="primary"
        html-type="submit"
        class="mb-4 mt-4"
        v-if="
          !isLargeFile(picture.picSize) && isImageSizeValid(picture.picWidth, picture.picHeight)
        "
        @click="doImagePainting()"
      >
        AI扩图
      </a-button>
      <!-- 图片裁切 -->
      <ImageCropper
        ref="imageCropperRef"
        :imageUrl="picture.url"
        :picture="picture"
        :spaceId="spaceId"
        @success="onCropSuccess"
      />
    </div>

    <a-form
      v-if="picture"
      layout="vertical"
      :model="pictureForm"
      @finish="handleFinish"
      class="mb-10"
    >
      <a-form-item name="name" label="名称">
        <a-input v-model:value="pictureForm.name" placeholder="请输入图片名称" allow-clear />
      </a-form-item>
      <a-form-item name="introduction" label="简介">
        <a-textarea
          v-model:value="pictureForm.introduction"
          placeholder="请输入图片简介"
          allow-clear
          :auto-size="{ minRows: 2, maxRows: 5 }"
        />
      </a-form-item>
      <a-form-item name="category" label="分类">
        <a-auto-complete
          v-model:value="pictureForm.category"
          :options="categoryOptions"
          placeholder="请输入图片分类"
          allow-clear
        />
      </a-form-item>
      <a-form-item name="tags" label="标签">
        <a-select
          v-model:value="pictureForm.tags"
          :options="tagOptions"
          mode="tags"
          style="width: 100%"
          placeholder="请输入图片标签"
          allow-clear
        ></a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" class="w-full mb-10"> 保存 </a-button>
      </a-form-item>
    </a-form>

    <!-- AI扩图 -->
    <ImageOutPainting
      ref="imageOutPaintingRef"
      :picture="picture"
      :spaceId="spaceId"
      :onSuccess="onImageOutPaintingSuccess"
    />
  </div>
</template>
<script lang="ts" setup name="AddPicturePage">
import { ref, onMounted, computed, h } from 'vue'
import type { FormProps } from 'ant-design-vue'
import {
  editPictureUsingPost,
  getPictureVoByIdUsingGet,
  pictureTagCategoryUsingGet,
} from '@/api/pictureController'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { EditOutlined } from '@ant-design/icons-vue'
import { isLargeFile, isImageSizeValid } from '@/utils/file'

const router = useRouter()
const route = useRoute()
const uploadType = ref<'file' | 'url'>('file')
// 空间id
const spaceId = computed(() => {
  return route.query?.spaceId as number
})

// 上传的图片
const picture = ref<API.PictureVO>()
// 表单数据
const pictureForm = ref<API.PictureEditRequest>({})
// 上传图片成功的回调
const onSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
  pictureForm.value.name = newPicture.name
}

// 搜索 记得从第一页开始搜索
const handleFinish: FormProps['onFinish'] = async (values: any) => {
  const pictureId = picture.value?.id

  if (!pictureId) {
    return
  }
  const res = await editPictureUsingPost({
    id: pictureId,
    spaceId: spaceId.value,
    ...values,
  })

  if (res.code === 0) {
    message.success('操作成功')
    router.push(`/picture/detail/${pictureId}`)
  } else {
    message.error('操作失败: ', res.message)
  }
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

// 获取要修改的图片
const getOldPicture = async () => {
  const res = await getPictureVoByIdUsingGet({
    id: route.query.id as string,
  })
  if (res.code === 0) {
    pictureForm.value = res.data
    picture.value = res.data
  } else {
    message.error('获取图片失败: ', res.message)
  }
}

// 裁切图片
const imageCropperRef = ref()
const doEditPicture = () => {
  if (imageCropperRef.value) {
    imageCropperRef.value?.handleOpen()
  }
}

// 裁切成功事件
const onCropSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
}

// AI扩图
const imageOutPaintingRef = ref(null)
const doImagePainting = () => {
  if (imageOutPaintingRef.value) {
    imageOutPaintingRef.value?.handleOpen()
  }
}
const onImageOutPaintingSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
}

onMounted(() => {
  if (route.query.id) {
    getOldPicture()
  }
})
</script>

<style lang="less" scoped>
.AddPicturePage {
  max-width: 800px;
  padding-bottom: 20px;
  margin: 0 auto;
  // background-color: pink;
}
</style>
