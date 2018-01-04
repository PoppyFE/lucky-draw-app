<template>
  <div class="page">
    <!--控制条-->
    <div class="crontrolbar">
      <span>背景音乐</span>
      <audio v-if="backgroundSound"
         autoplay
         loop
         controls
         :src="backgroundSound">
      </audio>

      <el-button round @click="enterFullScreen">全屏</el-button>
    </div>
    <div id="luckdrawStage" ref="luckdrawStage"
         :style="{'background-image': 'url('+backgroundImg+')'}">

      <award-card
        v-if="luckdrawAward"
        :award="luckdrawAward"
        :secret="luckdrawAwardSecret"
        @holdluckdraw="startLuckdraw"
        @releaseluckdraw="releaseLuckdraw"
        ></award-card>

      <driver-card v-for="driver in luckdrawDrives"
                   :driver="driver"></driver-card>
    </div>
  </div>
</template>

<script>
  /* eslint-disable */

  import AwardCard from '../award-card/index.vue'
  import DriverCard from '../driver-card/index.vue'

  export default {
    name: 'luckdraw-page',
    components: {
      AwardCard,
      DriverCard,
    },

    beforeRouteEnter(to, from, next) {
      next((vm) => {
        vm.$store.dispatch('LOAD_LUCKDRAW')
          .then((data)=>{
            vm.onEnterPage(data);
          })
          .catch(()=>{
          })
      });
    },

    beforeRouteLeave (to, from, next) {
      this.moveSpeed = 0;
      this.moving = false;
      this.backgroundImg = '';
      this.backgroundSound = '';
      this.luckdrawAward = null;
      this.luckdrawAwardSecret = true;
      this.luckdrawDrives = [];
      next();
    },

    data() {
      return {
        // 速度表达的是移动 表示0个单位/秒 1表示 10个单位/秒
        moveSpeed: 0,
        moving: false,
        backgroundImg: '',
        backgroundSound: '',
        luckdrawAward: null,
        luckdrawAwardSecret: true,
        luckdrawDrives: [],
      };
    },

    computed: {
    },

    methods: {
      onEnterPage(data) {
        const {luckdrawAward, luckdrawDrives} = data;

        this.moveSpeed = 0;
        this.moving = false;
        this.backgroundImg = luckdrawAward.award_img || '';
        this.backgroundSound = luckdrawAward.sound || '';
        this.luckdrawAward = luckdrawAward;
        this.luckdrawAwardSecret = true;
        this.luckdrawDrives = luckdrawDrives || [];
      },

      enterFullScreen(val) {
        const luckdrawStage = this.$refs.luckdrawStage;
        luckdrawStage.webkitRequestFullscreen();
      },

      startLuckdraw() {
      },

      releaseLuckdraw() {
      },
    },
  };
</script>

<style scoped>
  .page {
    padding: 0px;
    display: flex;
    flex-direction: column;
  }

  .crontrolbar {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  #luckdrawStage {
    width: 100%;
    height: 100%;
    padding: 150px;
    background-repeat: no-repeat;
    background-size: cover;
    flex-grow: 1;
    overflow: hidden;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-content: flex-start;
  }
</style>
