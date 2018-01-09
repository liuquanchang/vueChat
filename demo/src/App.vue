<template>
  <div id="app">
    <transition name="router-slid" mode="out-in">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'app',
  created(){
      //注意：$bus.on $bus.once $bus.off $bus.emit 只是 $bus.$on $bus.$once $bus.$off $bus.$emit 的别名。
  }
}
</script>

<style>
.router-slid-enter-active, .router-slid-leave-active {
  transition: all .4s;
}

.router-slid-enter, .router-slid-leave-active {
  transform: translate3d(2rem, 0, 0);
  opacity: 0;
}
</style>
