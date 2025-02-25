<template>
  <div class="ImageCropper">
    <a-modal class="" v-model:open="visible" :title="title" :footer="false" @cancel="handleCancel">
      <!-- 图片裁切 -->
      <vue-cropper
        ref="cropperRef"
        :img="imageUrl"
        output-type="png"
        :info="true"
        :can-move="false"
        :can-move-box="true"
        :fixed-box="false"
        :auto-crop="true"
        :center-box="true"
      ></vue-cropper>

      <!-- 图片协同操作 -->
      <div class="flex justify-center mt-4" v-if="isTeamSpace">
        <a-space>
          <a-button v-if="editingUser" disabled>{{ editingUser?.userName }} 正在编辑</a-button>
          <a-button v-if="canEnterEdit" type="primary" ghost @click="enterEdit" class="btn"
            >进入编辑</a-button
          >
          <a-button v-if="canExitEdit" danger ghost @click="exitEdit" class="btn"
            >退出编辑</a-button
          >
        </a-space>
      </div>

      <!-- 图片操作 -->
      <div class="flex justify-center mt-4">
        <a-space>
          <a-button @click="rotateLeft" :disabled="!canEdit" class="btn">左旋</a-button>
          <a-button @click="rotateRight" :disabled="!canEdit" class="btn">右旋</a-button>
          <a-button @click="changeScale(1)" :disabled="!canEdit" class="btn">放大</a-button>
          <a-button @click="changeScale(-1)" :disabled="!canEdit" class="btn">缩小</a-button>
          <a-button type="primary" @click="handleConfirm" :disabled="!canEdit" class="btn"
            >确认</a-button
          >
        </a-space>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup name="ImageCropper">
import { uploadPictureUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { ref, onMounted, computed, watchEffect, onUnmounted } from 'vue'
import { VueCropper } from 'vue-cropper'
import { useUserStore } from '@/store/User'
import 'vue-cropper/dist/index.css'
import PictureEditWebSocket from '@/utils/pictureEditWebSocket'
import { PICTURE_EDIT_ACTION_MAP, PICTURE_EDIT_MESSAGE_TYPE_ENUM } from '@/constants/picture'
import { SPACE_TYPE_ENUM } from '@/constants/space'

const userStore = useUserStore()

interface Props {
  imageUrl?: string
  title?: string
  picture?: API.Picture
  spaceId: number | string
  space?: API.SpaceVO
  onSuccess: (data: any) => void
}

const props = withDefaults(defineProps<Props>(), {
  title: '裁切图片',
})

// 是否为团队空间
const isTeamSpace = computed(() => props.space?.spaceType === SPACE_TYPE_ENUM.TEAM)

const visible = ref<boolean>(false)
const cropperRef = ref<InstanceType<typeof VueCropper> | null>(null)

// 确认裁切图片
const handleConfirm = () => {
  cropperRef.value.getCropBlob((blob: Blob) => {
    // blob 为已经裁切好的图片 blob 对象
    const fileName = (props.picture?.name || 'image') + '.png'
    const file = new File([blob], fileName, { type: blob.type })
    // 上传图片
    console.log('裁切了该图片')
    handleUpload({ file }, true)
    // editAction('confirm')
    // const file = new File([blob], fileName, { type: 'image/png' })
  })
}

/**
 * 图片上传处理函数

 * @param param0 file 文件信息

 */
const loading = ref<boolean>(false)
const handleUpload = async ({ file }: any, closeModal: boolean) => {
  loading.value = true

  try {
    const params: API.PictureUploadRequest = props.picture?.id ? { id: props.picture.id } : {}
    params.spaceId = props.spaceId

    // 调用上传接口
    console.log(params, 'params')
    console.log(file, 'file')
    const res = await uploadPictureUsingPost(params, {}, file)
    if (res.code === 0 && res.data) {
      message.success('上传图片成功')
      props?.onSuccess(res.data)
      if (closeModal) {
        handleCancel()
      }
    } else {
      message.error('上传图片失败:' + res.message)
    }
  } catch (error) {
    message.error('上传图片失败,error:' + error.message)
  } finally {
    loading.value = false
  }
}

/**
 * 打开弹窗
 * @param e 鼠标事件对象
 */
const handleOpen = (e: MouseEvent) => {
  visible.value = true
}
/**
 * 关闭弹窗
 */
const handleCancel = () => {
  visible.value = false
  // 断开连接
  if (websocket) {
    websocket.disconnect()
  }

  editingUser.value = undefined
}

// ----------------------------- 实时编辑 -----------------------------
const loginUser = userStore.loginUser
// 正在编辑的用户
const editingUser = ref<API.UserVO>()
// 当前用户是否进入可编辑
const canEnterEdit = computed(() => {
  return !editingUser.value
})
// 正在编辑的用户是本人，可退出编辑
const canExitEdit = computed(() => {
  // 确保当前编辑的用户是本人，才可以退出
  return editingUser.value?.id === loginUser.id
})
// 可以点击编辑图片的操作按钮
const canEdit = computed(() => {
  // 不是团队空间，默认可以直接编辑

  if (!isTeamSpace.value) {
    return true
  }
  //团队空间 只有编辑者能够编辑
  return editingUser.value?.id === loginUser.id
})

/**
 * base64 转为  File 对象。

 * @param base64 base64 字符串编码的图片数据。
 * @param fileName 图片名
 */
function base64ToFile(base64, fileName) {
  // 去掉前缀
  const base64Str = base64.split(';base64,')[1]
  const type = base64.split(';base64,')[0].split(':')[1]

  const arrayBuffer = Uint8Array.from(atob(base64Str), (c) => c.charCodeAt(0))
  const blob = new Blob([arrayBuffer], { type })

  return new File([blob], fileName, { type })
}

// 编写 WebSocket 逻辑
let websocket: PictureEditWebSocket | null

// 图片操作方法
const changeScale = (num: number) => {
  num = num || 1
  cropperRef.value?.changeScale(num)

  if (num > 0) {
    editAction(PICTURE_EDIT_ACTION_MAP.ZOOM_IN)
  } else {
    editAction(PICTURE_EDIT_ACTION_MAP.ZOOM_OUT)
  }
}

// 图片左移
const rotateLeft = () => {
  cropperRef.value?.rotateLeft()
  editAction(PICTURE_EDIT_ACTION_MAP.ROTATE_LEFT)
}

// 图片右移
const rotateRight = () => {
  cropperRef.value?.rotateRight()
  editAction(PICTURE_EDIT_ACTION_MAP.ROTATE_RIGHT)
}

// 编辑图片状态
const editAction = (action: string) => {
  console.log(action, 'action')
  if (websocket) {
    // 发送编辑图片状态的请求
    websocket.sendMessage({
      // 编辑图片状态 【英文】
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_ACTION,
      // 编辑图片状态 【中文】
      editAction: action,
    })
  }
}

// 初始化 WebSocket 连接，绑定事件
const initWebSocket = () => {
  const pictureId = props.picture?.id
  // 没有图片id 或者 弹窗没有显示，不进行初始化 WebSocket 连接
  if (!pictureId || !visible.value) {
    return
  }

  // 防止之前的链接未释放
  if (websocket) {
    websocket.disconnect()
  }

  // 创建 WebSocket 链接
  websocket = new PictureEditWebSocket(pictureId)
  // 建立 WebSocket 链接
  websocket.connect()

  // 注册确认裁切图片事件
  websocket.on('confirm', (msg) => {
    console.log(msg, 'msg')
    console.log('保存图片: ', msg)
  })

  // 注册通知信息事件
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.INFO, (msg) => {
    console.log('收到通知消息: ', msg)
    message.info(msg.message)
  })

  // 注册错误消息事件
  // 监听错误消息
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.ERROR, (msg) => {
    console.log('收到错误消息: ', msg)
    message.error(msg.message)
  })

  // 注册进入编辑状态消息
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.ENTER_EDIT, (msg) => {
    console.log('收到进入编辑状态消息: ', msg)
    message.info(msg.message)
    editingUser.value = msg.user
  })

  // 注册编辑操作信息
  // 监听编辑操作信息
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_ACTION, (msg) => {
    console.log('收到编辑操作: ', msg)
    message.info(msg.message)

    switch (msg.editAction) {
      // 左旋
      case PICTURE_EDIT_ACTION_MAP.ROTATE_LEFT:
        cropperRef.value.rotateLeft()
        break
      // 右旋
      case PICTURE_EDIT_ACTION_MAP.ROTATE_RIGHT:
        cropperRef.value.rotateRight()
        break
      case PICTURE_EDIT_ACTION_MAP.ZOOM_IN:
        cropperRef.value.changeScale(1)
        break
      case PICTURE_EDIT_ACTION_MAP.ZOOM_OUT:
        cropperRef.value.changeScale(-1)
        break
      // case 'confirm':
      //   cropperRef.value.getCropData((blob) => {
      //     handleUpload({ file: base64ToFile(blob, 'image.png') })
      //   })
      //   break
    }
  })

  // 监听退出编辑状态消息
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.EXIT_EDIT, (msg) => {
    console.log('收到退出编辑状态消息: ', msg)
    message.info(msg.message)
    editingUser.value = undefined
  })
}

// 进入编辑状态
const enterEdit = () => {
  if (websocket) {
    // 发送进入编辑状态的请求
    websocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.ENTER_EDIT,
    })
  }
}

// 退出编辑状态
const exitEdit = () => {
  if (websocket) {
    // 发送退出编辑状态的请求
    websocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.EXIT_EDIT,
    })
  }
}

watchEffect(() => {
  // 只有是团队空间，才需要初始化 WebSocket 连接

  if (isTeamSpace.value) {
    initWebSocket()
  }
})

onUnmounted(() => {
  // 断开连接
  if (websocket) {
    websocket.disconnect()
  }

  editingUser.value = undefined
})

// 暴露方法给父组件使用
defineExpose({
  handleOpen,
})
onMounted(() => {
  console.log('Component mounted')
})
</script>

<style scoped lang="less" scope>
.vue-cropper {
  height: 400px !important;
}
</style>
