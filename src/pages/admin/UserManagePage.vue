<template>
  <div id="UserManagePage">
    <!-- 搜索 -->
    <a-form
      layout="inline"
      :model="searchParams"
      @finish="handleFinish"
      @finishFailed="handleFinishFailed"
      class="mb-10"
    >
      <a-form-item>
        <a-input v-model:value="searchParams.userAccount" placeholder="用户账号" allow-clear>
          <template #prefix><UserOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
        </a-input>
      </a-form-item>
      <a-form-item>
        <a-input v-model:value="searchParams.userName" placeholder="用户名" allow-clear>
          <template #prefix><LockOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
        </a-input>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit"> 搜索 </a-button>
        <a-button @click="handleReset"> 重置 </a-button>
        <a-button @click="handleAdd"> 新增 </a-button>
      </a-form-item>
    </a-form>

    <a-table
      :loading="loading"
      :columns="columns"
      :data-source="manageUserList"
      :pagination="{
        total: manageUserListTotal,
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
        <template v-if="column.dataIndex === 'userAvatar'">
          <a-image :src="record.userAvatar" :width="80" />
        </template>
        <template v-else-if="column.dataIndex === 'userRole'">
          <div v-if="record.userRole === 'admin'">
            <a-tag color="green"> 管理员 </a-tag>
          </div>
          <div v-else>
            <a-tag color="blue"> 普通用户 </a-tag>
          </div>
        </template>
        <template v-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>

        <template v-else-if="column.key === 'action'">
          <a-button type="primary" size="small" class="mr-4" @click="showModal(record)"
            >编辑</a-button
          >
          <a-popconfirm
            title="是否要删除这条用户数据?"
            ok-text="是"
            cancel-text="否"
            @confirm="deleteUserInfo(record)"
            @cancel="cancelDeleteUserInfo"
          >
            <a-button type="primary" danger size="small">删除</a-button>
          </a-popconfirm>
        </template>
      </template>
    </a-table>

    <manageMode v-model:open="isModalOpen" :modalData="modalData" @submitForm="submitForm" />
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useManageStore } from '@/store/manage'
import { storeToRefs } from 'pinia'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import type { FormProps } from 'ant-design-vue'
import { deleteUserUsingPost, updateUserUsingPost, userAddUsingPost } from '@/api/userController'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'

const manageStore = useManageStore()
const columns = [
  {
    title: 'id',
    dataIndex: 'id',
  },
  {
    title: '账号',
    dataIndex: 'userAccount',
  },
  {
    title: '用户名',
    dataIndex: 'userName',
  },
  {
    title: '头像',
    dataIndex: 'userAvatar',
  },
  {
    title: '简介',
    dataIndex: 'userProfile',
  },
  {
    title: '用户角色',
    dataIndex: 'userRole',
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

// 搜索参数
const searchParams = ref({
  current: 1,
  pageSize: 10,
  // 排序字段
  sortField: 'createTime',
  // 排序顺序
  sortOrder: 'ascend',
  // 用户账号
  userAccount: '',
  // 用户名
  userName: '',
})

const { manageUserList, manageUserListTotal } = storeToRefs(manageStore)

const init = async () => {
  const res = await manageStore.getManageUserList(searchParams.value)
  if (res === 200) {
  } else {
    message.error(res)
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

// 展示弹窗
const showModal = (record: any) => {
  modalData.value = record
  console.log(record, 'record')
  isModalOpen.value = true // 显示弹出框
}
// 新增表单
const handleAdd = () => {
  modalData.value = {}
  isModalOpen.value = true // 显示弹出框
}
// 提交表单
const submitForm = async (data: any) => {
  console.log(data, 'data')
  if (!data.id) {
    const res = await userAddUsingPost(data)
  if (res.code == 0) {
    message.success('新增成功')
    init()
  } else {
    message.error('新增失败')
  }
  } else {
    const res = await updateUserUsingPost(data)
    if (res.code == 0) {
      message.success('修改成功')
      init()
    } else {
      message.error('修改失败')
    }
  }
}
// 删除数据
const deleteUserInfo = async (record: any) => {
  const res = await deleteUserUsingPost({
    id: record.id,
  })
  if (res.code == 0) {
    message.success('删除成功')
    init()
  } else {
    message.error('删除失败')
  }
}

const cancelDeleteUserInfo = () => {}
onMounted(() => {
  init()
})
</script>
