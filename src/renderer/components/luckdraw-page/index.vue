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
        :moveSpeed="moveSpeed"
        @holdluckdraw="startLuckdraw"
        @releaseluckdraw="releaseLuckdraw"
        ></award-card>

      <driver-card v-for="(driver, index) in luckdrawDrivers"
                   :key="driver.id"
                   :ref="'driver_' + index"
                   :driver="driver"></driver-card>
    </div>
  </div>
</template>

<script>
  /* eslint-disable */

  import AwardCard from '../award-card/index.vue';
  import DriverCard from '../driver-card/index.vue';

  export default {
    name: 'luckdraw-page',
    components: {
      AwardCard,
      DriverCard,
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
        luckdrawDrivers: [],
        luckdrawDriverIndex: 0,
        selectedDriver: null,
        holdLuckDrawBtn: false,
        holdLuckDrawBtnTime: 0,

        luckdrawing: false,
        timeStamp: 0,
        sectionMoveDistance:0,
      };
    },

    created() {
      const that = this;

      this.moveTween = new TWEEN.Tween(this);

      this.timestamp = new Date().getTime();

      // keep the ani
      function animate() {
        if (!this.moveTween) return;
        requestAnimationFrame(animate);
        TWEEN.update();

        const curTime = new Date().getTime();
        that.timestamp = curTime;
        this.render(delta);
      }
      animate = animate.bind(this);

      this.$store.dispatch('LOAD_LUCKDRAW')
        .then(({luckdrawAward, luckdrawDrives})=>{
          this.backgroundImg = luckdrawAward.award_img || '';
          this.backgroundSound = luckdrawAward.sound || '';
          this.luckdrawAward = luckdrawAward;
          this.luckdrawDrivers = luckdrawDrives || [];
          this.luckdrawDriverIndex = parseInt(Math.random() * this.luckdrawDrivers.length);
        })
        .catch((err) => {
        });

      this.stageKeyDownHandler = (function(evt) {
        if (evt.code !== 'Space') return;
        if (this.holdLuckDrawBtn) return;

        this.startLuckdraw();
//        console.log('stageKeyDownHandler');
      }).bind(this);

      this.stageKeyUpHandler = (function(evt) {
        if (evt.code !== 'Space') return;

        this.releaseLuckdraw();
//        console.log('stageKeyUpHandler');
      }).bind(this);

      window.document.addEventListener('keyup', this.stageKeyUpHandler);
      window.document.addEventListener('keydown', this.stageKeyDownHandler);
    },

    beforeDestroy() {
      if (this.moveTween) {
        this.moveTween.stop();
      }
      this.moveTween = null;

      if (this.stageKeyUpHandler) {
        window.document.removeEventListener('keyup', this.stageKeyUpHandler);
        this.stageKeyUpHandler = null;
      }

      if (this.stageKeyDownHandler) {
        window.document.removeEventListener('keydown', this.stageKeyDownHandler);
        this.stageKeyDownHandler = null;
      }

    },

    computed: {
    },

    methods: {
      enterFullScreen() {
        const luckdrawStage = this.$refs.luckdrawStage;
        luckdrawStage.webkitRequestFullscreen();
      },

      startLuckdraw() {
        this.holdLuckDrawBtnTimeStamp = new Date().getTime();
        this.holdLuckDrawBtn = true;
        this.luckdrawing = true;

        const tweenTime = 1;

        console.info(`抽奖按钮开始 动画时间 ${tweenTime.toFixed(2)} 秒`);

        this.moveTween
          .to({moveSpeed: 1}, tweenTime * 1000)
          .easing(TWEEN.Easing.Quartic.In)
          .start();
      },

      isValidHoldLuckDrawBtn() {
        // 1.5 秒 内放开无效
        return this.holdLuckDrawBtnTime > 1.5;
      },

      render(delta) {console.log('----')
        if (!this.luckdrawing) return;



        const moveDistance = this.moveSpeed * delta * 4;
        this.totalMoveDistance += moveDistance;
        if (this.totalMoveDistance < 1) {
          return;
        }

        const moveIndex = Math.round(this.totalMoveDistance);
        if (moveIndex < 1) return;

        this.totalMoveDistance = 0;
        console.log(`抽奖过程 moveIndex: ${moveIndex} delta:${delta.toFixed(2)}`);

        let curLuckdrawDriveIndex = this.luckdrawDriverIndex + moveIndex;
        const luckdrawDrivesCount = this.luckdrawDrivers.length;
        curLuckdrawDriveIndex = curLuckdrawDriveIndex % luckdrawDrivesCount;
        this.luckdrawDriverIndex = curLuckdrawDriveIndex;

        const targetDriver = this.$refs['driver_' + curLuckdrawDriveIndex];

        if (this.selectedDriver) {
          this.selectedDriver.setSelect(false);
        }

        this.selectedDriver = Array.isArray(targetDriver) ? targetDriver[0] : targetDriver;

        if (this.selectedDriver) {
//              this.selectedDriver.selected = true;
          this.selectedDriver.setSelect(true);
        }

        console.log(`抽奖过程 索引: ${curLuckdrawDriveIndex}`);

        if (this.moveSpeed < 0.00001) {
          // 这里认为过程结束
          console.info('抽奖完成当前目标是' + this.luckdrawDriverIndex);

          if (!this.isValidHoldLuckDrawBtn()) {
            console.log('抽奖时间过短不做为结果！')
          } else {
            console.log('抽奖时间过短做为结果！')
          }
        }
      },

      releaseLuckdraw() {
        this.moveTween.stop();
        this.holdLuckDrawBtn = false;
        this.holdLuckDrawBtnTime = (new Date().getTime() - this.holdLuckDrawBtnTimeStamp) * 0.001;

        let tweenTime = this.holdLuckDrawBtnTime * 2;
        if (tweenTime > 20) tweenTime = 20;

        console.info(`抽奖按钮释放 动画时间 ${tweenTime.toFixed(2)} 秒`);

        this.moveTween.to({moveSpeed: 0}, tweenTime * 2.2 * 1000)
          .easing(TWEEN.Easing.Quartic.Out)
          .onComplete(()=>{
            this.luckdrawing = false;
          })
          .start();

        console.log('按住释放时间：' + this.holdLuckDrawBtnTime + ' s');

        if (!this.isValidHoldLuckDrawBtn()) {
          this.$say.speak(`喂～老板    你要多按住我一会儿, 你到现在才按住我${this.holdLuckDrawBtnTime.toFixed(2)}秒`);
        }
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
