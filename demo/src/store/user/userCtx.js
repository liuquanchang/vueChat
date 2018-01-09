/**
 * 设置use的上下文环境 逻辑层面
 */
class userCtx {
  /**
   * @param ctx 我们所有的数据model层 或者是service层
   */
  constructor(ctx){
    this.ctx  =ctx;
  }

  /**
   * @param userId    用户Id
   * @param username  用户的名称
   * @param callback
   */
  sendRegister(userId,username,callback){
    this.ctx.sendRegister(userId,username,callback);
  }

  /**
   * @param userId  需要删除的userId
   * @param username 需要删除用户名称
   */
  delUser(userId,username){

  }

  /**
   * 用户登录的接口
   */
  login(msg,callback){
     this.ctx.login(msg,callback);
  }

  handleFlushKey(){
    this.ctx.flushKey();
  }

  /**
   * 初始化用户数据
   */
  init(){

  }

}

export default userCtx;
