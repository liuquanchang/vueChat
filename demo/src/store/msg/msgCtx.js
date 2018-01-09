class msgCtx{
  constructor(ctx){
    this.ctx  =ctx;
  }

  /**
   * 发送消息
   * 暂时不支持图片消息的发送
   */
  sendMsg(msg,callback){
    this.ctx.SendMsg(msg,callback)
  }

  senGroupChatMsg(msg,callback){

    this.ctx.sendGroupChatMsg(msg,callback)
  }
  /**
   * 撤回消息 就不需要在服务端做处理啦
   * 撤回消息的需要有时间限制
   */
  withdrawMsg(){

  }

  /**
   * 初始化消息信息
   */
  init(){

  }
}
export default msgCtx;
