import Vue from 'vue'
import Router from 'vue-router'
import App from '../App';

const login  =r => require.ensure([], () => r(require('pages/login/login'), 'login'));
const register=r => require.ensure([], () => r(require('pages/register/register'), 'register'));
const chat    =r => require.ensure([], () => r(require('pages/chat/chat'), 'chat'));

Vue.use(Router);
export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: App,
      children:[
        {path:'',name:'login',component:login},
        {path:'register',name:'register',component:register},
        {path:'chat',name:'chat',component:chat}
      ]
    }
  ]
})
