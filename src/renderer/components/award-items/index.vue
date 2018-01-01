<template>
  <div style="display: inline">
    <div class="warp"
         v-for="item in items">
      <img v-if="!!item" style="width: 80px;height: 80px" :src="item.img">
      <span v-if="!!item">{{item.name}}</span>
    </div>
  </div>
</template>

<script>

  export default {
    name: 'award-items',
    props: {
      items: Array,
    },
  };
</script>

<style scoped>
  .warp {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    padding: 2px;
  }
</style>
