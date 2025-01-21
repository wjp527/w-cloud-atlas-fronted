<template>
  <div id="PictureManagePage">
    <!-- 搜索 -->
    <a-form
      layout="inline"
      :model="searchParams"
      @finish="handleFinish"
      @finishFailed="handleFinishFailed"
      class="mb-10"
    >
      <a-form-item name="searchText" label="关键词">
        <a-input v-model:value="searchParams.searchText" placeholder="从名称和简介搜索" allow-clear>
          <template #prefix><PictureOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
        </a-input>
      </a-form-item>

      <a-form-item name="tags" label="标签" style="width: 200px">
        <a-select
          v-model:value="searchParams.tags"
          :options="tagOptions"
          mode="tags"
          style="width: 100%"
          placeholder="请输入图片标签"
          allow-clear
        ></a-select>
      </a-form-item>

      <a-form-item name="name" label="图片名">
        <a-input v-model:value="searchParams.name" placeholder="图片名" allow-clear>
          <template #prefix><PictureOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
        </a-input>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit"> 搜索 </a-button>
        <a-button @click="handleReset" class="ml-4"> 重置 </a-button>
        <a-button @click="handleAdd" class="ml-4"> 新增 </a-button>
      </a-form-item>
    </a-form>

    <a-table
      :loading="loading"
      :columns="columns"
      :data-source="managePictureList"
      :pagination="{
        total: managePictureListTotal,
        current: searchParams.current,
        pageSize: searchParams.pageSize,
        // 是否显示分页器
        showSizeChanger: true,
        // 是否显示快速跳转
        showQuickJumper: true,
        // 是否显示总数
        showTotal: (total: any, range: any) => `共${total}条`,
        // 分页发生改变
        onChange: (current: any, pageSize: any) => {
          searchParams.current = current
          searchParams.pageSize = pageSize
          init()
        },
      }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'url'">
          <a-image :src="record.url" :width="80" />
        </template>
        <template v-if="column.dataIndex === 'tags'">
          <a-space wrap>
            <a-tag v-for="tag in JSON.parse(record.tags || '[]')" :key="tag" color="blue">{{
              tag
            }}</a-tag>
          </a-space>
        </template>
        <!-- 图片信息 -->
        <template v-if="column.dataIndex === 'picInfo'">
          <div>格式：{{ record.picFormat }}</div>
          <div>宽度：{{ record.picWidth }}</div>
          <div>高度：{{ record.picHeight }}</div>
          <div>宽高比：{{ record.picScale }}</div>
          <div>大小：{{ (record.picSize / 1024).toFixed(2) }}KB</div>
        </template>
        <template v-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>

        <template v-if="column.dataIndex === 'editTime'">
          {{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>

        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button
              type="primary"
              size="small"
              class="mr-4"
              :href="`/picture/addPicture?id=${record.id}`"
              target="_blank"
              >编辑</a-button
            >
            <a-popconfirm
              title="是否要删除这条图片数据?"
              ok-text="是"
              cancel-text="否"
              @confirm="deletePictureInfo(record)"
              @cancel="cancelDeletePictureInfo"
            >
              <a-button type="primary" danger size="small">删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <manageMode v-model:open="isModalOpen" :modalData="modalData" @submitForm="submitForm" />
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import type { FormProps } from 'ant-design-vue'
import {
  deletePictureUsingPost,
  listPictureByPageUsingPost,
  updatePictureUsingPost,
  pictureTagCategoryUsingGet,
} from '@/api/pictureController'
import { PictureOutlined } from '@ant-design/icons-vue'

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '图片',
    dataIndex: 'url',
  },
  {
    title: '名称',
    dataIndex: 'name',
  },
  {
    title: '简介',
    dataIndex: 'introduction',
    ellipsis: true,
  },
  {
    title: '类型',
    dataIndex: 'category',
  },
  {
    title: '标签',
    dataIndex: 'tags',
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
  },
  {
    title: '用户 id',
    dataIndex: 'userId',
    width: 80,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

// 搜索参数
const searchParams = ref({
  current: 1,
  pageSize: 20,
  // 排序字段
  sortField: 'createTime',
  // 排序顺序
  sortOrder: 'ascend',
  // 搜索文本
  searchText: '',
  // 图片名
  name: '',
})

const managePictureList = ref([])
const managePictureListTotal = ref(0)

// 初始化
const init = async () => {
  const res = await listPictureByPageUsingPost(searchParams.value)
  if (res.code === 0) {
    managePictureList.value = res.data.records
    managePictureListTotal.value = res.data.total
  } else {
    message.error(res.message)
  }
  loading.value = false
}

// 搜索
const loading = ref(false)
// 搜索 记得从第一页开始搜索
const handleFinish: FormProps['onFinish'] = () => {
  searchParams.value.current = 1
  loading.value = true
  init()
}
const handleFinishFailed: FormProps['onFinishFailed'] = (errors) => {
  console.log(errors)
}

// 重置
const handleReset = () => {
  loading.value = true
  searchParams.value = {
    current: 1,
    pageSize: 10,
    sortField: 'createTime',
    sortOrder: 'ascend',
  }
  init()
}

// 新增/修改
const isModalOpen = ref(false) // 控制弹出框的状态
const modalData = ref({}) // 弹出框的数据

// 新增表单
const handleAdd = () => {
  modalData.value = {}
  isModalOpen.value = true // 显示弹出框
}
// 提交表单
const submitForm = async (data: any) => {
  if (!data.id) {
    const res = await listPictureByPageUsingPost(data)
    if (res.code == 0) {
      message.success('新增成功')
      init()
    } else {
      message.error('新增失败')
    }
  } else {
    const res = await updatePictureUsingPost(data)
    if (res.code == 0) {
      message.success('修改成功')
      init()
    } else {
      message.error('修改失败')
    }
  }
}
// 删除数据
const deletePictureInfo = async (record: any) => {
  const res = await deletePictureUsingPost({
    id: record.id,
  })
  if (res.code == 0) {
    message.success('删除成功')
    init()
  } else {
    message.error('删除失败')
  }
}

const cancelDeletePictureInfo = () => {}

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

onMounted(() => {
  init()
  initOptions()
})
</script>

<style lang="less" scoped></style>
