import userData from './user/userData';
import msgData from './msg/msgData';
import roomData from './room/roomData';
class indexData {
  constructor(store_options) {
    this.store_options = store_options;
    this.userData = new userData(this);
    this.msgData =  new msgData(this);
    this.roomData = new roomData(this);
    //对vue x 的设置
    this.init();
  }

  init() {
    this.userData.init();
    this.msgData.init();
    this.roomData.init();
  }

}

export default indexData;
