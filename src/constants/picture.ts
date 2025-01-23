/**
 * 图片审核状态枚举
 */
export const PIC_REVIEW_STATUS_ENUM = {
  REVIEWING: 0,
  PASS: 1,
  REJECT: 2,
}

/**
 * 图片审核状态文案
 */
export const PIC_REVIEW_STATUS_MAP = {
  0: '待审核',
  1: '通过',
  2: '拒绝',
}

/**
 * 图片审核下拉表达选项
 */
export const PIC_REVIEW_STATUS_OPTIONS = Object.keys(PIC_REVIEW_STATUS_MAP).map((key) => {
  return {
    label: PIC_REVIEW_STATUS_MAP[key],
    value: key,
  }
})


// -------------------------------------------------------------------------------------------------

// 批量导入
/**
 * 图片来源枚举
 */
export const PIC_BATCH_ENUM = {
  BAIDU: "baidu",
  BING: "bing",
}

/**
 * 图片来源文案
 */
export const PIC_BATCH_MAP = {
  "baidu": '百度',
  "bing": "必应"
}

/**
 * 图片来源下拉表达选项
 */
export const PIC_BATCH_OPTIONS = Object.keys(PIC_BATCH_MAP).map((key) => {
  return {
    label: PIC_BATCH_MAP[key],
    value: key,
  }
})
