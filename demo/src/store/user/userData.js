import {merge_data} from '../func'
import {REFRESH_USER, SET_USERS,GETTER_USERS,GET_SOCKET,SET_SOCKET,REFRESH_SOCKET,SET_USER,GETTER_USER,REFRESH_USER_SINGLE} from './user-config';
class userData {
  constructor(ctx) {
    this.ctx = ctx;
    this.actions = this.set_actions();
    this.mutations = this.set_mutations();
    this.state = this.set_state();
    this.getters = this.set_getters();
  }

  /**
   * 设置当前的mutations方法
   */
  set_mutations() {
    let mutations= {
      [REFRESH_USER](state, users){
        state.users = users
      },
      [REFRESH_SOCKET](state,socketId){
        state.socketId=socketId;
      },
      [REFRESH_USER_SINGLE](state,user){
        state.user={...user};
      }
    };
    return mutations;
  }

  /**
   * 设置当前数据集合
   */
  set_state() {
   let state= {
      users: [],
      socketId:'',
      user:{},
    };
   return state;
  }

  /**
   * 异步操作actions
   */
  set_actions() {
    let actions= {
     [SET_USERS]({commit},users){
          commit(REFRESH_USER,users);
      },
      [SET_SOCKET]({commit},socketId){
         commit(REFRESH_SOCKET,socketId);
      },
      [SET_USER]({commit},user){
       commit(REFRESH_USER_SINGLE,user);
      }
    };
    return actions;
  }

  /**
   * 取到当前的state 不过一个用当前的this.$store.state取到值就当学习一下getters的用法吧
   */
  set_getters() {
    let getters= {
      [GETTER_USERS](state){
        return state.users;
      },
      [GET_SOCKET](state){
        return state.socketId;
      },
      [GETTER_USER](state){
        return state.user;
      }
    };
    return getters;
  }

  /**
   * 初始化以上set_属性
   */
  init() {
    this.ctx.store_options.state = merge_data(this.ctx.store_options.state, this.state);
    this.ctx.store_options.actions = merge_data(this.ctx.store_options.actions, this.actions);
    this.ctx.store_options.getters = merge_data(this.ctx.store_options.getters, this.getters);
    this.ctx.store_options.mutations = merge_data(this.ctx.store_options.mutations, this.mutations);
  }
}
export default userData;
