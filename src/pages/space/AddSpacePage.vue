<template>
  <div class="AddSpace">
    <div class="text-2xl font-bold mb-4">
      {{ spaceForm.id ? '修改空间' : '新增空间' }}
    </div>

    <a-form layout="vertical" :model="spaceForm" @finish="handleFinish" class="mb-10">
      <a-form-item name="spaceName" label="空间名称">
        <a-input v-model:value="spaceForm.spaceName" placeholder="请输入空间名称" allow-clear />
      </a-form-item>

      <a-form-item name="spaceLevel" label="空间级别">
        <a-select
          v-model:value="spaceForm.spaceLevel"
          :options="SPACE_LEVEL_OPTIONS"
          style="min-width: 180px"
          placeholder="请选择空间级别"
          allow-clear
          class="mb-4"
        ></a-select>
      </a-form-item>

      <a-form-item>
        <a-button type="primary" html-type="submit" class="w-full mb-10" :loading="loading">
          保存
        </a-button>
      </a-form-item>
    </a-form>

    <a-card title="空间级别介绍">
      <a-typography-paragraph>
        * 目前仅支持开通普通版、专业版、旗舰版，请联系
        <a href="https://github.com/wjp527">管理员</a> 进行开通。
      </a-typography-paragraph>

      <a-typography-paragrap v-for="item in spaceLevelList" :key="item">
        <div>{{ item.text }}: 容量 {{ formatSize(item.maxSize) }}, 数量: {{ item.maxCount }}</div>
      </a-typography-paragrap>
    </a-card>
  </div>
</template>
<script lang="ts" setup name="AddSpace">
import { ref, onMounted } from 'vue'
import type { FormProps } from 'ant-design-vue'
import {
  addSpaceUsingPost,
  editSpaceUsingPost,
  getSpaceVoByIdUsingGet,
} from '@/api/spaceController'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { SPACE_LEVEL_OPTIONS } from '@/constants/space'
import { listSpaceLevelUsingGet } from '@/api/pictureController'
import { formatSize } from '@/utils/file'

const router = useRouter()
const route = useRoute()
const loading = ref(false)

// 上传的空间
const space = ref<API.SpaceVO>()
// 表单数据
const spaceForm = ref<API.SpaceAddRequest | API.SpaceEditRequest>({})

const spaceLevelList = ref<API.SpaceLevel[]>([])

// 搜索 记得从第一页开始搜索
const handleFinish: FormProps['onFinish'] = async (values: any) => {
  loading.value = true
  const spaceId = space.value?.id
  let res
  if (!spaceId) {
    res = await addSpaceUsingPost({
      ...values,
    })
  } else {
    res = await editSpaceUsingPost({
      id: spaceId,
      ...values,
    })
  }

  if (res.code === 0) {
    message.success('操作成功')
    router.push(`/space/detail/${res.data}`)
  } else {
    message.error('操作失败：' + res.message)
  }
  loading.value = false
}

// 获取要修改的空间
const getOldSpace = async () => {
  console.log(route, 'route')
  const res = await getSpaceVoByIdUsingGet({
    id: route.query.id as string,
  })
  if (res.code === 0) {
    spaceForm.value = res.data
    space.value = res.data
  } else {
    message.error('获取空间失败: ', res.message)
  }
}

const initSpaceLevelList = async () => {
  const res = await listSpaceLevelUsingGet()
  if (res.code == 0) {
    spaceLevelList.value = res.data
  } else {
    message.error('获取空间级别失败: ' + res.message)
  }
}
onMounted(() => {
  if (route.query.id) {
    getOldSpace()
  }
  // 初始化空间级别数据
  initSpaceLevelList()
})
</script>

<style lang="less" scoped>
.AddSpace {
  max-width: 720px;
  margin: 0 auto;
  // background-color: pink;
}
</style>
