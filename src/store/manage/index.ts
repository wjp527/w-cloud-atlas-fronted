import { listUserVoByPageUsingPost, } from "@/api/userController";
import { defineStore } from "pinia";
import { ref } from "vue";
/**
 * 管理员
 * 存储登录用户信息的状态
 */
export const useManageStore = defineStore("manageStore",
  () => {


    // 用户列表
    const manageUserList = ref<API.UserVO[]>([])
    // 用户列表总条数
    const manageUserListTotal = ref<number>(0)

    const getManageUserList = async (payload: API.PageUserVO_) => {
      const res = await listUserVoByPageUsingPost(payload)

      if (res.code === 0 && res.data) {
        manageUserList.value = res.data.records
        manageUserListTotal.value = res.data.total
        return 200
      } else {
        return res.message
      }
    }

    return {
      manageUserList,
      manageUserListTotal,
      getManageUserList
    }
  },
  {
    persist: true,
  }
)
