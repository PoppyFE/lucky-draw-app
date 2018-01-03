<template>
  <div style="display: inline;padding-left: 10px;">
    <span>奖品编号:</span>
    <div class="warp"
         v-if="items && items.length > 0">
      <!--<img v-if="!!item" style="width: 80px;height: 80px" :src="item.img">-->
      <span style="padding-left: 5px;" v-for="item in items">{{item.serial_no}}</span>
    </div>
    <span v-else>无</span>
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
    flex-direction: row;
    align-items: center;
    padding: 2px;
  }
</style>
