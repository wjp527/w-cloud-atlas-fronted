/**
 * 将颜色值转换为  #RRGGBB 格式。

 * @param input 可以是 0x 开头的十六进制字符串，也可以是普通的十进制数字。例如：'0xff00ff' 或 '255,0,255'。

 * @returns
 */
export function toHexColor(input: string) {
  // 去掉 0x 前缀
  const colorValue = input.startsWith('0x') ? input.slice(2) : input

  // 将剩余部分解析为十六进制数，再转成 6 位十六进制字符串
  const hexColor = parseInt(colorValue, 16).toString(16).padStart(6, '0')

  // 返回标准 #RRGGBB 格式
  return `#${hexColor}`
}
