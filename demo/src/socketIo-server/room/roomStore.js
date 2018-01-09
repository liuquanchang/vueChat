
class roomStore
{
  constructor (ctx){
    this.GroupName   = '游客聊天室';
    this.ctx    = ctx;
  }

   storeRoom(username,userId,socketId,groupName=null){
    //为什么不定成全局的初始化的时候初始化因为对象是隐痛赋值所以没戏赋值后直接影响之前的数据值
     let user      = {};
     let roomCtx   = {};
    //存储当前的
    if(groupName!==null){this.GroupName=groupName;}
    user.username  = username;  //当前的正式信命
    user.userId    = userId;   //当前的登录ID
    user.socketId  = socketId; //实现个推
    user.isOnline  = false;    //注册还不算上线那么要等到登录成功的时候才算是上线的状态
    roomCtx.name   = this.GroupName; //或者是房间ID
    roomCtx.user   = user;
    return roomCtx;
  }
}
module.exports      = roomStore;
