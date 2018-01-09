let express     = require('express');
let router      = express.Router();
let multer      = require('multer');
let multiparty  = require('multiparty');
let socket      = require('socket.io');
let http        = require('http');
let redis       = require('redis');
let url         = require('url');
let app         = express();
let mysql       = require("mysql");
let socketIoPort= 9501;
let channelId   = 1;
router.get('/',function (request,response) {
  console.log(url.parse(request.url,true,true).query.name);
  response.send('success socketIo '+socketIoPort);
});
let  upload      =require('../src/socketIo-server/uploader');
router.post('/upload',upload.single('avatar'),function (req,response,next) {
  //一次调用先调用upload.single 在调用会面的方法 next 上传成功可以跳转
  //upload.single('avatar')需要他执行成功之后再回回调后面的函数
  response.header('Access-Control-Allow-Origin', '*');
  response.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  response.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE,OPTIONS');

  if(req.file){
    let result        ={};
    result.path       = req.file.path;
    result.destination= req.file.destination;
    result.filename   = req.file.filename;
    response.send(result);
  }
});
let server      = http.createServer(app);
let options     ={
  host:'192.168.0.10',
  user:'yongqiang',
  password:'admin888',
  database:'jihui.cn',
  port:3306
};
//启动mysql链接池
let pool        = mysql.createPool(options);
let client      = redis.createClient(6379,"127.0.0.1");
let io          = socket(server);
//>>socketIo的服务端
let context     = require('../src/socketIo-server/context');
// 在这个地方初始化数据只初始化一遍。。。以便数据存储
let ctx         =  new context();
io.on('connection',function (socket) {
  console.log('新连接.....');console.log(socket.id);
  ctx.createChannel(socket,channelId++,socket.id,io,client,pool)

});
//使用该路由
app.use(router);
server.listen(socketIoPort);
console.log('success socketIo listen port :'+socketIoPort);
