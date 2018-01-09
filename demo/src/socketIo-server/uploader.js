let multer = require('multer'); //导入上传中间件
let md5 = require('md5');   //导入md5中间件
let fs  = require('fs');    //导入node fs 文件系统
let url = require('url');   //系统url解析器
const  UPLOAD_PATH = process.cwd()+'/static/img';//获得node js 的运行目录 linux 下需要给充足的权限上传这个目录是vue 默认的静态目录存放的地方存到其他目录会导致require出错

let storage    = multer.diskStorage({
  destination:UPLOAD_PATH, //此参数为字符串自动创建目录如果为function需要手动阀创建
  filename:function (req,file,cb) {
    let queryData        =url.parse(req.url,true,true).query;
    let  fileFormat   =(file.originalname).split(".");
    console.log(queryData,fileFormat);
    //保存如偏
    cb(null, queryData.userId + "." + fileFormat[fileFormat.length - 1]);
  }
});


let upload=multer({
  storage:storage
});
module.exports = upload;
