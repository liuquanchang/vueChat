<template>
  <div class="chat_right">
    <div class="c_right_title">
      <div class="c_rt_name">{{destination.username}}</div>
      <div class="c_rt_close"></div>
      <div class="c_rt_inf">相信明天。。相信自我</div>
    </div>

    <div class="c_right_cont">
      <div v-for="(message,messageIndex) in messagesMe" v-if="isChat(message.mapUser)"
           :class="{'c_r_list2':message.isMeSend,'c_r_list1':!message.isMeSend}">
        <div class="c_r_img"><img :src="message.displayPath" width="47" height="47"/></div>
        <div class="c_r_inf">
          <div class="cr_infl"></div>
          <div class="cr_infr" v-html="message.content"></div>
        </div>
      </div>
    </div>

    <div class="c_right_b">
      <div @click="sendImageUser" style="height: 14px;width: 100px;font-size:14px" >图片发送</div>
      <iframe frameborder="1" src="javascript:;" class="cr_inp" id="editor"></iframe>
      <!-- <textarea name="" cols="" rows="" ref="content" v-model="content" class="cr_inp" style="resize:none" ></textarea>-->
      <input name="" type="button" class="cr_but" value="发送" @click="sendContent"/>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
  const  IMG_WIDTH    = '75%';
  const  IMG_HEIGHT    = '50%';
  import {mapGetters} from 'vuex';
  import {get_client} from 'storeEX/interface';
  import trigger from '../../store/triggerEvents/triggerEvent';
  import underscore from 'underscore';
  import {imageHandler} from 'storeEX/imgeInterface'
  export default{
    data(){
      return {
        destination: {},
        source: {},
        content: '',
        send_interface: get_client(),
        imageHandle_interface: imageHandler(),
        editor: null,
      }
    },
    computed: {
      ...mapGetters({
        socketHash: 'get_socketIoId',
        messagesMe: 'getter_messages',
        itsMe: 'getter_user',
      }),
    },
    created(){
      this.$bus.on('destinationSend', this.get_destination);
    },
    methods: {
      get_destination(destinationUser, sourceUser){
        //点击还有问题需要修复
        this.destination = {...destinationUser};
        this.source = {...sourceUser};
      },
      sendContent(){
          console.log(this.itsMe);
        //{desSocketId:'socket has value',desName:'刘权昌',desId:'lqc',content:'encoding msg',type:'img',sourceSocketId:'socket hash value',sourceName:'雅梅'，sourceId:'ym'}
        let des = {};
        des.desSocketId = this.destination.socketId;
        des.desName = this.destination.username;
        des.desId = this.destination.userId;
        des.content = this.editor.contentWindow.document.body.innerHTML;
        des.sourceSocketId = this.socketHash;
        des.sourceName = this.source.username;
        des.sourceId = this.source.userId;
        des.isMeSend = false;
        des.type = 'text';
        des.mapUser = [this.destination.username, this.source.username];
        this.send_interface.msgCtx.sendMsg(des, function (data) {
          console.log(data);
        });
        des.isMeSend = true;
        //当前的logo就是那个什么
        des.displayPath=this.itsMe.displayPath;
        //添加自己发送的消息到消息队列里面
        this.$store.dispatch(trigger.set_messages, des);
        this.content = '';
        this.editor.contentWindow.document.body.innerHTML = '';
      },
      isChat(map){
        //标识当前的聊天记录。。。聊天记录后面可以加上
        let desName = this.destination.username;
        let souName = this.source.username;
        let result = false;
        if (underscore.indexOf(map, desName) >= 0 && underscore.indexOf(map, souName) >= 0) {
          result = true;
        }
        return result;
      }, sendImageUser(){
        let fileStream      =document.createElement('input');
        fileStream.type     ='file';
        fileStream.accept   ='image/*';
        fileStream.setAttribute('capture','camera');
        console.log(fileStream);
        //listen input file 标签的改变
        fileStream.addEventListener('change',(event)=>{
          let file          =fileStream.files[0];
          //链式调用
          this.imageHandle_interface.imageHandle.init(file).imgMessage((e) => {
            let ImageHtml = document.createElement('img');
            ImageHtml.src = e.target.result;
            ImageHtml.style.width = IMG_WIDTH;
            ImageHtml.style.height = IMG_HEIGHT;
            this.editor.contentWindow.focus();
            //执行插入命令 可以写富文本编辑器
            this.editor.contentWindow.document.execCommand('InsertHTML', false, ImageHtml.outerHTML);
            //让光标插入到后面
            this.editor.contentWindow.document.getSelection();
          });
        },false);
        //自动触发点击事件
        fileStream.click();

      }
    }, beforeDestroy(){
      //在页面销毁前删除当前的事件
      this.$bus.off('destinationSend', this.get_destination);
    }, mounted(){
      //应为在加载前那么现在的dom节点还没渲染 设置文档是够可以编辑designMode
      this.editor = document.getElementById("editor");
      this.editor.contentWindow.document.designMode = 'on';
    }
  }
</script>
<style type="stylus" scoped>
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
    height: 600px;
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
    overflow-y: scroll;
  }

  .chat_bg_box .chat_right .c_right_cont .c_r_list1 {
    width: 580px;
    height: auto;
    overflow: hidden;
    padding-top: 20px;
    padding-bottom: 20px;
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
    width: 580px;
    height: auto;
    overflow: hidden;
    padding-top: 20px;
    padding-bottom: 20px;
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
