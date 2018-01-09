<template>
  <div class="chat_left">
    <div class="chat_name_list">
      <!-----vue 如果真的想今天的加载静态的图必须放到当前的更目录下面./static---->
      <div class="chat_img" @click="avatar"><img :src="itsMe.displayPath"  :aa="itsMe.displayPath" width="47" height="47" /></div>
      <div class="chat_inf">{{itsMe.username}}</div>
    </div>

    <div class="chat_list" v-for="(room,room_index) in chatRooms">
      <div class="chat_l_title">
        <span><img src="./bottom_.png" width="14" height="8"/></span>
        <div class="l_title">{{room.name}}</div>
      </div>

      <div class="chat_l_list" v-for="(user,user_index) in room.users" @click="sendTo(user)">
        <div class="chat_name_list chat_hover">
          <div class="chat_img"><img :src="user.avatar" width="47" height="47" :hello="user.socketId" :class="{'desaturate':!user.isOnline?true:false}" /></div>
          <div class="chat_inf">{{user.username}}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
  const UPLOAD_DIR  ='./static/img/';
  import lockr from 'lockr';
  import trigger from '../../store/triggerEvents/triggerEvent';
  import {get_client} from 'storeEX/interface';
  import {mapGetters} from 'vuex';
  import underscore from 'underscore';
  import cacheKey from '../../sokectIo-util/cacheKey'
  import http from 'storeEX/http';
  import $ from 'jquery';
  export default{
    data(){
      return {
        send_interface: get_client(),
        bridge: {},
        avatar_img: require('./图层-3.png'),
      }
    },
    computed: {
      ...mapGetters({
        chatRooms: 'getter_rooms',
        socketHash: 'get_socketIoId',
        itsMe: 'getter_user',
      }),
    }, methods: {
      sendTo(destinationUser){
        let mark = destinationUser.username === this.bridge.username ? true : false;
        this.$emit('talkTo', mark, destinationUser, this.itsMe);
        this.bridge = {...destinationUser};
        this.$bus.emit('destinationSend', destinationUser, this.itsMe);
      }, avatar(){
        //动态添加
        let avatar = document.createElement('input');
        avatar.type = 'file';
        //自动点击改按钮
        avatar.click();
        //添加一个按钮发生改变的时间
        avatar.addEventListener('change', (event) => {
          let fileStream = avatar.files[0];
          //获得文件stream
          let formStream = new FormData();
          formStream.append('avatar', fileStream);
          formStream.append('userId', this.itsMe.userId);
          //上传头像到node js; 因为上传图片的时候我们用post 上传我们拿不到body里面的数据所以选择了拼接参数的办法
          this.apiPost('http://192.168.0.178:9501/upload?userId=' + this.itsMe.userId, formStream).then((response) => {

            //动态显示当前的图片
            this.itsMe.displayPath    = UPLOAD_DIR+response.data.filename+`?xxx=`+Math.random();

            //在广播一次
            this.send_interface.userCtx.handleFlushKey();
            //跟新列表中的数据
            this.changeUserLIstAvatar();
            //跟新消息中的用户avatar数据
            this.changeMessageAvatar();
          }).catch((response) => {
            console.log(response)
          });
        })
      }, async avatarUpload(data, callback){
        let headers = new Headers();
        //设置当前的post请求
        //直接使用fetchApi发送
        let uploadResult = await fetch('http://127.0.0.1:9501/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          mode: 'cors',
          credentials: 'include',
          body: data
        });
        let dataResult = await uploadResult;
        callback(dataResult);

      }, changeUserLIstAvatar(){
          //在这里不需要操作vue x愿意的话当前的itsMe会保证状态刷新服务端口找到当前avatar
          //console.log(this.itsMe);
          //更改当前的聊天列表的头像
          this.chatRooms.forEach((room)=>{

          })
      },changeMessageAvatar(){
         /* console.log(1111)*/
      },JqSelector(){
        $('.chat_left').on('click','.chat_l_title',function () {
              $(this).siblings('.chat_l_list').toggle();
        })
      }
    }, mixins: [http],
    mounted(){
         this.JqSelector();
    },watch:{
      itsMe:function (value,old) {
          //console.log(value);
      },
      chatRooms:function (value,old) {
            this.JqSelector();
      }
    }
  }
</script>
<style type="stylus" scoped>
  .desaturate {
    -webkit-filter: grayscale(100%);
    -moz-filter: grayscale(100%);
    -ms-filter: grayscale(100%);
    -o-filter: grayscale(100%);
    filter: grayscale(100%);
    filter: gray;
  }


  .chat_bg_box .chat_left {
    width: 200px;
    height: 582px;
    background: #3faefb;
    padding-top: 18px;
    float: left;
  }

  .chat_bg_box .chat_left .chat_list_b {
    width: 200px;
    height: auto;
    overflow: hidden;
  }

  .chat_bg_box .chat_left .chat_list_b .chat_title {
    width: 200px;
    height: 34px;
    margin-top: 8px;
  }

  .chat_name_list {
    width: 200px;
    height: 60px;
    margin-bottom: 10px;
    cursor: pointer;
  }

  .chat_name_list .chat_img {
    width: 48px;
    height: 48px;
    margin-left: 24px;
    float: left;
  }

  .chat_name_list .chat_img img {
    width: 48px;
    height: 48px;
    border-radius: 24px;
    border: 1px solid #e3e3e3;
    margin-top: 6px;
  }

  .chat_name_list .chat_inf {
    width: 120px;
    height: 60px;
    line-height: 60px;
    color: #fff;
    font-family: "微软雅黑";
    font-size: 16px;
    text-indent: 14px;
    float: left;
  }

  .chat_name_list.chat_hover {
    background: #b5e2f9;
  }

  .chat_list {
    width: 200px;
    height: auto;
    overflow: hidden;
    min-height: 36px;
  }

  .chat_list .chat_l_title {
    width: 200px;
    height: 36px;
    cursor: pointer;
  }

  .chat_list .chat_l_title span {
    width: 8px;
    height: 14px;
    float: left;
    margin-left: 15px;
    margin-top: 11px;
    margin-right: 15px;
  }

  .chat_list .chat_l_title .l_title {
    width: 160px;
    height: 36px;
    float: left;
    line-height: 36px;
    color: #fff;
    font-family: "微软雅黑";
    font-size: 16px;
  }

  .chat_list .chat_l_list {
    width: 200px;
    height: auto;
    overflow: hidden;
  }

  .chat_bg_box .chat_right {
    width: 600px;
    height: 600 p;
    float: left;
  }

  .chat_bg_box .chat_right .c_right_title {
    width: 600px;
    height: 108px;
    background: url(./c_t_bg.jpg) no-repeat;
  }

  .chat_bg_box .chat_right .c_right_title .c_rt_name {
    width: 560px;
    height: 34px;
    line-height: 34px;
    color: #fff;
    font-size: 24px;
    font-family: "微软雅黑";
    float: left;
    text-indent: 40px;
    margin-top: 22px;
  }

  .chat_bg_box .chat_right .c_right_title .c_rt_close {
    width: 22px;
    height: 22px;
    background: url(./close_.png) no-repeat;
    float: left;
    margin-top: 20px;
    cursor: pointer;
  }

  .chat_bg_box .chat_right .c_right_title .c_rt_inf {
    width: 600px;
    height: 30px;
    line-height: 30px;
    text-indent: 40px;
    color: #fff;
    font-size: 16px;
    font-family: "微软雅黑";
  }

  .chat_bg_box .chat_right .c_right_cont {
    width: 600px;
    height: 385px;
  }

  .chat_bg_box .chat_right .c_right_cont .c_r_list1 {
    width: 600px;
    height: auto;
    overflow: hidden;
    padding-top: 40px;
  }

  .chat_bg_box .chat_right .c_right_cont .c_r_list1 .c_r_img {
    width: 48px;
    height: 48px;
    margin-left: 24px;
    float: left;
  }

  .chat_bg_box .chat_right .c_right_cont .c_r_list1 .c_r_img img {
    width: 47px;
    height: 47px;
    border-radius: 24px;
    border: 1px solid #e3e3e3;
  }

  .chat_bg_box .chat_right .c_right_cont .c_r_list1 .c_r_inf {
    width: 290px;
    height: auto;
    overflow: hidden;
    margin-left: 16px;
    float: left;
  }

  .chat_bg_box .chat_right .c_right_cont .c_r_list1 .c_r_inf .cr_infl {
    width: 10px;
    height: 10px;
    background: url(./cat_l.png) no-repeat;
    float: left;
    margin-top: 10px;
    float: left;
  }

  .chat_bg_box .chat_right .c_right_cont .c_r_list1 .c_r_inf .cr_infr {
    width: 260px;
    height: auto;
    padding-left: 10px;
    padding-right: 10px;
    background: #efefef;
    min-height: 26px;
    line-height: 20px;
    padding-top: 10px;
    color: #fff;
    font-size: 14px;
    font-family: "微软雅黑";
    float: left;
    color: #acacac;
    border-radius: 8px;
    padding-bottom: 10px;
  }

  .chat_bg_box .chat_right .c_right_cont .c_r_list2 {
    width: 600px;
    height: auto;
    overflow: hidden;
    padding-top: 40px;
  }

  .chat_bg_box .chat_right .c_right_cont .c_r_list2 .c_r_img {
    width: 48px;
    height: 48px;
    margin-right: 24px;
    float: right;
  }

  .chat_bg_box .chat_right .c_right_cont .c_r_list2 .c_r_img img {
    width: 47px;
    height: 47px;
    border-radius: 24px;
    border: 1px solid #e3e3e3;
  }

  .chat_bg_box .chat_right .c_right_cont .c_r_list2 .c_r_inf {
    width: 290px;
    height: auto;
    overflow: hidden;
    margin-right: 16px;
    float: right;
  }

  .chat_bg_box .chat_right .c_right_cont .c_r_list2 .c_r_inf .cr_infl {
    width: 10px;
    height: 10px;
    background: url(./cat_r.png) no-repeat;
    margin-top: 10px;
    float: right;
  }

  .chat_bg_box .chat_right .c_right_cont .c_r_list2 .c_r_inf .cr_infr {
    width: 260px;
    height: auto;
    padding-left: 10px;
    padding-right: 10px;
    background: #efefef;
    min-height: 26px;
    line-height: 20px;
    padding-top: 10px;
    color: #fff;
    font-size: 14px;
    font-family: "微软雅黑";
    float: right;
    color: #acacac;
    border-radius: 8px;
    padding-bottom: 10px;
  }

  .chat_bg_box .chat_right .c_right_b {
    width: 600px;
    height: 107px;
    background: #f6f6f6;
  }

  .chat_bg_box .chat_right .c_right_b .cr_inp {
    width: 450px;
    height: 52px;
    margin: 18px;
    border: 1px solid #e5e5e5;
    background: #fff;
    border-radius: 8px;
    font-size: 14px;
    font-family: "微软雅黑";
    line-height: 20px;
    padding: 8px;
    float: left;
  }

  .chat_bg_box .chat_right .c_right_b .cr_but {
    width: 70px;
    height: 26px;
    border-radius: 8px;
    text-align: center;
    font-family: "微软雅黑";
    line-height: 26px;
    background: #3faefb;
    color: #fff;
    font-size: 14px;
    border: 0px;
    float: left;
    margin-top: 37px;
  }
</style>
