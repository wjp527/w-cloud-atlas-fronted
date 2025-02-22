import { getLoginUserUsingGet } from "@/api/userController";
import { defineStore } from "pinia";
import { ref } from "vue";
/**
 * 存储登录用户信息的状态
 */
export const useUserStore = defineStore("userStore",
  () => {

    const loginUser = ref<API.LoginUserVO>({
      userName: '未登录'
    })


    // 获取登录用户信息
    const fetchLoginUser = async () => {
      try {
        const res = await getLoginUserUsingGet()
        if (res.code === 0) {
          loginUser.value = res.data
        } else {
          return res.code
        }
      } catch (error) {
        loginUser.value = null
        return null
      }
    }
    // 添加清理用户数据的方法
    const clearUserInfo = () => {
      loginUser.value = null;
    }

    return {
      // 获取用户登录信息
      loginUser,
      fetchLoginUser,

      // 清理用户数据
      clearUserInfo,

    }
  },
  {
    persist: true,
  }
)
