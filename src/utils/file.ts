import { saveAs } from "file-saver"

/**
 * 格式化文件大小
 * @param size 文件大小（字节）
 * @returns
 */
export const formatSize = (size: number | string) => {
  if (!size) return '未知';
  if (typeof size === 'string') size = Number(size);

  // B
  if (size < 1024) return size + 'B';

  // KB
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + 'KB';

  // MB
  if (size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(2) + 'MB';

  // GB
  return (size / 1024 / 1024 / 1024).toFixed(2) + 'GB';
};

/**
 * 判断该文件大小是否超过10MB
 * 超出则不允许AI扩图
 *
 * @param size 文件大小（字节）
 * @returns
 */
export const isLargeFile = (size: number | string) => {
  if (!size) return false
  if (typeof (size) === 'string') size = Number(size)
  return size > 1024 * 1024 * 10
}


// 判断图片的宽高是否符合要求
export const isImageSizeValid = (width: number, height: number) => {
  // 有一个维度小于512 或者 大于4096 则不允许上传

  if ((width < 512 || height < 512)) {
    console.log(1);
    return false
  }
  // 有一个维度大于4096 则不允许上传
  else if ((width > 4096 || height > 4096)) {
    console.log(2);
    return false
  }
  else {
    console.log(13);
    return true
  }
  // return true
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
