<template>
  <div class="join">
    <select v-model="room">
      <option value="">请选择加入的租</option>
      <option v-for="(room,roomIndex) in chatRooms" v-text="room.name"></option>
    </select>
    <br/>
    <br/>
    <button @click="joinRoom">join</button>
  </div>
</template>
<script type="text/ecmascript-6">
  import {  mapGetters  }  from 'vuex'
  import underscore from 'underscore';
  import {  get_client  } from 'storeEX/interface'
  export default{
    data(){
      return {
        room: '',
        send_interface:get_client(),
      }
    },
    computed:{
      ...mapGetters({
        chatRooms: 'getter_rooms',    //需要当前的房间机成员信息
        itsMe: 'getter_user',         // 需要当前的用户 节省循环的开销
        socketHash: 'get_socketIoId', // 需要当前的socketId
      })
    },
    methods:{
      joinRoom(){
          //  还是要循环后台没有传递当前的房间名称
          let findRoom    = JSON.parse(JSON.stringify(this.chatRooms));
          let oldFromRoom ='',userFind={};
          findRoom.forEach((room)=>{
              let   user  = underscore.findWhere(room.users,{userId:this.itsMe.userId});
              if(user){
                  oldFromRoom = room.name;userFind={...user};
                  return false;
              }
          });
          if(findRoom===this.roo){console.log(  `抱歉你已经在${this.room}`);return false;}
          let roomData        = {newRoom:this.room,oldRoom:oldFromRoom};
          let msg             = underscore.extend(userFind,roomData);
          //  异步回调
          this.send_interface.roomCtx.freeChangeRoom(msg,function (msg) {
            console.log(msg);
          })
      }
    },
    mounted(){

    }
  }
</script>
<style type="stylus">
</style>
