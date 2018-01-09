import Vue from 'vue';
import Vuex from 'vuex';
import {clientDtIo} from './intserfaceData';
Vue.use(Vuex);
//当前的vuex的片配置
let store_options = {
  state: {},
  mutations: {},
  actions: {},
  getters: {}
};
clientDtIo(store_options);
const store     =new Vuex.Store(store_options);
export default  store ;
