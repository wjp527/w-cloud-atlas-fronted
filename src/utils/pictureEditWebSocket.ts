/**
 * 图片编辑 WebSocket 客户端类，用于与服务器进行实时通信。
 * 支持事件订阅、消息发送、连接管理等核心功能
 */
export default class PictureEditWebSocket {
  /** 当前正在编辑的图片ID */
  private pictureId: number
  /** WebSocket 实例，用于维护与服务器的连接 */
  private socket: WebSocket | null
  /** 事件处理器映射表，存储所有注册的事件处理函数 */
  /**
   * {
   *    EDIT_ACTION: fun,
   *    ENTER_EDIT: fun,  
   *    ERROR: fun,
   *    EXIT_EDIT: fun,
   *    INFO: fun,
   *    confirm: fun
   * }
   */
  private eventHandlers: any


  /**
   * 构造函数
   * @param pictureId 图片ID，用于建立特定图片的WebSocket连接
   */
  constructor(pictureId: number) {
    this.pictureId = pictureId // 当前编辑的图片 ID
    this.socket = null // WebSocket 实例
    this.eventHandlers = {} // 自定义事件处理器
  }

  /**
   * 初始化并建立 WebSocket 连接
   * 设置各类事件监听器，处理连接生命周期事件
   */
  connect() {
    console.log(this.pictureId, '===')

    const DEV_BASE_URL = "localhost:8121";
    // http://cloudatlas.wcoder.online
    const PROD_BASE_URL = "cloudatlas.wcoder.online";
    // 本地环境
    // const url = `ws://${DEV_BASE_URL}/api/ws/picture/edit?pictureId=${this.pictureId}`

    // 线上环境
    const url = `ws://${PROD_BASE_URL}/api/ws/picture/edit?pictureId=${this.pictureId}`
    this.socket = new WebSocket(url)

    // 设置携带 cookie
    // 设置二进制数据类型为 blob
    this.socket.binaryType = 'blob'

    // 监听连接成功事件
    // 连接建立成功的处理函数
    this.socket.onopen = () => {
      console.log('WebSocket 连接已建立')
      this.triggerEvent('open')
    }

    // 监听消息事件
    // 接收消息的处理函数
    // 当客户端收到服务端 broadcastToPicture 中的 sendMessage 发送 WebSocket消息，就会触发这个监听消息事件
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data)
      console.log('收到消息:', message)

      // 根据消息类型触发对应的自定义事件
      const type = message.type
      this.triggerEvent(type, message)
    }

    // 监听连接关闭事件
    this.socket.onclose = (event) => {
      console.log('WebSocket 连接已关闭:', event)
      this.triggerEvent('close', event)
    }

    // 监听错误事件
    this.socket.onerror = (error) => {
      console.error('WebSocket 发生错误:', error)
      this.triggerEvent('error', error)
    }
  }

  /**
   * 主动关闭 WebSocket 连接
   * 在组件卸载或不需要连接时调用
   */
  disconnect() {
    if (this.socket) {
      this.socket.close()
      console.log('WebSocket 连接已手动关闭')
    }
  }

  /**
   * 向服务器发送消息
   * @param message 要发送的消息对象，将被转换为 JSON 字符串
   */
  sendMessage(message: object) {
    // 判断 WebSocket 是否连接  
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      // 向后端发送消息
      this.socket.send(JSON.stringify(message))
      console.log('消息已发送:', message)
    } else {
      console.error('WebSocket 未连接，无法发送消息:', message)
    }
  }

  /**
   * 注册事件监听器
   * @param type 事件类型，可以是自定义事件或WebSocket生命周期事件
   * @param handler 事件处理函数，当事件触发时被调用
   */
  on(type: string, handler: (data?: any) => void) {
    if (!this.eventHandlers[type]) {
      this.eventHandlers[type] = []
    }
    this.eventHandlers[type].push(handler)
  }

  /**
   * 触发指定类型的事件
   * @param type 要触发的事件类型
   * @param data 传递给事件处理器的数据
   */
  triggerEvent(type: string, data?: any) {
    // 获取到具体的事件处理器
    const handlers = this.eventHandlers[type]
    if (handlers) {
      // 遍历执行事件处理器
      handlers.forEach((handler: any) => handler(data))
    }
  }
}
