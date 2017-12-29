<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'lucky-draw-app',
  };
</script>

<style>
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', SegoeUI, 'Microsoft YaHei', 微软雅黑, "Helvetica Neue", Helvetica, Arial, sans-serif;;
  }

  html, body, #app, #app>.el-container {
    height: 100%;
  }

  .full-height, .full-height > .full-height {
    height: 100%;
  }
</style>
