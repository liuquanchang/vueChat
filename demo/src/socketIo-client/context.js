import senMsg from './sendMsg';
let event_key = require('../sokectIo-util/util');
import  lockr from 'lockr';
class context {
  constructor(io, uri) {
    this.io = io;
    this.uri = uri;
    this.socket = null;
    this.sendMsgEvents = null;
    this.events_key = event_key;
    this.users = [];
    this.trigger = null;
    this.tipFunc = null;
    this.vueCtx = null;
    this.cacheKey = null;
    this.lockr=lockr;
  }

  /**
   * 初始化socket链接
   */
  init(vueCtx, trigger, cacheKey) {
    this.socket = this.io.connect(this.uri); //当前的socket的链接初始化一次除非当前的页面刷新
    this.vueCtx = vueCtx;
    this.trigger = trigger;
    this.cacheKey = cacheKey;
    this.sendMsgEvents = new senMsg(this); //初始化当前sendMsg的一些方法
  }

  /**
   * @param call_users
   * @param call_room
   */
  init_room_user(call_users, call_room,) {
    this.refreshUsers(call_users);  //on是一个异步事件
    this.refreshRoom(call_room);    //on是监听的异步事件
    this.listenTip(); //监听一个数据回调接口
    //>>内部监听当前的room极其成员的变化
    this.insideRefresh((roomData) => {
      this.vueCtx.$store.dispatch(this.trigger.set_rooms, roomData);
    });
    this.getSocketId((socketId) => {
      this.vueCtx.$store.dispatch(this.trigger.set_socketIoId,socketId);
      //刷新了当前的socketId后立即跟新当前的用户对应的socketId 异步刷新
      this.flushKey();
    });
    //>>接收后端的推送消息
    this.acceptSameNoticeMsg((msg) =>{
       this.vueCtx.$store.dispatch(this.trigger.set_notice_msg,msg);
    });
    //异步去改变当前的数据
    this.acceptServerMsg( (msg) =>{
      //像自己的消息库里面刷新当前的推送的消息
      this.vueCtx.$store.dispatch(this.trigger.set_messages,msg);
    });
    this.sendRefreshUser( (user)=> {
      this.vueCtx.$store.dispatch(this.trigger.set_user,user);
    });
    this.acceptGroupChatMsg((msg)=>{
      this.vueCtx.$store.dispatc(this.trigger.set_group_message,msg);
    });
  }

  /**
   * 发送消息
   */
  SendMsg(msg,callback) {
    //以方便后台异步提示  回调
    this.tipFunc=callback;
    this.sendMsgEvents.sendMessage(msg);
  }

  //>>注册当用户
  sendRegister(msg, callback) {
    //以方便后台异步提示  回调
    this.tipFunc = callback;
    this.sendMsgEvents.sendRegister(msg);
  }

  /**
   * 监听一个添加房间的事件
   */
  sendAddRoom(msg, callback) {
    //以方便后台异步提示  回调
    this.tipFunc=callback;
    this.sendMsgEvents.senAddRoom(msg)
  }

  /**
   * 监听一个删除房间的事件
   */

  sendDelRoom(msg,callback) {
    //以方便后台异步提示  回调
    this.tipFunc=callback;
    this.sendMsgEvents.sendDelRoom(msg);
  }

  /**
   * 监听一个refUsers自定义事件
   */
  refreshUsers(callback) {
    this.sendMsgEvents.refreshUsers(callback);
  }

  /**
   * 监听一个refreshRoom自定义事件
   */
  refreshRoom(callback) {
    this.sendMsgEvents.refreshRoom(callback);
  }

  /**
   * @param group 添加一个组别
   */
  addGroup(group) {
    this.sendMsgEvents.addGroup(group);
  }

  /**
   * @param talkGroup 把当前用户添加到那个组
   */
  addTalkGroup(talkGroup) {
    this.sendMsgEvents.addTalkGroup(talkGroup);
  }

  login(msg, callback) {
    //回调监听提示信息  监听数据的返回
    this.tipFunc = callback;
    this.sendMsgEvents.login(msg);
  }

  /**
   * 回调方法监听给予提示
   */
  listenTip() {
    this.sendMsgEvents.listenToMsg();
  }

  /**
   * 内部刷新时间因为很多时候改变用户状态的时候都需要刷新当前用户的状态去改变前端的显示
   */
  insideRefresh(callback) {
    this.sendMsgEvents.insideRefresh(callback);
  }

  getSocketId(callback){
    this.sendMsgEvents.getSocketId(callback);
  }

  /**
   * 初始化链接时就要看看当前
   */
  flushKey() {
    let userInfo = this.lockr.get(this.cacheKey.userInfo);
    if (!userInfo) {
      return false;
    }
    //主要是刷新当前的socketID
    userInfo    = JSON.parse(userInfo);
    //异步获取
    userInfo.id = this.vueCtx.$store.getters.get_socketIoId;
    this.flushServerKey(userInfo, (msg) => {
      console.log(msg);
      if (msg.status === 10001) {
        this.vueCtx.$router.push({path: '/'});
      }
    });
  }

  flushServerKey(msg ,callback){
    this.tipFunc =callback;
    this.sendMsgEvents.flushServerKey(msg)
  }

  /**
   * 接收服务端推送的消息给自己的消息
   * @param callback
   */
  acceptServerMsg(callback){
    this.sendMsgEvents.acceptServerMsg(callback)
  }

  sendRefreshUser(callback){
    this.sendMsgEvents.sendRefreshUser(callback)
  }

  freeChangeRoom(msg,callback){
    this.tipFunc=callback;
    this.sendMsgEvents.freeChangeRoom(msg);
  }

  acceptSameNoticeMsg(callback){
    this.sendMsgEvents.acceptSameNoticeMsg(callback);
  }

  /**
   * 监听
   * @param callback
   */
  acceptGroupChatMsg(callback){
    this.sendMsgEvents.acceptGroupChatMsg(callback);
  }

  /**
   * @param msg       当前的群聊消息
   * @param callback  当前的消息提示回调函数
   */
  sendGroupChatMsg(msg,callback){
    this.tipFunc=callback;
    this.sendMsgEvents.sendGroupChatMsg(msg);
  }
}
export  default context;
