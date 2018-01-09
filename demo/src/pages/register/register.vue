<template>
  <div class="login_box">
    <div class="login_">
      <div class="l_title">注 册</div>
      <input name="" type="text" class="l_inp" v-model="Info.userId" placeholder="请输入账户Id必须是英文!"/>
      <input name="" type="text" class="l_inp" v-model="Info.username" placeholder="请输入你的昵称！" />
      <button class="l_but" @click="registerUser">注 册</button>
      <div class="l_link">
      <router-link :to="{path:'/'}" tag="a">
        返回登录
      </router-link>
      </div>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
  import { get_client } from "storeEX/interface"
  import {mapGetters} from 'vuex';
  import lockr from 'lockr';
  import cacheKet from '../../sokectIo-util/cacheKey';
  export default{
      name:'login',
      data(){
          return {
              Info:{userId:'',username:''},
              send_interface:get_client(),
          }
      },
      computed:{
        ...mapGetters({
            socketHash:'get_socketIoId'
        })
      },
      methods:{
        registerUser(){
            let data       = JSON.parse(JSON.stringify(this.Info));
            data.id        = this.socketHash;
            this.send_interface.userCtx.sendRegister(data,(dataMsg)=>{
                console.log(dataMsg);
                if(dataMsg.status===10000){
                    lockr.set(cacheKet.userInfo,JSON.stringify({username:data.username,userId:data.userId})); //只存存储当前的用户名称
                    this.$router.push({path:'/',query:{username:data.username,userId:data.userId}})
                }
            });
        }
      },created(){
          this.$bus.on('hello_boy',function (msd) {

            console.log(msd);
          })
    }
  }
</script>
<style type="stylus" scoped>
  body{margin:0 auto; background:#3faefb;}
  .bg_box{width:100%; height:100%; background:#3faefb; overflow:hidden; margin:0 auto;}
  .login_box{width:570px; height:430px; background:url(./l_bg.png)repeat;border:1px solid #fff; margin:0 auto; border-radius:10px; margin-top:15%;}
  .login_box .login_{width:550px; height:410px; background:#fff; margin:10px; border-radius:10px;}
  .login_box .login_ .l_title{width:550px; height:80px; line-height:80px; font-family:"微软雅黑"; font-size:24px; text-align:center; color:#434343; padding-top:30px; margin-bottom:10px;}
  .login_box .login_ .l_inp{width:400px; height:40px; border:1px solid #e3e3e3; margin-left:75px; margin-top:10px; border-radius:8px; font-size:16px; font-family:"微软雅黑"; line-height:40px; text-indent:10px; color:#797979; margin-bottom:10px;}
  .login_box .login_ .l_but{width:400px; height:40px; line-height:40px; background:#3faefb; color:#fff; margin-left:75px; margin-top:40px; border-radius:8px; font-size:16px; font-family:"微软雅黑"; line-height:40px; text-align:center; border:0px;}
  .l_link{width:400px; height:30px; line-height:30px; text-align:right; font-size:16px; margin-left:75px; color:#797979; font-family :"微软雅黑"; margin-top:10px; }
  .l_link a{color:#797979; text-decoration:none; }
  .l_link a:hover{color:#3faefb;}
</style>
