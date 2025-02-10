<template>
  <div id="SpaceManagePage">
    <a-flex justify="space-between">
      <h2 class="text-[24px]">空间管理</h2>
      <a-space>
        <a-space size="middle">
          <a-button type="primary" href="/space/addSpace" target="_blank">创建空间</a-button>
        </a-space>
        <a-space size="middle">
          <a-button
            :icon="h(BarChartOutlined)"
            type="primary"
            ghost
            :href="`/space_analyze?queryPublic=1`"
            target="_blank"
            >分析公共图库</a-button
          >
        </a-space>
        <a-space size="middle">
          <a-button
            :icon="h(BarChartOutlined)"
            type="primary"
            ghost
            :href="`/space_analyze?queryAll=1`"
            target="_blank"
            >分析全部空间</a-button
          >
        </a-space>
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
      <a-form-item name="spaceName" label="空间名称">
        <a-input
          v-model:value="searchParams.spaceName"
          class="mb-4"
          placeholder="请输入空间名称"
          allow-clear
        >
          <template #prefix><SpaceOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
        </a-input>
      </a-form-item>

      <a-form-item name="spaceLevel" label="空间级别">
        <a-select
          v-model:value="searchParams.spaceLevel"
          :options="SPACE_LEVEL_OPTIONS"
          style="min-width: 180px"
          placeholder="请选择空间级别"
          allow-clear
          class="mb-4"
        ></a-select>
      </a-form-item>

      <a-form-item name="spaceLevel" label="空间级别">
        <a-select
          v-model:value="searchParams.spaceType"
          :options="SPACE_TYPE_OPTIONS"
          style="min-width: 180px"
          placeholder="请选择空间类别"
          allow-clear
          class="mb-4"
        ></a-select>
      </a-form-item>

      <a-form-item name="spaceName" label="用户 id">
        <a-input
          v-model:value="searchParams.userId"
          class="mb-4"
          placeholder="请输入用户 id"
          allow-clear
        >
          <template #prefix><SpaceOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
        </a-input>
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
      :data-source="manageSpaceList"
      :row-selection="rowSelection"
      :pagination="{
        total: manageSpaceListTotal,
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
        <!-- 空间信息 -->
        <template v-if="column.dataIndex === 'picInfo'">
          <div>格式：{{ record.picFormat }}</div>
          <div>宽度：{{ record.picWidth }}</div>
          <div>高度：{{ record.picHeight }}</div>
          <div>宽高比：{{ record.picScale }}</div>
          <div>大小：{{ (record.picSize / 1024).toFixed(2) }}KB</div>
        </template>

        <!-- 空间级别 -->
        <template v-if="column.dataIndex === 'spaceLevel'">
          <div>空间级别: {{ SPACE_LEVEL_MAP[record.spaceLevel] }}</div>
        </template>

        <!-- 空间类别 -->
        <template v-if="column.dataIndex === 'spaceType'">
          <a-tag>{{ SPACE_TYPE_MAP[record.spaceType] }}</a-tag>
        </template>

        <template v-if="column.dataIndex === 'spaceUseInfo'">
          <div>
            <p>容量: {{ formatSize(record.totalSize) }} / {{ formatSize(record.maxSize) }}</p>
            <p>数量: {{ record.totalCount }} / {{ record.maxCount }}</p>
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
              ghost
              :href="`/space_analyze?spaceId=${record.id}`"
              target="_blank"
              >分析</a-button
            >

            <a-button
              type="primary"
              size="small"
              class="mr-1"
              :href="`/space/addSpace?id=${record.id}`"
              target="_blank"
              >编辑</a-button
            >
            <a-popconfirm
              title="是否要删除这条空间数据?"
              ok-text="是"
              cancel-text="否"
              @confirm="deleteSpaceInfo(record)"
              @cancel="cancelDeleteSpaceInfo"
            >
              <a-button type="primary" danger size="small">删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import type { FormProps } from 'ant-design-vue'
import { deleteSpaceUsingPost, listSpaceByPageUsingPost } from '@/api/spaceController'

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '空间名称',
    dataIndex: 'spaceName',
  },
  {
    title: '空间级别',
    dataIndex: 'spaceLevel',
  },
  {
    title: '空间类别',
    dataIndex: 'spaceType',
  },
  {
    title: '使用情况',
    dataIndex: 'spaceUseInfo',
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
  pageSize: 200,
  // 排序字段
  sortField: 'createTime',
  // 排序顺序 ascend
  sortOrder: 'descend',
  // 搜索文本
  searchText: '',
  // 空间名
  spaceName: '',
  // 空间级别
  spaceLevel: '',
  // 空间类别
  spaceType: '',
  // 用户id
  userId: '',
})

const manageSpaceList = ref([])
const manageSpaceListTotal = ref(0)

// 初始化
const init = async () => {
  loading.value = true
  const res = await listSpaceByPageUsingPost(searchParams.value)
  if (res.code === 0) {
    manageSpaceList.value = res.data.records
    manageSpaceListTotal.value = res.data.total
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
const deleteSpaceInfo = async (record: any) => {
  const res = await deleteSpaceUsingPost({
    id: record.id,
  })
  if (res.code == 0) {
    message.success('删除成功')
    init()
  } else {
    message.error('删除失败')
  }
}

const cancelDeleteSpaceInfo = () => {}

import type { TableProps } from 'ant-design-vue'
import {
  SPACE_LEVEL_MAP,
  SPACE_LEVEL_OPTIONS,
  SPACE_TYPE_MAP,
  SPACE_TYPE_OPTIONS,
} from '@/constants/space'
import { formatSize } from '@/utils/file'
import { BarChartOutlined } from '@ant-design/icons-vue'
import { h } from 'vue'
const arr = ref([])
const rowSelection: TableProps['rowSelection'] = {
  onChange: (selectedRowKeys: string[], selectedRows: API.Space[]) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows)
    arr.value = selectedRows
  },
  getCheckboxProps: (record) => ({
    disabled: record.name === 'Disabled User', // Column configuration not to be checked
    name: record.name,
  }),
}

onMounted(() => {
  init()
})
</script>

<style lang="less" scoped></style>
