<template>
  <div class="page">
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
  .page {
    /*background-image: url("~@/assets/home-bg.jpg");*/
    /*background-size: cover;*/
    /*background-color: #3a8ee6;*/
  }
</style>
