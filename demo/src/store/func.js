import * as  lodash from 'lodash';
//合并函数
const merge_data= (old,fresh)=>{
    return  lodash.merge(old,fresh)
};
export {merge_data};
