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
      const res = await getLoginUserUsingGet()
      console.log(res.data);
      if (res.code === 0) {
        loginUser.value = res.data
      } else {
        return res.code
      }
    }

    return {

      // 获取用户登录信息
      loginUser,
      fetchLoginUser

    }
  },
  {
    persist: true,
  }
)
