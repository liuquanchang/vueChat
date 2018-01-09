import { getCtx } from '../socketIo-client/index'; // 的到我们的service层句柄桥梁
import userCtx  from  './user/userCtx';           //  用户上下文的设置
import msgCtx   from  './msg/msgCtx';              //  用消息设置
import roomCtx from './room/roomCtx';             //  聊天的房间设置
//集中管理各个组件
class indexCtx {
  constructor() {
    //注册组件
    this.server_client = getCtx();
    this.userCtx = new userCtx(this.server_client);
    this.msgCtx = new msgCtx(this.server_client);
    this.roomCtx = new roomCtx(this.server_client);
  }

  init(vueCtx, trigger, cacheKey) {
    //初始化当前的socket链接
    this.server_client.init(vueCtx, trigger, cacheKey);
    // 可以初始化一些我们的用户信息
    this.userCtx.init();
    // 就是我们的消息信息等等
    this.msgCtx.init();
    // 我们的房间信息
    this.roomCtx.init();
  }
}
export  default indexCtx;
