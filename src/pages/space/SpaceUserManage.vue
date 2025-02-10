<template>
  <div id="SpaceUserManage">
    <div class="mb-4"></div>
    <!-- 创建团队成员 -->
    <a-form
      layout="inline"
      :model="formData"
      @finish="handleFinish"
      @finishFailed="handleFinishFailed"
      class="mb-10"
    >
      <a-form-item name="userId" label="用户 id">
        <a-input
          v-model:value="formData.userId"
          class="mb-4"
          placeholder="请输入用户 id"
          allow-clear
        >
          <template #prefix><SpaceOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
        </a-input>
      </a-form-item>

      <a-form-item>
        <a-button type="primary" html-type="submit"> 搜索 </a-button>
      </a-form-item>
    </a-form>

    <a-table
      rowKey="id"
      :loading="loading"
      :columns="columns"
      :data-source="manageSpaceList"
      :row-selection="rowSelection"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'userInfo'">
          <a-space wrap>
            <a-avatar :src="record.user?.userAvatar" />
            {{ record.user?.userName }}
          </a-space>
        </template>

        <template v-if="column.dataIndex === 'spaceRole'">
          <a-select
            v-model:value="record.spaceRole"
            :options="SPACE_ROLE_OPTIONS"
            @change="(value) => editSpaceRole(value, record)"
          />
        </template>

        <template v-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>

        <template v-else-if="column.key === 'action'">
          <a-space wrap>
            <a-popconfirm
              title="是否要删除这条空间用户数据?"
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

interface Props {
  id: string
}

const props = withDefaults(defineProps<Props>(), {})

console.log(props, 'props')
// 表格列
const columns = [
  {
    title: '用户',
    dataIndex: 'userInfo',
  },
  {
    title: '角色',
    dataIndex: 'spaceRole',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

// 添加空间成员
const formData = ref<API.SpaceUserAddRequest>({
  spaceId: Number(props.id),
  userId: null,
})

const manageSpaceList = ref([])
const manageSpaceListTotal = ref(0)

// 初始化
formData.value.spaceId = props.id
const init = async () => {
  loading.value = true

  if (!formData.value.spaceId) {
    message.error('空间id不能为空')
    return
  }
  const res = await listSpaceUserUsingPost({
    spaceId: formData.value.spaceId,
  })
  if (res.code === 0) {
    manageSpaceList.value = res.data
    manageSpaceListTotal.value = res.data.length
  } else {
    message.error(res.message)
  }
  loading.value = false
}

// 搜索
const loading = ref(false)
// 搜索 记得从第一页开始搜索
const handleFinish: FormProps['onFinish'] = async () => {
  loading.value = true
  console.log(formData.value, '=-==')
  if (!formData.value.spaceId) {
    message.error('空间id不能为空')
    return
  }

  const res = await addSpaceUserUsingPost(formData.value)
  if (res.code == 0) {
    message.success('添加成功')
    init()
  } else {
    message.error(res.message)
  }

  init()
}
const handleFinishFailed: FormProps['onFinishFailed'] = (errors) => {
  console.log(errors)
}

// 删除数据
const deleteSpaceInfo = async (record: any) => {
  const res = await deleteSpaceUserUsingPost({
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
import { SPACE_ROLE_OPTIONS } from '@/constants/space'
import { BarChartOutlined } from '@ant-design/icons-vue'
import { h } from 'vue'
import {
  addSpaceUserUsingPost,
  deleteSpaceUserUsingPost,
  editSpaceUserUsingPost,
  listSpaceUserUsingPost,
} from '@/api/spaceUserController'
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

/**
 * 编辑成员角色

 * @param value 当前选中值
 * @param record 选中的数据
 */
const editSpaceRole = async (value, record) => {
  const res = await editSpaceUserUsingPost({
    id: record.id,
    spaceRole: value,
  })
  if (res.code == 0) {
    message.success('修改成功')
    init()
  } else {
    message.error('修改失败: ' + res.message)
  }
}

onMounted(() => {
  init()
})
</script>

<style lang="less" scoped></style>
