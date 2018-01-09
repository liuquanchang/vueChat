let config = require('./config');
import context from './context'
let ctx = null;
let io = require('socket.io-client');
const getCtx = () => {
  let uri = config.Schema + config.host + config.ds + config.port;
  // 避免重复的调用 因为当前的页面是没有刷新 所以对象是一直保存在内存里面
  //重复的调用会产生很多不确定的因素。。。是重新初始化链接参数
  if (ctx === null) {
    ctx = new context(io, uri);
  }
  return ctx;
};
export { getCtx };
