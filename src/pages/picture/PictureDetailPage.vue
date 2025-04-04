<template>
  <div class="PictureDetailPage pb-20">
    <a-row :gutter="[16, 16]">
      <!-- 图片预览 -->
      <a-col :sm="24" :md="16" :xl="18">
        <a-card title="图片预览" class="flex justify-center flex-col">
          <!--
            object-fit: contain: 保持图片的宽高比，将图像缩放至完全适应容器的大小。
          -->
          <div class="flex justify-center flex-col">
            <a-image :src="picture.url" style="max-height: 600px; object-fit: contain" />
          </div>
        </a-card>
      </a-col>

      <!-- 图片编辑 -->
      <a-col :sm="24" :md="8" :xl="6">
        <a-card title="图片信息" style="max-height: 600px">
          <a-descriptions :column="1">
            <a-descriptions-item label="作者">
              <a-space>
                <a-avatar :size="24" :src="picture.user?.userAvatar"></a-avatar>
                <div>{{ picture.user?.userName }}</div>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="名称">
              {{ picture.name ?? '未命名' }}
            </a-descriptions-item>
            <a-descriptions-item label="简介">
              {{ picture.introduction ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="分类">
              {{ picture.category ?? '默认' }}
            </a-descriptions-item>
            <a-descriptions-item label="标签">
              <a-tag v-for="(tag, index) in picture.tags" :key="index">{{ tag }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="格式">
              {{ picture.picFormat ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="宽度">
              {{ picture.picWidth }}
            </a-descriptions-item>
            <a-descriptions-item label="高度">
              {{ picture.picHeight }}
            </a-descriptions-item>
            <a-descriptions-item label="宽高比">
              {{ picture.picScale }}
            </a-descriptions-item>
            <a-descriptions-item label="大小">
              {{ formatSize(picture.picSize ?? 0) }}
            </a-descriptions-item>
            <a-descriptions-item label="主色调" style="align-items: center">
              <div class="flex">
                <div
                  v-if="picture.picColor"
                  :style="{
                    width: '22px',
                    height: '22px',
                    marginRight: '8px',
                    background: toHexColor(picture.picColor) ?? 'transparent',
                  }"
                ></div>
                {{ picture.picColor ?? '-' }}
              </div>
            </a-descriptions-item>
          </a-descriptions>

          <!-- style="flex-direction: column" -->
          <a-space class="flex flex-wrap mt-1">
            <a-button type="primary" @click="doDownload">
              <template #icon>
                <DownloadOutlined />
              </template>
              免费下载
            </a-button>
            <a-button type="primary" ghost @click="() => doShare()">
              <ShareAltOutlined />
              分享
            </a-button>
            <a-button v-if="canEdit" :icon="h(EditOutlined)" @click="doEdit">编辑</a-button>
            <a-popconfirm
              title="是否要删除该图片?"
              ok-text="是"
              cancel-text="否"
              @confirm="deletePicture"
            >
              <a-button v-if="canDelete" :icon="h(DeleteOutlined)" type="primary" danger
                >删除</a-button
              >
            </a-popconfirm>
          </a-space>
        </a-card>
      </a-col>
    </a-row>

    <!-- 分享弹窗 -->
    <ShowModal ref="showModalRef" :link="shareLink" />
  </div>
</template>
<script lang="ts" setup name="PictureDetailPage">
import { deletePictureUsingPost, getPictureVoByIdUsingGet } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { onMounted, ref, h, computed } from 'vue'
import {
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ShareAltOutlined,
} from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/User'
import { downloadImage, formatSize } from '@/utils/file'
import { toHexColor } from '@/utils/color'
import { SPACE_PERMISSION_ENUM } from '@/constants/space'
const router = useRouter()
const userStore = useUserStore()
interface Props {
  id: string | number
}

const props = defineProps<Props>()
const picture = ref<API.PictureVO>({})

// 通用权限检查函数
function createPermissionChecker(permission: string) {
  console.log(permission, 'permission')
  return computed(() => {
    console.log((picture.value.permissionList ?? []).includes(permission), '=-=-')
    return (picture.value.permissionList ?? []).includes(permission)
  })
}

// 定义权限检查
const canEdit = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_EDIT)
const canDelete = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_DELETE)

// 下载图片
const doDownload = () => {
  downloadImage(picture.value.url)
}
// 获取id
const id = props.id

// 判断该用户是否拥有对图片的编辑和删除的权限
const isOwner = computed(() => {
  const loginUser = userStore.loginUser
  // 未登录不能编辑
  if (!loginUser.id) {
    return false
  }

  if (picture.value.userId != undefined) {
    // 非管理员和图片作者不能编辑和删除
    if (loginUser.userRole != 'admin' && loginUser.id != picture.value.userId) {
      return false
    }
  }

  return true
})

// 获取图片详情
const fetchPictureDetail = async () => {
  const res = await getPictureVoByIdUsingGet({ id })
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

// 修改图片
const doEdit = async () => {
  router.push({
    path: '/picture/addPicture',
    query: {
      id: picture.value.id,
      spaceId: picture.value.spaceId,
    },
  })
}
// 删除图片
const deletePicture = async () => {
  try {
    const res = await deletePictureUsingPost({ id })
    if (res.code === 0) {
      message.success('删除成功')
      router.push('/')
    } else {
      message.error('删除失败: ' + res.message)
    }
  } catch (error) {
    message.error('error: ' + error)
  }
}

// =============================================================
// 分享功能
const showModalRef = ref()
// 分享链接
const shareLink = ref('')

const doShare = () => {
  shareLink.value = `${window.location.protocol}//${window.location.host}/picture/detail/${picture.value.id}`

  if (showModalRef.value) {
    showModalRef.value.handleOpen()
  }
}
onMounted(() => {
  fetchPictureDetail()
})
</script>

<style lang="less" scoped>
/deep/ .ant-card {
  height: 100% !important;
}
</style>
