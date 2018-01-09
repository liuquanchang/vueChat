import {merge_data} from '../func'
import {STORE_MSG, SET_MESSAGES, GETTER_MESSAGES,STORE_NOTICE_MSG,SET_NOTICE_MSG,GETTER_NOTICE_MSG,STORE_GROUP_MESSAGE,SET_GROUP_MESSAGE,GETTER_GROUP_MESSAGE} from './msg-config';
class msgData {

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
    let mutations = {
      [STORE_MSG](state, msg){
        state.messages.push(msg)
      },
      [STORE_NOTICE_MSG](state, msg){
        state.noticeMsg={...msg};
      },
      [STORE_GROUP_MESSAGE](state,msg){
        state.groupMsg.push(msg);
      }
    };
    return mutations;
  }
  /**
   * 设置当前数据集合
   */
  set_state() {
    let state = {
      messages: [],
      noticeMsg:{},
      groupMsg:[],
      };
    return state
  }

  /**
   * 异步操作actions
   */
  set_actions() {
    let actions = {
      [SET_MESSAGES]({commit}, msg){
        commit(STORE_MSG, msg);
      },
      [SET_NOTICE_MSG]({commit},msg){
        console.log(msg);
        commit(STORE_NOTICE_MSG,msg);
      },
      [SET_GROUP_MESSAGE]({commit},msg){
        commit(STORE_GROUP_MESSAGE,msg);
      }
    };
    return actions;
  }

  /**
   * 取到当前的state 不过一个用当前的this.$store.state取到值就当学习一下getters的用法吧
   */
  set_getters() {
    let getters = {
      [GETTER_MESSAGES](state){
        return state.messages;
      },
      [GETTER_NOTICE_MSG](state){
       return  state.noticeMsg;
      },
      [GETTER_GROUP_MESSAGE](state){
        return state.groupMsg;
      }
    };
    return getters;
  }

  init() {
    this.ctx.store_options.state = merge_data(this.ctx.store_options.state, this.state);
    this.ctx.store_options.actions = merge_data(this.ctx.store_options.actions, this.actions);
    this.ctx.store_options.getters = merge_data(this.ctx.store_options.getters, this.getters);
    this.ctx.store_options.mutations = merge_data(this.ctx.store_options.mutations, this.mutations);
  }
}
export default msgData;
