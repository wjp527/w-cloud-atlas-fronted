import { generateService } from '@umijs/openapi'

generateService({
  // 请求库
  requestLibPath: "import request from '@/request'",
  // 后端的接口文档
  schemaPath: 'http://localhost:8121/api/v2/api-docs',
  // 生成的文件的目录
  serversPath: './src',
})
