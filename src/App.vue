<template>
<div id="app">
<ecodiag-page>
</ecodiag-page>
</div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
// import { devices } from '@/devices'
// import { device_utils } from '@/device_utils'

export default {
  name: 'App',
  components: {
    'ecodiag-page': () => import('@/components/ecodiag.vue')
  }
}
</script>

<style>
@import "./assets/css/icons.css";
#app {
  /* font-family: Avenir, Helvetica, Arial, sans-serif; */
  /* -webkit-font-smoothing: antialiased; */
  /* -moz-osx-font-smoothing: grayscale; */
  /* text-align: center; */
  /* color: #2c3e50; */
  /* margin-top: 60px; */
}
</style>
