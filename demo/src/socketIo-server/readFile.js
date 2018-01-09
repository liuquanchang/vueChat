let fs        = require('fs');
let imageInfo = require('imageinfo');
const filePathDt='./static/img/';
class readFile
{
  constructor(ctx){
    this.ctx    = ctx;
    this.fsCtx  =fs;
    this.imgCtx =imageInfo;
  }

  /**
   * 判读文件是否存在 需要及时跟新 初始化的时候不需要
   * @param filePath
   * @param fileList
   */
  fileExists(filePath,fileList){
    //同步读取文件
   let files    =  this.fsCtx.readdirSync(filePath);
   files.forEach((item,index)=>{
     let state      = this.fsCtx.statSync(filePath+item);
     if(state.isDirectory()){
       this.fileExists(filePath+item,fileList);
     }else {
       fileList.push({path:filePath,name:item});
     }
   });
   return fileList;
  }

  getFIleLIst(useId,sourceID){
    let       fileList    = [];
    let       resultList  = this.fileExists(filePathDt,fileList);
    return    this.ctx.fileExists(useId,sourceID,resultList);
  }


  getAvatarList(){
    console.log('------------------------getAvatarListAction-------------------------------');
    let       fileList    = [],return_data=[];
    let       resultList  = this.fileExists(filePathDt,fileList);
    if(resultList.length===0){return fileList;}
    //>>组成{name:lqc,filename:lqc.jpg}数据格式
    resultList.forEach((fileItem)=>{

      let filenameResult      =fileItem.name.split('.');
      return_data.push({name:filenameResult[0],filename:fileItem.name})
    });
    console.log(return_data);
    console.log('--------------------getAvatarListEnd-----------------------------------');
    return return_data;
  }

}



module.exports  = readFile;
