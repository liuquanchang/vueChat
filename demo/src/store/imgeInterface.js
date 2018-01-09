import  ImageCtx from './imgHandle/ImageCtx';
let ctx = null;
const imageHandler = () => {
  //简单实现单例模式
  if (ctx === null || !(ctx instanceof ImageCtx)) {
    ctx = new ImageCtx();
  }
  return ctx;
};
export  {imageHandler}
