import indexContext  from './indexCtx';
let ctx = null;
const get_client = () => {
  //简单的一个单例模式
  if (ctx === null) {
    //>>初始化socketIo链接 对socket的进行封装
    ctx = new indexContext();
  }
  return ctx;
};
//>>只要实例化后可以调用里面的静态方法
const clientDtIoData = indexContext;
export {get_client, clientDtIoData}
