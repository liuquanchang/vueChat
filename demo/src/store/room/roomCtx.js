class roomCtx{
  constructor(ctx){
    this.ctx  =ctx;
  }

  /**
   * @param roomName 房间的名称
   * @param roomId   房间的ID
   */
  addRoom(roomName,roomId){
    this.ctx.sendAddRoom(roomName,roomId);
  }

  /**
   * @param msg  房间的名称
   * @param callback    房间的ID
   */
  delRoom(msg,callback){
    this.ctx.sendDelRoom(msg,callback)
  }

  addGroup(group){
    this.ctx.addGroup(group);
  }

  addTalkGroup(talkGroup){
      this.ctx.addTalkGroup(talkGroup);
  }

  /**
   * @param msg       自己可以以任意的环岛那个组里面去
   * @param callback
   */
  freeChangeRoom(msg,callback){
    this.ctx.freeChangeRoom(msg,callback);
  }
  /**
   * 初始化房间信息
   */
  init(){

  }
}

export default roomCtx;
