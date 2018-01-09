<template>
  <div class="createRoom">
    <br/>
    <br/>
    <input type="text" v-model="name" placeholder="请填写组名称"/>
    <br/>
    <br/>
    <button @click="addRoom">添加房间</button>
  </div>
</template>
<script type="text/ecmascript-6">
  import {  mapGetters  } from 'vuex';
  import { get_client } from 'storeEX/interface';
  import underscore from 'underscore';
  export default{
    data(){
      return {
        name: '',
        send_interface:get_client(),
      }
    },computed:{
      ...mapGetters({
        chatRooms: 'getter_rooms',    //需要当前的房间机成员信息
        itsMe: 'getter_user',         // 需要当前的用户 节省循环的开销
        socketHash: 'get_socketIoId', // 需要当前的socketId
      })
    }, methods: {
      addRoom(){
        if (name) {return false;}
        let roomDt    =   {room:this.name};
        let msg       =   underscore.extend(this.itsMe,roomDt);
        this.send_interface.roomCtx.addRoom(msg,function (msg) {
           console.log(msg);
        })
      }
    }

  }
</script>
<style type="stylus">
</style>
