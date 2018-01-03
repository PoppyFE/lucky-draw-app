<template>
  <div>
    <audio v-if="item.award_sound"
           class="success"
           controls="controls"
           :src="item.luckdrawAward.award_sound">
    </audio>
  </div>
</template>

<script>
  export default {
    name: 'luckdraw-page',

    beforeRouteEnter(to, from, next) {
      next((vm) => {
        vm.$store.dispatch('LOAD_LUCKDRAW');
      });
    },

    data() {
      return {
        // 速度表达的是移动 表示0个单位/秒 1表示 10个单位/秒
        moveSpeed: 0,
        moving: false,
      };
    },

    computed: {
      item() {
        return this.$store.state.luckdraw.item;
      },
    },

    created() {
    },

    methods: {
      startLuckdraw() {
      },
      stopLuckdraw() {
      },
    },
  };
</script>

<style scoped>
</style>
