import  indexData from './indexData';
let ctx = null;
const clientDtIo = (options) => {
  //简单实现一下单例模式
  if (ctx === null) {
     ctx = new indexData(options);
  }
  return ctx;
};
export {clientDtIo}
