<template>
  <div class="chat_body">
    <join-room></join-room>
    <create-room></create-room>
    <div class="chat_bg_box ">
      <chat-list @talkTo="talkToMsg"></chat-list>
      <transition name="router-slid" mode="out-in">
        <talk v-show="viewShow" ></talk>
      </transition>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
  import {mapGetters} from 'vuex';
  import {get_client} from 'storeEX/interface';
  import chatList from './chatList';
  import talk from './talk';
  import  createRoom from './createRoom';
  import joinRoom from './joinRoom';
  export default{
    data(){
      return {
        viewShow: false,
        destinationUser:{},
        itsMe:{}
      }
    },
    computed: {
      ...mapGetters({
        rooms: 'getter_rooms',
        socketHash: 'get_socketIoId'
      }),

    },
    created(){

    },
    methods: {
      talkToMsg(mark,destinationUser,me){
        this.viewShow=mark;
        this.itsMe={...me};
        this.destinationUser={...destinationUser};
        if(false===this.viewShow){this.viewShow=true;}
      }
    }, components: {chatList, talk,createRoom,joinRoom}
  }
</script>
<style type="stylus" scoped>
  .chat_body {
    width: 100%;
    height: 100%;
    background: #FFF;
  }

  .chat_bg_box {
    width: 800px;
    height: 600px;
    border: 1px solid #d6d6d6;
    margin: 0 auto;
    margin-top: 100px !important;
  }

  .router-slid-enter-active, .router-slid-leave-active {
    transition: all .4s;
  }

  .router-slid-enter, .router-slid-leave-active {
    transform: translate3d(2rem, 0, 0);
    opacity: 0;
  }
</style>
