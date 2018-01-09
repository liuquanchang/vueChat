<template>
  <div class="hello">
    <input v-model="login_name" type="text">
    <br/> <br/><br/> <br/>
    <button @click="login">登录</button>
    <br/> <br/><br/> <br/>
    <input v-model="name" type="text">
    <br/> <br/><br/> <br/>
    <button @click="register">注册用户</button>
    <br/> <br/><br/> <br/>
    <input v-model="groupName" type="text">
    <br/> <br/><br/> <br/>
    <button @click="addGroup">添加分组</button>
    <br/> <br/><br/> <br/>
    <select v-model.trim="select_room">
      <option value="" disabled>请选择</option>
      <option value="游客聊天室">游客聊天室</option>
      <option value="dota2畅聊">dota2畅聊</option>
    </select>
    <br/> <br/><br/> <br/>
    <button @click="addTalkGroup">加入已选组</button>
  </div>
</template>

<script>
  import { get_client } from '../store/interface';
  export default {
    name: 'hello',
    data () {
      return {
        name: '',
        send_interface:get_client(),
        groupName:'',
        select_room:'',
        login_name:'',
      }
    },
    methods:{
        register(){

          this.send_interface.userCtx.sendRegister('myLittleDarling','彭雅梅',function (msg) {
             // 异步监听回调函数给予tip提示
            console.log(msg)
          })
        },
        addGroup(){
            this.send_interface.roomCtx.addGroup({id:'dota2',name:'dota2畅聊'})
        },
       addTalkGroup(){
            this.send_interface.roomCtx.addTalkGroup({name:this.select_room});
       },
       login(){

       }
    },
    created(){

    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  h1, h2 {
    font-weight: normal;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    display: inline-block;
    margin: 0 10px;
  }

  a {
    color: #42b983;
  }
</style>
