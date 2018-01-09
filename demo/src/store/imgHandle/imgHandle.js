
import underscore from 'underscore';
class imgHandle
{
  constructor(ctx){
    this.ctx   =ctx;
    this.fileStream=null;
    this.fileRedaer=null;
    this.allowImageMime=['jpg','gif','png','jpeg'];
    this.fileBinary    =null;
  }

  init(fileStream){
    this.fileStream           =   fileStream;
    if(!window.FileReader){return false;}
    this.fileRedaer           =   new FileReader();
    return this;
  }
  imgMessage(callback){
    let prefix       =  this.fileStream.type.split('/');
    if(underscore.indexOf(this.allowImageMime,prefix[1])>=0 && this.fileStream.size>0){
      this.fileRedaer.readAsDataURL(this.fileStream);
      this.fileRedaer.onloadend=(result)=>{callback(result);}
    }
  }

}

export default imgHandle;
