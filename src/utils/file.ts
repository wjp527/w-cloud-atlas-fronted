import { saveAs } from "file-saver"

/**
 * 格式化文件大小
 * @param size 文件大小（字节）
 * @returns
 */
export const formatSize = (size: number | string) => {
  if (!size) return '未知'
  if (typeof (size) === 'string') size = Number(size)
  if (size < 1024) return size + 'B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + 'KB'
  return (size / 1024 / 1024).toFixed(2) + 'MB'
}

/**
 * 下载图片
 * @param url 图片路径
 * @param filename 图片名
 * @returns
 */
export const downloadImage = (url?: string, filename?: string) => {
  if (!url) {
    return
  }

  saveAs(url, filename)
}
