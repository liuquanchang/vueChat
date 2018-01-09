// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

Vue.config.productionTip = false
import {get_client} from './store/interface'
import  store from './store/index';
import  trigger from './store/triggerEvents/triggerEvent';
import cache from './sokectIo-util/cacheKey';
import vueBus from 'vue-bus';
import axios from 'axios';
axios.defaults.headers['Content-Type'] = "application/x-www-form-urlencoded";
window.axios=axios;
Vue.use(vueBus);
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store: store,
  template: '<App/>',
  components: {App},
  created(){
    // 的到当前的client初始化对象 单例
    let _clientIo = get_client();
    //当有新连接时初始化当前的user
    _clientIo.init(this,trigger,cache);//初始化链接 interface init
    _clientIo.server_client.init_room_user((users) => {
      if (users.length === 0) {
        return false;
      }
      //异步调用直接actions
     /* this.$store.dispatch(trigger.set_users, users);*/
    }, (rooms) => {
      if (rooms.length === 0) {
        return false;
      }
      //异步调用直接actions
     /* this.$store.dispatch(trigger.set_rooms, rooms);*/
    });
  }
});
