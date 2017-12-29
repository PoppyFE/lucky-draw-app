<template>
  <div class="full-height">
    <router-link to="home" class="el-icon-caret-right">进入</router-link>
  </div>
</template>

<script>
  export default {
    name: 'home-page',
    methods: {
      open(link) {
        this.$electron.shell.openExternal(link);
      },
    },
  };
</script>

<style scoped>
  .full-height {
    background-image: url("~@/assets/home-bg.jpg");
    background-size: cover;
  }
</style>
