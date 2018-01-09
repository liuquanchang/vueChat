let event_key       =require('../sokectIo-util/util');

/**
 * 当前的service层
 */
class channel{
  constructor(socket,channelId,socketId,ctx,allSocketIo,redisClient,mysqlPool){
    this.socket       = socket;       //当前的Socket链接
    this.channelId    = channelId;    //当前的通道ID
    this.socketId     = socketId;     //当前的额socketId
    this.ctx          = ctx;          //上下文环境变量
    this.events_key   = event_key;    //当前需要的所有的事件参数
    this.allSocketIo  = allSocketIo;  //所有的socketIo的链接
    this.redisClient  = redisClient;  //redis 客户端
    this.mysqlPool    = mysqlPool;    //mysql 客户端
  }

  /**
   * 前提都是在在我们测connection的方法里面
   */
   init(){
    let self      = this;
    //监听注册事件
    this.socket.on(this.events_key.client.registerUser,function(user){
      user.socketId = user.id;
      //加上socketID的目的是以实现私聊
      self.ctx.setUser(user,function (handlerUser) {
           user     =  handlerUser;
      });
      //储存当前的用户
      self.ctx.storeUser(user);
    });
    //添加房间事件
    this.socket.on(this.events_key.emit.newRoom,function(roomInfo){
       self.ctx.setRoom(roomInfo);
    });
    this.refreshUsers();  //刷新当前的用户列表
    this.refreshRoom();   //刷新当前的房间列表
    //>>自己加入某个组里面
    this.addGroup( (data)=> {
       self.ctx.addRooms(data);
    });
    //>>添加组别也可以叫做添加房间
    this.addTalkGroup( (talkGroup) =>{
        self.ctx.addTalkGroup(talkGroup)
    });
    //>>监听登录
    this.login( (loginInfo) =>{
       self.ctx.CheckLogin(loginInfo);
    });
    //>>向当前的socket链接链接推送当前的socket链接
    this.pushSocket(this.socketId);
    //刷新当前的socketId信息
    this.flushKey((info) =>{
        this.ctx.flushKey(info);
    });
    //>>监听客户端发送的额消息
    this.listenClientMessage( (msg)=> {
       this.ctx.listenClientMessage(msg);
    });
    //>>用户下线处理
    this.disconnect(() =>{
        this.ctx.disconnect(this.socketId);
    });
    //>>跟换组别
    this.freeChangeRoom((msg)=>{
      this.ctx.freeChangeRoom(msg);
    });
    //删除组别
    this.delRoomChange((msg)=>{
      this.ctx.delRoomChange(msg);
    });
    this.listenGroupChatMsg((msg)=>{
      this.ctx.listenGroupChatMsg(msg);
    });
  }
  /**
   * 刷新当前的用户
   */
   refreshUsers(){
     this.socket.emit(this.events_key.emit.refUsers,this.ctx.users);
  }
  /**
   * 刷新当前的房间
   */
   refreshRoom(){
    this.socket.emit(this.events_key.emit.refreshRoom,this.ctx.rooms);
  }

  /**
   *将当前的socket链接加入到当前的组里面
   */
  addGroup(callback){
     this.socket.on(this.events_key.client.addRoom,function (group) {
       callback(group);
     })
  }

  addTalkGroup(callback){
    this.socket.on(this.events_key.emit.addTalk,function (talkGroup) {
      callback(talkGroup);
    })
  }
  /**
   * @param TipMsg 发送提示信息接口那么客户端可以通过异步callback接收当前的提示信息
   * @param userId 给谁推送
   */
  listenTip(userId,TipMsg){
    /*console.log('-------------------------------listenTip-------------------------------------------------');
    console.log(userId);*/
    let socket      =  null;
    //回调当前的方法得到当前的socket链接
    this.ctx.getToSocket(userId,(socketStream) =>{
      socket        = socketStream;
    });
   /* console.log('--------------------------------listenTiEND------------------------------------------------');*/
    socket.emit(this.events_key.client.listenTip,TipMsg)
  }

  /**
   * 加入当前的聊天组
   * @param groupName
   * @param socketId  需要传递的当前socketId的编号
   */
  clientToGroup(socketId,groupName){
    //所有的socketIo的异步监听事件如on面使用的socket连接。。那那么当前的socket连接会被在最后一个覆盖。。。
    //所以如果需要异步添加群组那么需要取得当前的链接的socketID进而得到当前socketId对应的socket链接进行加入
    //>>console.log(groupName,this.socket.id);
    let socketStream    =  this.ctx.underscore.findWhere(this.allSocketIo.sockets.sockets,{id:socketId});
    if(socketStream){
      socketStream.join(groupName);
     }
  }
  /**
   * 离开或者是下线 或者是移动组别的时候
   */
  clientLeaveGroup(socketId,groupName){
    console.log('-------------------------clientLeaveGroupStart-----------------------------');
    //断开连接的时候socket连接就是当前断开的socket连接
    let socketStream    =  this.ctx.underscore.findWhere(this.allSocketIo.sockets.sockets,{id:socketId});
    if(socketStream){
      socketStream.leave(groupName);
    }
    console.log('-------------------------clientLeaveGroupEnd-----------------------------');
  }

  /**
   * 内部需要刷新当前的聊天室
   */
  insideRefreshRooms(groupName=''){
    this.ctx.restUsers();
    /**
     *
     {
         hLIra6V1F2plvRpiAAAD: Room { sockets: { hLIra6V1F2plvRpiAAAD: true }, length: 1 },
         '游客聊天室': Room { sockets: { hLIra6V1F2plvRpiAAAD: true }, length: 1 },
         vGeqWhXzhsLwafXhAAAF: Room { sockets: { vGeqWhXzhsLwafXhAAAF: true }, length: 1 },
         '雅梅聊天室': Room { sockets: { vGeqWhXzhsLwafXhAAAF: true }, length: 1 }
     }
     */
    //像固定的分组发送。。。。
    // 一个分组就相当于一个群一样 单群推送
    this.allSocketIo.sockets.in(groupName).emit(this.events_key.emit.insideRefresh,this.ctx.rooms);
    console.log('--------------------------insideRefreshRoomsEnd--------------------------------------');
  }

  /**
   * 添加房间之后需要所有的在线用户广播
   */
  broadcastAll(){
    this.ctx.restUsers();
    this.allSocketIo.sockets.emit(this.events_key.emit.insideRefresh,this.ctx.rooms);
  }
  /**
   * @param callback 登录的方法
   */
  login(callback){
    this.socket.on(this.events_key.client.login,function (msg) {
      callback(msg);
    });
  }

  /**
   *  标志是否自己 socket
   *  链接需要hash值发送客户端以后都会带上这可hash值判读socketStream是否存在
   *  以便做相应的推送工作或者是私聊业务
   */
  pushSocket(socketId){
    this.socket.emit(this.events_key.emit.getSocketId,socketId);
  }

  /**
   * 监听客户端是否刷新页面若果刷新那么就需要重新吧当前的socket链接加入到相应的组里面以便广播
   * @param callback
   */
  flushKey(callback){
    this.socket.on(this.events_key.client.flushServerKey,function (msg) {
       callback(msg);
    })
  }

  /**
   * 实现细聊的
   * 监听客户端发送过里来的消息
   */
  listenClientMessage(callback){
    this.socket.on(this.events_key.emit.acceptMsg,function (msg) {
      console.log(msg);
      callback(msg)
    });
  }

  /**
   * 向客户端发送消息指定的客户端
   */
  sendToClientMessage(name,msg){
   /* console.log('-------------------------------sendToClientMessage------------------------------------------------')*/
    let socket          = '';
    this.ctx.getToSocket(name,function(socketStream){
         //找到当前的socket链接
         socket            = socketStream;
    });
  /*  console.log(name,msg);
    console.log('-------------------------------sendToClientMessage------------------------------------------------')*/
    socket.emit(this.events_key.client.acceptServerMessage,msg)
  }
  /**
   * 链接断开自动触发
   * @param callback
   */
  disconnect(callback){
    this.socket.on(this.events_key.emit.disconnect,function () {
      callback()
    })
  }

  /**
   *防止用户在在客户端刷新当前的窗口无法显示当前的用户
   * @param username
   * @param userInfo
   */
  sendUserToClient(username,userInfo){
    let socket      =  null;
    this.ctx.getToSocket(username,(socketResult) =>{
      socket        = socketResult;
    });
    socket.emit(this.events_key.emit.sendRefreshUser,userInfo)
  }

  /**
   * 监听用户自由的跟换房间
   */
  freeChangeRoom(callback){
    this.socket.on(this.events_key.client.freeChangRoom,function (msg) {
      callback(msg);
    })
  }

  /**
   * @param groupName 组的民称 给某组广播消息
   * @param msg       消息json
   */
  sendSameGroup(groupName,msg){
    console.log('---------------------------sendSameGroupStart------------------------------------------------');
    console.log(groupName,msg);
    this.allSocketIo.sockets.in(groupName).emit(this.events_key.client.acceptSameGroupMsg,msg);
    console.log('---------------------------sendSameGroupEnd------------------------------------------------');
  }
  /**
   * 监听删除组
   * @param callback
   */
  delRoomChange(callback){
    this.socket.on(this.events_key.client.delRoom,function (msg) {
      callback(msg);
    })
  }

  /**
   * @param callback 事件回调函数
   */
  listenGroupChatMsg(callback){
    this.socket.on(this.events_key.emit.groupChat,function (msg) {
        callback(msg);
    });
  }

  /**
   * @param groupName 群聊的组名称
   * @param msg       群聊的组成员
   * 广播不抱扩自己。。群里面其他的成员广播消息
   */
  groupChatMsgSend(groupName,msg){
    this.ctx.restUsers();
    this.socket.broadcast.to(groupName).emit(this.events_key.emit.acceptGroupChatMsg,msg);
  }
}
module.exports       =   channel;
