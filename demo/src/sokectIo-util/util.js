module.exports = {
  'emit': {
    'sendRooms': 'send.roomCollection', /* 发送房间列表 */
    'newUser': 'send.newUser', /** 新加入的用户 */
    'notifyMsg': 'notify.msg', /** 通知消息 */
    'refUsers': 'refresh.users', /** 刷新用户列表 */
    'refreshRoom':'refresh.room', /** 刷新房间 */
    'newRoom': 'receive.room',    /** 接收 */
    'addGroup':'send.add.group',  /** 添加群组 */
    'addTalk':'send.add.talk.group', /** 添加到某个群组里面 */
    'insideRefresh':'send.inside.refresh.room',/** 内部刷新当前的用户列表以及改变当前的状态*/
    'getSocketId':'send.socket.id', /** 得到当前的socketId */
    'acceptMsg':'accept.client.message',/** 接收客户端发来的消息 */
    'disconnect':'disconnect',/** 客户端断开连接的时候 */
    'sendRefreshUser':'send_refresh_user',/** 刷新当前的登录用户 */
    'groupChat':'send.group,chat', /** 群聊事件*/
    'acceptGroupChatMsg':'send.accept.group.chat.msg',/**接收群消息事件*/
  },
  'client': {
    'registerUser': 'send.register.user', /** 注册一个用户 */
    'sendMsg': 'send.msg', /** 客户端发送的消息 */
    'closeConn': 'send.closeConn', /** 关闭连接 */
    'addRoom':'send.add.room',   /** 添加房间 */
    'delRoom':'send.del.room',/** 添加房间 */
    'delUser':'send.del.user', /** 删除我们用户 */
    'listenTip':'send.listen.tip', /** 监听当前的 */
    'login':'send.login', /** 登录接口*/
    'flushServerKey':'send.flush.server.key', /** 刷新当前的socketId  */
    'acceptServerMessage':'sen.accept.server.message', /** 得到当前的socket链接 */
    'freeChangRoom':'send.free.change.room',  /** 用户换房间的操作 */
    'acceptSameGroupMsg':'send.same.group.msg',/** 给同组的用户广播消息  */
  }
};
