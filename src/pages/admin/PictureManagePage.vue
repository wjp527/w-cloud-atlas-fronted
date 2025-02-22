<template>
  <div id="PictureManagePage">
    <a-flex justify="space-between">
      <h2 class="text-[24px]">图片管理</h2>
      <a-space>
        <a-button type="primary" href="/picture/addPicture" target="_blank">创建图片</a-button>
        <a-button type="primary" ghost href="/picture/addPicture/batch" target="_blank"
          >批量导入图片</a-button
        >

        <a-popconfirm
          title="是否要进行批量删除?"
          ok-text="是"
          cancel-text="否"
          @confirm="batchDelete"
        >
          <a-button type="primary" danger>批量删除</a-button>
        </a-popconfirm>
      </a-space>
    </a-flex>
    <div class="mb-4"></div>
    <!-- 搜索 -->
    <a-form
      layout="inline"
      :model="searchParams"
      @finish="handleFinish"
      @finishFailed="handleFinishFailed"
      class="mb-10"
    >
      <a-form-item name="searchText" label="关键词">
        <a-input
          v-model:value="searchParams.searchText"
          placeholder="从名称和简介搜索"
          allow-clear
          class="mb-4"
        >
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
          class="mb-4"
        ></a-select>
      </a-form-item>

      <a-form-item name="name" label="图片名">
        <a-input v-model:value="searchParams.name" class="mb-4" placeholder="图片名" allow-clear>
          <template #prefix><PictureOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
        </a-input>
      </a-form-item>

      <a-form-item name="tags" label="审核状态">
        <a-select
          v-model:value="searchParams.reviewStatus"
          :options="PIC_REVIEW_STATUS_OPTIONS"
          style="min-width: 180px"
          placeholder="请输入图片标签"
          allow-clear
          class="mb-4"
        ></a-select>
      </a-form-item>

      <a-form-item>
        <a-button type="primary" html-type="submit"> 搜索 </a-button>
        <a-button @click="handleReset" class="ml-4"> 重置 </a-button>
      </a-form-item>
    </a-form>

    <a-table
      rowKey="id"
      :loading="loading"
      :columns="columns"
      :data-source="managePictureList"
      :row-selection="rowSelection"
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
        <template v-if="column.dataIndex === 'name'">
          <a-tooltip>
            <template #title>{{ record.name }}</template>
            <!-- 文字一行展示，超出部分省略号 -->
            <span class="text-xs w-[60px] inline-block truncate">{{ record.name }}</span>
          </a-tooltip>
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

        <!-- 审核信息 -->
        <template v-if="column.dataIndex === 'reviewMessage'">
          <div>审核状态：{{ PIC_REVIEW_STATUS_MAP[record.reviewStatus] }}</div>
          <div>审核信息: {{ record.reviewMessage }}</div>
          <div>审核人: {{ record.reviewerId }}</div>
          <div v-if="record.reviewTime">
            审核时间: {{ dayjs(record.reviewTime).format('YYYY-MM-DD HH:mm:ss') }}
          </div>
        </template>
        <template v-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>

        <template v-if="column.dataIndex === 'editTime'">
          {{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>

        <template v-else-if="column.key === 'action'">
          <a-space wrap>
            <a-button
              type="link"
              size="small"
              class="mr-1"
              v-if="record.reviewStatus != PIC_REVIEW_STATUS_ENUM.PASS"
              @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.PASS)"
              >通过</a-button
            >
            <a-popconfirm
              title="是否要拒绝这条图片数据?"
              ok-text="是"
              cancel-text="否"
              v-if="record.reviewStatus != PIC_REVIEW_STATUS_ENUM.REJECT"
              @confirm="showModal(record, PIC_REVIEW_STATUS_ENUM.REJECT)"
              @cancel="cancelDeletePictureInfo"
            >
              <a-button type="link" danger size="small">拒绝</a-button>
            </a-popconfirm>

            <a-button
              type="primary"
              size="small"
              class="mr-1"
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

    <!-- 拒绝弹窗 -->
    <a-modal v-model:open="rejectModal" title="图片的拒绝理由" @ok="handleReject">
      <a-textarea
        v-model:value="reviewMessage"
        placeholder="请输入拒绝理由"
        :auto-size="{ minRows: 2, maxRows: 5 }"
    /></a-modal>
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
  pictureTagCategoryUsingGet,
  doPictureReviewUsingPost,
} from '@/api/pictureController'
import { PictureOutlined } from '@ant-design/icons-vue'
import {
  PIC_REVIEW_STATUS_ENUM,
  PIC_REVIEW_STATUS_MAP,
  PIC_REVIEW_STATUS_OPTIONS,
} from '@/constants/picture'

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
    title: '审核信息',
    dataIndex: 'reviewMessage',
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
  pageSize: 200,
  // 排序字段
  sortField: 'createTime',
  // 排序顺序 ascend
  sortOrder: 'descend',
  // 搜索文本
  searchText: '',
  // 图片名
  name: '',
})

const managePictureList = ref([])
const managePictureListTotal = ref(0)

// 初始化
const init = async () => {
  loading.value = true
  const res = await listPictureByPageUsingPost({
    ...searchParams.value,
    // 查找公共图库的图片
    nullSpaceId: true,
  })
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

// 审核图片(通过)
const reviewMessage = ref<string>('管理员操作通过')

const handleReview = async (record: API.Picture, reviewStatus: number) => {
  const res = await doPictureReviewUsingPost({
    id: record.id,
    reviewStatus: reviewStatus,
    reviewMessage: reviewMessage.value,
  })
  if (res.code === 0) {
    message.success(reviewMessage)
    init()
  } else {
    message.error(`审核失败：${res.message}`)
  }
}

// 拒绝弹窗
const rejectModal = ref<boolean>(false)
const payloadData = ref()
const payloadStatus = ref<number>(PIC_REVIEW_STATUS_ENUM.PASS)
const showModal = (record: API.Picture, reviewStatus: number) => {
  rejectModal.value = true
  reviewMessage.value = ''
  payloadData.value = record
  payloadStatus.value = reviewStatus
}

// 审核图片(拒绝)
const handleReject = async () => {
  const res = await doPictureReviewUsingPost({
    id: payloadData.value.id,
    reviewStatus: payloadStatus.value,
    reviewMessage: reviewMessage.value,
  })
  if (res.code === 0) {
    message.success(res.message)
    rejectModal.value = false
    init()
  } else {
    message.error(`审核失败：${res.message}`)
  }
}

import type { TableProps } from 'ant-design-vue'
const arr = ref([])
const rowSelection: TableProps['rowSelection'] = {
  onChange: (selectedRowKeys: string[], selectedRows: API.Picture[]) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows)
    arr.value = selectedRows
  },
  getCheckboxProps: (record) => ({
    disabled: record.name === 'Disabled User', // Column configuration not to be checked
    name: record.name,
  }),
}

// 批量删除
const batchIds = ref([])
const batchDelete = async () => {
  arr.value.forEach((item) => batchIds.value.push(item.id))
  console.log(batchIds.value)
  try {
    const res = await deletePictureUsingPost({
      ids: batchIds.value,
    })
    if (res.code === 0) {
      message.success('删除成功')
      init()
    } else {
      message.error('删除失败：', res.message)
    }
  } catch (error) {
    message.error('删除失败(error)：', error.message)
  }
}

onMounted(() => {
  init()
  initOptions()
})
</script>

<style lang="less" scoped>
.tooltip-content {
  display: inline-block;
  width: 60px;
}
</style>
