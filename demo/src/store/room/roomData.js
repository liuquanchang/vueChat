import {merge_data} from '../func'
import {REFRESH_ROOM,SET_ROOMS,GETTER_ROOMS} from './room-config';
class roomData {
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
      [REFRESH_ROOM](state,rooms){
        state.rooms =rooms;
      }
    };
    return mutations;
  }

  /**
   * 设置当前数据集合
   */
  set_state() {
    let state= {
      rooms:[]
    };
    return state;
  }

  /**
   * 异步操作actions
   */
  set_actions() {
    let actions= {
      [SET_ROOMS]({commit},rooms){
         console.log(rooms);
         commit(REFRESH_ROOM,rooms)
      }
    };
    return actions;
  }

  /**
   * 取到当前的state 不过一个用当前的this.$store.state取到值就当学习一下getters的用法吧
   */
  set_getters() {
    let getters= {
      [GETTER_ROOMS](state){
        return state.rooms;
      }
    };
    return getters;
  }

  /**
   * 初始化以上set_属性
   */
  init() {
    this.ctx.store_options.state      =   merge_data(this.ctx.store_options.state,this.state);
    this.ctx.store_options.actions    =   merge_data(this.ctx.store_options.actions,this.actions);
    this.ctx.store_options.getters    =   merge_data(this.ctx.store_options.getters,this.getters);
    this.ctx.store_options.mutations  =   merge_data(this.ctx.store_options.mutations,this.mutations);
  }
}

export default roomData;
