import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import removeConsole from 'vite-plugin-remove-console'
// https://vite.dev/config/
export default defineConfig({
  server: {
    // // 配置前端跨域
    // proxy: {
    //   '/api': 'http://localhost:8121'
    // }
  },
  plugins: [
    vue(),
    vueDevTools(),
    // 生产环境移除 console
    removeConsole({
      includes: ['log', 'warn', 'error', 'info', 'debug']
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  }
})
