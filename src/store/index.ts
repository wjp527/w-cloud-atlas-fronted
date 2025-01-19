import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const store = createPinia()
// 持久化存储插件
store.use(piniaPluginPersistedstate)

export default store
