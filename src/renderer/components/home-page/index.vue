<template>
  <div class="full-height">
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
    background-image: url("@~/assets/home-home-bg.jpg");
  }
</style>
