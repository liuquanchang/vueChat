/**
 * 正式service层
 */
class sendMsg  {
  constructor(ctx){
    this.ctx=ctx;
  }
  sendRegister(msg){
    //触发注册消息
    this.ctx.socket.emit(this.ctx.events_key.client.registerUser,msg);
  }
  /**
   * 单项的发送消息
   * @param msg
   */
  sendMessage(msg){
    this.ctx.socket.emit(this.ctx.events_key.emit.acceptMsg,msg);
  }

  /**
   *   房间的名称 简单的添加不加编号了本来可以排序的
   */
  senAddRoom(msg){
    console.log(msg);
    this.ctx.socket.emit(this.ctx.events_key.client.addRoom,msg);
  }

  /**
   * 需要删除的房间编号 需要删除的额房间名称 删除房间需要吧所有的注册用户转到游客组里面去
   */
  sendDelRoom(msg){
    this.ctx.socket.emit(this.ctx.events_key.client.delRoom,msg);
  }

  /**
   * 刷新当前的用户列表
   * @param callback  一个回调函数
   */
  refreshUsers(callback){
    this.ctx.socket.on(this.ctx.events_key.emit.refUsers,function (users) {
      callback(users);
    })
  }
  /**
   * 刷新当前的房间列表
   * @param callback 一个回调函数
   */
  refreshRoom(callback){
    //callback已经在初始化的时候的加以传入
    this.ctx.socket.on(this.ctx.events_key.emit.refreshRoom,function (rooms) {
       callback(rooms);
    })
  }

  /**
   * 默认加入游客组
   * 选择组别后再加入我们的其他组别
   * @param group
   */
  addGroup(group){
    this.ctx.socket.emit(this.ctx.events_key.emit.addGroup,group);
  }
  //转到其他的房间
  addTalkGroup(groupName){
    this.ctx.socket.emit(this.ctx.events_key.emit.addTalk,groupName);
  }

  listenToMsg(){
    let self      = this;
    this.ctx.socket.on(this.ctx.events_key.client.listenTip,function (tipData) {
       if( 'function'===typeof self.ctx.tipFunc ){
            self.ctx.tipFunc(tipData);
       }
    })
  }
  login(msg){
     this.ctx.socket.emit(this.ctx.events_key.client.login,msg);
  }

  /**
   * @param callback //当前的重新刷新用户列表
   */
  insideRefresh(callback){
    this.ctx.socket.on(this.ctx.events_key.emit.insideRefresh,function (roomsUser) {
      callback(roomsUser)
    })
  }

  /**
   * 在客户端标识自己
   * @param callback
   */
  getSocketId(callback){
    this.ctx.socket.on(this.ctx.events_key.emit.getSocketId,function (socketId) {
       console.log(socketId);
       callback(socketId);
    })
  }

  /**
   * @param msg 向服务器帅醒当前的socketId
   */
  flushServerKey(msg){
    this.ctx.socket.emit(this.ctx.events_key.client.flushServerKey,msg);
  }

  /**
   *监听服务器像我推送的消息  现在又做做消息缓存功能如果需要需要在redis里面添加一个列表数据（list）或者持久化到redis和数据库里面（mysql）
   */
  acceptServerMsg(callback){
    this.ctx.socket.on(this.ctx.events_key.client.acceptServerMessage,function(msg){
        callback(msg);
    });
  }
  //>>接收刷新的用户信息
  sendRefreshUser(callback){
    this.ctx.socket.on(this.ctx.events_key.emit.sendRefreshUser,function (msg) {
      callback(msg)
    })
  }
  /**
   * 自由的跟换房间
   * @param msg
   */
  freeChangeRoom(msg){
    // 发送跟换信息
    this.ctx.socket.emit(this.ctx.events_key.client.freeChangRoom,msg);
  }

  acceptSameNoticeMsg(callback){
    this.ctx.socket.on(this.ctx.events_key.client.acceptSameGroupMsg,function (msg) {
       callback(msg);
    })
  }

  /**
   * 箭筒服务端发送的消息
   * @param callback
   */
  acceptGroupChatMsg(callback){
    this.ctx.socket.on(this.ctx.events_key.emit.acceptGroupChatMsg,function (msg) {
          callback(msg)
    })
  }

  /**
   * @param msg 当前的群聊消息
   */
  sendGroupChatMsg(msg){
    this.ctx.socket.emit(this.ctx.events_key.emit.groupChat,msg);
  }
}
export default sendMsg;
