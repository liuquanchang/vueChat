let Channel = require('./channel');
let roomStore = require('./room/roomStore');
let underscore = require('underscore');
let readFile = require('./readFile');
class context {
  constructor() {
    this.socket = null;
    this.channelId = null;
    this.socketId = null;
    this.users = [];
    this.rooms = [];
    this.allSocketIo = null;
    this.roomStore = new roomStore(this);
    this.readFile = new readFile(this);
    this.channelSend = null;
    this.redisClient = null;
    this.mysqlPool = null;
    this.underscore = underscore;
    this.publishUser = {};
    this.isLogin = {};
    this.defaultAvatar = './static/img/avatar.png';
    this.readAvatarPath = './static/img/';
  }

  /**
   * @param socket
   * @param channelId
   * @param socketId
   * @param allSocketIo
   * @returns {context}
   */
  static createContext(socket, channelId, socketId, allSocketIo) {
    return new context(socket, channelId, socketId, allSocketIo)
  }

  /**
   * @param socket
   * @param channelId
   * @param socketId
   * @param allSocketIo
   * @param redisClient
   * @param mysqlPool
   */
  createChannel(socket, channelId, socketId, allSocketIo, redisClient, mysqlPool) {
    this.socket = socket;           // 当前的链接socket里面保存这个当前的链接标识和以前的链接标识
    this.channelId = channelId;     // 第几个连上的
    this.socketId = socketId;       // 当前socket的标识
    this.allSocketIo = allSocketIo; //所有额socketIo的客户端链接
    this.redisClient = redisClient; //redis客户端
    this.mysqlPool = mysqlPool;     //mysql链接池
    // 当前的变量名称不能和类的名称相同
    let channel = new Channel(this.socket, this.channelId, this.socketId, this, this.allSocketIo, this.redisClient, this.mysqlPool);
    channel.init();
    this.channelSend = channel;
  }

  /**
   * 设置当前的用户信息  首先注册的都是游客组
   * @param user
   * @param callback
   * @returns {boolean}
   */
  setUser(user, callback) {
    let groupName = null;
    let data = this.roomStore.storeRoom(user.username, user.userId, user.id, groupName);
    //拿到处理后的值在加以储存 用了回调方法
    callback(data);
    if (!user.username || !user.userId) {
      return false;
    }
    let roomData = {};
    let is_flag = true, key = 0;
    //>>判断是否有游客登录的房间 到时候可以加个房间排序的字段在里面
    this.rooms.forEach((room, index) => {
      if (room.name === data.name) {
        key = index;
        is_flag = false;
        return is_flag;
      }
    });
    //如果当前是添加第一个用户或者是没有游客聊天室那么我们的就直接添加游客聊天室
    if (this.rooms.length === 0 || is_flag === true) {
      roomData.name = data.name;    // 房间的名称
      roomData.users = [];           // 房间的成员
      roomData.users.push(data.user); //  加入到游客组里面以供前端显示
      //存储当前的用户socketId
      this.storePublish(data.user);
      //  第一次的时候 刚刚上线注册的第一个用户
      this.rooms.push(roomData);
      //>>重新发送当前的分组信息和成员信息列表
      this.channelSend.refreshRoom();
      //将当前的用户加入到某个组里面
      this.channelSend.clientToGroup(data.user.socketId, data.name);
      return false;
    }
    if (is_flag === false) {
      //判断当前祖册的用户是否存在如果存在不做添加只改变socketId
      let is_user = true;
      this.rooms[key].users.forEach((userData) => {
        //存在改变socketID
        if (userData.userId === data.user.userId) {
          is_user = false;
          //如果socketId 变化那么当前用的socketId也需要变化
          userData.socketId = data.user.socketId;
          //存储当前的用户socketId
          this.storePublish(data.user);
          this.channelSend.clientToGroup(data.user.socketId, data.name);
          return is_user;
        }
      });
      //不存在代表是新用户
      if (is_user === true || this.rooms[key].users.length === 0) {
        //>>加入新用户
        this.rooms[key].users.push(data.user);
        //存储当前的用户socketId
        this.storePublish(data.user);
        //加入某个组这里特指的是游客组
        this.channelSend.clientToGroup(data.user.socketId, data.name);
      }
    }
    //socketId或者socketStream会被覆盖
  }


  /**
   * 管理员可以添加房间 删除某个成员
   * @param msg
   * @returns {boolean}
   * {avatar:"./static/img/lqc.jpg",isOnline:true,id:"QhctktzluenHF5abAAAN",userId:"lqc",username:"刘权昌",room:'data2畅聊组'}
   */
  addRooms(msg) {
    console.log('------------------------------------------addRoomsStart----------------------------------------------');
    console.log(msg);
    if (!this.underscore.has(msg, 'room')) {
      this.channelSend.listenTip(msg.id, {code: 0, status: 10001, info: '抱歉当前房间为空！'});
      return false;
    }
    let flag = true;
    let name = msg.room;
    this.rooms.forEach((room) => {
      //如果存在不添加 如果不存在就添加
      if (name === room.name) {
        flag = false;
        return flag;
      }
    });
    if (false === flag) {
      return flag
    }
    let roomData = {};
    roomData.name = name;
    roomData.users = [];
    /*   console.log(1111);
     console.log(roomData);*/
    this.rooms.push(roomData);
    /* console.log(this.underscore.findWhere(this.rooms,{name:msg.room}));*/
    //向所有的房间的在线用户广播
    this.channelSend.broadcastAll();
    //回调前端提示方法
    console.log(this.publishUser);
    this.channelSend.listenTip(msg.id ? msg.id : msg.socketId, {code: 1, status: 10000, info: '添加成功'});
    console.log('------------------------------------------addRoomsEND------------------------------------------------');
  }

  /**
   * 储存当前的房间
   * @param user
   * @returns {boolean}
   */
  storeUser(user) {
    let key = user.user.userId ? user.user.userId : user.user.socketId;
    let user_value = JSON.stringify(user.user);
    let flag = true, self = this;
    this.redisClient.get(key, function (error, response) {
      if (response) {
        flag = false;
        self.channelSend.listenTip(key, {code: 0, status: 10001, info: '抱歉此用户已经注册过！'});
        return flag;
      }
    });
    //如果有该用户那么就只接返回
    if (flag === false || !user.user.userId || !user.user.username) {
      self.channelSend.listenTip(key, {code: 0, status: 10001, info: '抱歉用户名或者Id为空！'});
      return false;
    }
    this.redisClient.set(key, user_value, function (error, response) {
      console.log(user.user.username + `已经注册！${response}!`);  //>>id必须是英文
      self.channelSend.listenTip(key, {code: 1, status: 10000, info: '恭喜您已经注册成功！'});
    });
  }

  /**
   * 存储当前的所有的在线的socket的id
   */
  storePublish(userInfo) {
    if (!userInfo) {
      return false;
    }
    //二选一
    this.publishUser[userInfo.userId] = userInfo.socketId ? userInfo.socketId : userInfo.id;
  }

  /**
   * 储存当前登录状态的脚本
   * @param userInfo
   * @param is_log
   * @returns {boolean}
   */
  isLoginDo(userInfo, is_log) {
    if (!userInfo) {return false;}
    this.isLogin[userInfo.userId] = is_log;
  }

  /**
   * 检查登录
   */
  CheckLogin(loginInfo) {

    let key = this.underscore.has(loginInfo, 'userId') ? loginInfo.userId : '';
    let key_soc = this.underscore.has(loginInfo, 'socketId') ? loginInfo.socketId : loginInfo.id;
    this.redisClient.get(key, (error, response) => {
      if (response === null) {
        this.channelSend.listenTip(key_soc, {code: 0, status: 10001, info: '抱歉用户不存在！'});
        return false;
      }
      //登录成功需要重新设置我们的socketId
      response = JSON.parse(response);
      //当前的socketId
      response.socketId = loginInfo.id;
      //是否上线主要是为控制头像的彩色与灰色下线就位灰色
      response.isOnline = true;
      //登录之后那么当前的登录状态是已登录状态
      let result = this.readFile.getFIleLIst('', loginInfo.userId);
      //得到当前的login用户得头像
      response = this.underscore.extend(response, result);
      //常客户端发送当前的跟新的信息带了avatar
      this.channelSend.sendUserToClient(response.socketId, response);
      response = JSON.stringify(response);
      //标识是否登录
      this.isLoginDo(loginInfo, true);
      console.log('--------------checkLogin-------------------');
      console.log(this.isLogin);
      //重新设置当前的redis存储的值
      this.reSet(key, response);
      //更新当前用的socketId防止客户端刷新
      this.updateRoomUserSocketId(loginInfo,true);
      //刷新页面需要再次绑定如
      this.bindRoom(loginInfo);
      //先刷新当前的客户点在线列表在进入当前聊天室
      let room = this.getRoomName(loginInfo);
      if (!room) {
        room = '游客聊天室';
      }
      this.channelSend.clientToGroup(key_soc,room);
      //对本房间里面的做推送 待优化可以写成链式调用
      this.channelSend.sendSameGroup(room, {'info': `你好啊${loginInfo.username}`});
      //需要刷新列表
      this.channelSend.broadcastAll();
      //提示
      this.channelSend.listenTip(key_soc, {code: 1, status: 10000, info: '登录成功即将进入聊天室！'});
    });
  }


  /**
   * 得到房间的民称
   */
  getRoomName(user) {
    let roomName = '';
    this.rooms.forEach((room) => {
      if (this.underscore.findWhere(room.users, {userId: user.userId})) {
        roomName = room.name;
        return false;
      }
    });
    return roomName;
  }

  /**
   * 可以自由的加入房间但是需要有的房间自己可加入任何的房间
   * {avatar:"./static/img/lqc.jpg",isOnline:true,newRoom:"游客聊天室",socketId:"QhctktzluenHF5abAAAN",userId:"lqc",username:"刘权昌",oldRoom:'dota2畅聊组'}
   */
  freeChangeRoom(msg) {
    console.log('------------------------------------------freeChangeRoomStart----------------------------------------------');
    console.log(msg);
    if ((!this.underscore.has(msg, 'oldRoom') || !this.underscore.has(msg, 'userId')) || (!this.underscore.has(msg, 'socketId') || !this.underscore.has(msg, 'newRoom'))) {
      this.channelSend.listenTip(msg.socketId, {code: 0, status: 10001, info: '抱歉请求缺乏参数！'});
      return false;
    }
    //>>1.1 讲当前的用户重当前的组删除
    let oldUsers = this.underscore.findWhere(this.rooms, {name: msg.oldRoom});
    //>>1.2 判断房间是否存在
    if (!oldUsers) {
      this.channelSend.listenTip(msg.socketId, {code: 0, status: 10001, info: '抱歉房间不存在或者已被删除！'});
      return false;
    }
    //>>1.3 取出当前的组的所有用户
    oldUsers = (oldUsers).users;
    //>>1.3.1 找到当前的oldRoom的index
    let oldRoomIndex = this.underscore.findIndex(this.rooms, {name: msg.oldRoom});
    //>>1.3.2 找到当前的新房间Index
    let newRoomIndex = this.underscore.findIndex(this.rooms, {name: msg.newRoom});
    //>>1.4 取出当前的用户
    let user = this.underscore.findWhere(oldUsers, {userId: msg.userId});
    //>>1.5 判断用户存在与否
    if (!user) {
      this.channelSend.listenTip(msg.socketId, {code: 0, status: 10001, info: '抱歉用户不存在'});
      return false;
    }
    //>>1.6 删除用户集合里面当前的换组的user
    let index = this.underscore.findIndex(oldUsers, {userId: msg.userId});
    delete  oldUsers[index];
    //去除当前 false值 在javascript中, false, null, 0, "", undefined 和 NaN 都是false值.
    oldUsers = this.underscore.compact(oldUsers);
    //>>1.7 重置users集合 es6 展开语法
    this.rooms[oldRoomIndex].users = [...oldUsers];
    //>>2.1 加入新的组
    this.rooms[newRoomIndex].users.push(user);
    //>>2.1.1 需要先离开当前加入的房间
    this.channelSend.clientLeaveGroup(msg.socketId ? msg.socketId : msg.id, msg.oldRoom);
    //>>3.1 更改socket.join(name)
    this.channelSend.clientToGroup(msg.socketId ? msg.socketId : msg.id, msg.newRoom);
    //>>4.1 刷新当前的列表数据 广播自己的组的成员
    this.channelSend.broadcastAll();
    //>>4.1.2向同组的人广播
    this.channelSend.sendSameGroup(msg.newRoom, {'info': `你好呀${msg.username}`});
    //>>5.1 异步回调
    this.channelSend.listenTip(msg.socketId ? msg.socketId : msg.id, {code: 1, status: 10000, info: '恭喜您换组成功！'});
    console.log('------------------------------------------freeChangeRoomStart----------------------------------------------');
  }

  /**
   * msg 删除房间json 不是太优化冗余代码太多
   * @param msg
   * {avatar:"./static/img/lqc.jpg",isOnline:true,socketId:"QhctktzluenHF5abAAAN",userId:"lqc",username:"刘权昌",delRoom:'data2畅聊组'}
   */
  delRoomChange(msg) {
    if (!this.underscore.has(msg, 'delRoom')) {
      this.channelSend.listenTip(msg.socketId ? msg.socketId : msg.id, {code: 0, status: 10001, info: '抱歉没有指定所要删除房间！'});
      return false;
    }
    let room = this.underscore.findWhere(this.rooms, {name: msg.delRoom});
    if (!room) {
      this.channelSend.listenTip(msg.socketId ? msg.socketId : msg.id, {code: 0, status: 10001, info: '抱歉当前删除的房间不存在！'});
      return false;
    }
    let users = room.users;
    let delIndex = this.underscore.findIndex(this.rooms, {name: msg.delRoom});
    let rooms = this.rooms;
    //判断当前的房间是否有人
    let size = this.underscore.size(users);
    if (size === 0) {
      delete rooms[delIndex];
      rooms = this.underscore.compact(rooms);
      this.rooms = [...rooms];
      //广播全部的用户
      this.channelSend.broadcastAll();
      this.channelSend.listenTip(msg.socketId ? msg.socketId : msg.id, {code: 1, status: 10000, info: '删除成功！'});
      return false;
    }
    let findIndex = this.underscore.findIndex(this.rooms, {name: '游客聊天室'});
    //得到当前的组的用户加入到匿名或者和游客聊天组
    users.forEach((user) => {
      //加入游客组
      this.rooms[findIndex].users.push(user);
      //在线的人加入的游客聊天是
      if (user.isOnline === true) {
        this.channelSend.clientToGroup(user.socketId ? user.socketId : user.id, '游客聊天室');
        //>>把当前组的用户移动到游客聊天组
        this.channelSend.clientLeaveGroup(user.socketId ? user.socketId : user.id, msg.delRoom)
      }
    });
    //删除当前的房间
    delete rooms[delIndex];
    rooms = this.underscore.compact(rooms);
    //重新设置当前的房间信息
    this.rooms = [...rooms];
    //删除组成员加入到游客聊天室
    this.channelSend.broadcastAll();
    // 在向游客广播
    this.channelSend.sendSameGroup('游客聊天室', {info: `有${size}人加入到我们游客组喔！大家欢迎！`})
    // 异步提示
    this.channelSend.listenTip(msg.socketId ? msg.socketId : msg.id, {code: 1, status: 10000, info: '删除成功！'});
  }

  /**
   * 登录成功需要更改当前的RoomsUsers里面user的socketId
   * @param user 提高效率可以增加组的名称以便减少检索次数
   * @param mark 显示的控制 迫不得已显显式的控制
   */
  updateRoomUserSocketId(user,mark) {
    console.log('-----------------------updateRoomUserSocketIdStart------------------------------------');
    console.log(user);
    console.log(this.isLogin); //刷新自动吧当前的客户登录状态设置成了false需要考证和查找流程错误
    let userId = user.userId, flag = true;
    //  继续储存当前的 socketId
    this.storePublish(user);
    //  房间设置
    this.rooms.forEach((room) => {
      room.users.forEach((singleUser) => {
        if (singleUser.userId === userId) {
          //>>更改原来的socketId
          singleUser.socketId = user.socketId ? user.socketId : user.id;
          console.log(this.underscore.has(this.isLogin, userId));
          singleUser.isOnline = this.underscore.has(this.isLogin, userId) ? mark : false;//登录成功就意味着上线成功
          console.log('------------------singleUser------------------');
          console.log(this.underscore.has(this.isLogin, userId) ? this.isLogin[userId] : false);
          console.log(singleUser);
          flag = false;
          return flag
        }
        //终止执行
        if (false === flag) {
          return flag;
        }
      });
    })
    console.log('-----------------------updateRoomUserSocketIdEnd------------------------------------');
  }

  /**
   * @param key     重新再redis里面修改键值对
   * @param value
   */
  reSet(key, value) {
    this.redisClient.set(key, value, (error, response) => {
      if (response) {
        console.log(`已重新设置:${response}`);
      }
    });
  }

  /**
   * 用户绑定自己的socket编号
   */
  getToSocket(name, callback) {
    //判断当前的传过来的那么是否在我们的标识集合里面
    let socketId = this.underscore.has(this.publishUser, name) ? this.publishUser[name] : name;
    //取出当前socketHash对应的socket链接对象
    if (typeof callback === 'function') {
      //在所有的链接的socket链接里面找出当前的socket链接
      callback(this.underscore.findWhere(this.allSocketIo.sockets.sockets, {id: socketId}));
      return false;
    }
    return this.underscore.findWhere(this.allSocketIo.sockets.sockets, {id: socketId});
  }

  /**
   * 如果客户端刷新那么就立即刷新当前的对应用户的socketId
   * @param userInfo
   */
  flushKey(userInfo) {
    console.log('------------------------------flushKeyStart---------------------------------------');
    console.log(this.isLogin);
    this.updateRoomUserSocketId(userInfo,true);
    let key = userInfo.userId;
    userInfo.isOnline = this.underscore.has(this.isLogin,key)?this.isLogin[key]:false;
    userInfo.socketId = userInfo.id;
    delete userInfo.id;
    this.bindRoom(userInfo);
    userInfo = JSON.stringify(userInfo);
    this.reSet(key, userInfo);
    //拿到当前的房间的名称
    /*let room  =this.getRoomName(userInfo);
     //当前的房间名称
     if(!room){room='游客聊天室';}*/
    //刷新是需要重新推送当前的房间成员信息到前端
    this.channelSend.broadcastAll();
    console.log('------------------------------flushKeyEnd---------------------------------------');
  }

  /**
   * 刷新的时候需要从新绑定喔到组里面应为当前的socket链接已经变化
   * @param userInfo
   */
  bindRoom(userInfo) {
    //forEach待优化
    let room_name = '';
    this.rooms.forEach((room) => {
      //跳过没有用户的组
      if (room.users.length === 0) {
        return true;
      }
      //重新将我们的socket链接加入当前的分组
      if (this.underscore.findWhere(room.users, {username: userInfo.username})) {
        room_name = room.name;
        return false;
      }
    });
    //>>回传用户防止前端刷新回转
    let result = this.readFile.getFIleLIst('', userInfo.userId);
    console.log('-----------------bindRoomStart------------------');
    userInfo = this.underscore.extend(userInfo, result);
    console.log(userInfo, userInfo.userId);
    console.log('-----------------bindRoomStart------------------');
    this.channelSend.sendUserToClient(userInfo.id ? userInfo.id : userInfo.socketId, userInfo);
    //重新加入分组
    this.channelSend.clientToGroup(userInfo.id ? userInfo.id : userInfo.socketId, room_name);
  }


  /**
   * 监听客户发来的消息的消息
   * @param         msg
   * 消息的格式{desSocketId:'socket hash value',desName:'刘权昌',desId:'lqc',content:' xxxxxxxxx',type:'text',sourceSocketId:'socket hash value',sourceName:'雅梅'，sourceId:'ym'} 后面加上图片流的传送
   * {desSocketId:'socket has value',desName:'刘权昌',desId:'lqc',content:'encoding msg',type:'img',sourceSocketId:'socket hash value',sourceName:'雅梅'，sourceId:'ym'},
   */
  listenClientMessage(msg) {
    let sourceSocketId = msg.sourceSocketId;
    if (!msg.desSocketId || !msg.desId || !msg.content) {
      //给予当前的socket链接提示信息 如果有人发小题那么我们可以提醒对方收到的消息前提是在对方在线的情况下
      this.channelSend.listenTip(sourceSocketId, {
        code: 0,
        status: 10001,
        info: '抱歉请检查 sourceSocketId sourceName 或sourceId'
      });
      return false;
    }
    //>>取到desName对应socketID
    if (!this.underscore.has(this.publishUser, msg.desId)) {
      this.channelSend.listenTip(sourceSocketId, {code: 0, status: 10001, info: '抱歉你选择的用户不存在！'});
      return false;
    }
    let avatar = this.readFile.getFIleLIst(msg.desId, msg.sourceId);
    msg = this.underscore.extend(msg, avatar);
    //发送私聊信息
    this.channelSend.sendToClientMessage(msg.desId, msg);
  }

  /**
   * 链接断开的时候需要退出当前的组。。和当前登录状态需要设置成为false
   * @param socketId
   * @returns {boolean}
   */
  disconnect(socketId) {
    console.log('------------------------------disconnectStart--------------------------------------------');
    if(this.underscore.size(this.publishUser)===0){return false;}
    //键值对的反转
    let publishCopy = this.underscore.invert(this.publishUser);
    console.log(socketId,this.publishUser,publishCopy);
    console.log('-----------cutOne-------------');
    let name = this.underscore.has(publishCopy, socketId) ? publishCopy[socketId] : false;
    console.log(name);
    if (name === false) {
      return name;
    }
    let room_name = '',user_result = '';
    this.rooms.forEach((room) => {
      let length = room.users.length;
      console.log( room.users);
      if (length === 0) {return false;}
      //查找到当前的用户需要重置里面登录状态
     /* console.log('---------------------------cutONE_LAST---------------------------------------');
      console.log(room.users);*/
      let result = this.underscore.findWhere(room.users, {userId: name});
      if (!result) {return false;}
      //找到当前组别的名称共享内存会污染改变脸
      user_result = result;
      room_name   = result ? room.name : '';
    });
    console.log('-----------------------cutTwo------------------------------------');
    console.log(user_result);
    console.log('---------------------------cutONE_TWO---------------------------------------');
    console.log(room_name);
    //判断当前的房间名称和当前的用户是否存在不存在则不作处理
    if (!room_name || !user_result) {
      return false
    }
    console.log(user_result.userId);
    // 当前登录状态设置为false
    //this.isLogin[user_result.userId] = !this.underscore.has(this.isLogin, user_result.userId)?false:false;
    //把当前的登录状态设置成false
    this.isLogin[user_result.userId] = false;
    console.log(this.isLogin,this.underscore.has(this.isLogin, user_result.userId));
    // 跟新当前的
    this.updateRoomUserSocketId(user_result,false);
    //>>下线必须离开当前的分组
    this.channelSend.clientLeaveGroup(socketId, room_name);
    //>>在内部刷新数据 需要穿组的名称
    this.channelSend.broadcastAll();
    //>>通知同组用户下线通知
    this.channelSend.sendSameGroup(room_name,{info:`${name}已经下线....`});
    console.log('------------------------------disconnectEnd--------------------------------------------');
  }

  /**
   * @param desId 发送消息的时候可以添加当前的avatar头像
   * @param sourceId
   * @param list
   * @returns {{displayPath: string}}
   */
  fileExists(desId, sourceId, list) {
    let dstPath = this.defaultAvatar;
    let sourcePath = this.defaultAvatar;
    list.forEach((item, index) => {
      let name = item.name;
      let splitName = name.split('.');
      let destination = this.underscore.indexOf(splitName, desId);
      let source = this.underscore.indexOf(splitName, sourceId);
      if (destination >= 0) {
        dstPath = this.readAvatarPath + name;
      }
      if (source >= 0) {
        sourcePath = this.readAvatarPath + name;
      }
    });
    return {displayPath: sourcePath};
  }

  /**
   *重新设置用户的avatar数据
   */
  restUsers() {
    console.log('---------------------------------restUsers---------------------');
    //有待改进 循环添加则不是做好的办法
    let list = this.readFile.getAvatarList();
    //给当所有用户添加头像 因为这里如果用户当前没有avatar那么上传的之后就可以在次刷新得到其他的客户端会立即看到用户上传了什么avatar
    this.rooms.forEach((room, roomIndex) => {
      let users = room.users;
      if (users.length === 0) {
        return false;
      }
      users.forEach((user, index) => {
        let avatar = this.defaultAvatar;
        let result = this.underscore.findWhere(list, {name: user.userId});
        if (result) {
          avatar = this.readAvatarPath + result.filename;
        }
        user.avatar = avatar;
      });
    });
    console.log(this.rooms);
    console.log('---------------------------------restUsers---------------------')
  }

  /**
   * 监听群聊信息
   * @param msg 客户端发送的群聊信息
   * 数据格式  {avatar:"./static/img/lqc.jpg",isOnline:true,socketId:"QhctktzluenHF5abAAAN",userId:"lqc",username:"刘权昌",content:'hello',destinationRoom:'data2畅聊组'}
   */
  listenGroupChatMsg(msg){
    let result       = this.underscore.has(msg,'destinationRoom');
    //>>1.1 判断是否有目标房间
    if(!result || !msg.destinationRoom){
      this.channelSend.listenTip(msg.socketId?msg.socketId:msg.id,{code:0,status:10001,info:'抱歉您没有选择任何的房间！'});
      return false;
    }
    //>>1.2 判断时是否有内容
    let contentResult= this.underscore.has(msg,'content');
    if(!contentResult || !msg.content){
      this.channelSend.listenTip(msg.socketId?msg.socketId:msg.id,{code:0,status:10001,info:'抱歉发送内容不能为空！'});
      return false;
    }
    //>>1.3 得到当前的用户所在的房间
    let room        = this.getRoomName(msg);
    //>>1.3.1 判断房间是否存在
    if(!room){this.channelSend.listenTip(msg.socketId?msg.socketId:msg.id,{code:0,status:10001,info:'抱歉房间不存在或者房间已被删除！'});return false;}
    //>>1.4 向同组所有成员推送该消息
    this.channelSend.groupChatMsgSend(room,msg);
    //>>1.5 通知客户端消息发送成功
    this.channelSend.listenTip(msg.socketId?msg.socketId:msg.id,{code:1,status:10000,info:'消息已经发出'});
  }
}
// 服务端需要使用当前的模块式导出
module.exports = context;
