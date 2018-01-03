<template>
  <div id="app">
    <el-tabs v-model="activePageName"
             style="padding-left: 5px"
             @tab-click="onTabItemClick">
      <el-tab-pane label="主页" name="home"></el-tab-pane>
      <el-tab-pane label="奖品" name="award"></el-tab-pane>
      <el-tab-pane label="司机" name="driver"></el-tab-pane>
      <el-tab-pane label="抽奖" name="luckdraw"></el-tab-pane>
      <el-tab-pane label="调试" name="debug"></el-tab-pane>
    </el-tabs>
    <transition name="slide-left" transition-mode="flip">
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </transition>
  </div>
</template>

<script>
  export default {
    name: 'lucky-draw-app',

    data() {
      return {
        activePageName: this.$route.name || 'home',
      };
    },

    methods: {
      onTabItemClick(tab) {
        if (!tab.name) return;

        this.$router.push(tab.name);
      },
    },
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
    font-family: 'Segoe UI', SegoeUI, 'Microsoft YaHei', 微软雅黑, "Helvetica Neue", Helvetica, Arial, sans;
  }

  html, body, #app {
    height: 100%;
  }

  #app {
    display: flex;
    flex-direction: column;
  }

  .page {
    flex-grow: 1;
    padding: 20px;
  }

  slide-left-enter {
    opacity: 0;
    transform: translate(30px, 0);
  }
  .slide-left-leave-active {
    opacity: 0;
    transform: translate(-30px, 0);
  }
</style>


