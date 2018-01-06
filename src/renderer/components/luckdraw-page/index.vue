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
      <audio v-if="awardSound"
             ref="awardSound"
             :src="awardSound">
      </audio>
      <audio v-if="driverSound"
             ref="driverSound"
             :src="driverSound">
      </audio>
      <el-button round @click="enterFullScreen">全屏</el-button>
    </div>
    <div id="luckdrawStage" ref="luckdrawStage"
         :style="{'background-image': 'url('+backgroundImg+')'}">
      <p class="award-count">{{'奖品剩余:' + (totalAwardsCount - totalSelectedAwardsCount)}}</p>
      <p class="driver-count">{{'司机剩余:' + (totalDriversCount - totalSelectedDriversCount)}}</p>
      <el-button class="next-luckdraw"
                 :loading="isDataLoading"
                 @click="nextLuckDrawClickHanler"
                 round>下一组抽奖</el-button>
      <div class="center-point">

        <driver-card v-for="(driver, index) in luckdrawDrivers"
                     :key="'driver_'+index"
                     :index="index"
                     :count="luckdrawDrivers.length"
                     :randomSeed="randomSeed"
                     :ref="'driver_' + index"
                     :driver="driver"></driver-card>

        <award-card
          v-if="luckdrawAward"
          :award="luckdrawAward"
          :secret="!isCompleteLuckdraw"
          :moveSpeed="moveAcceleration"
          :round="totalSelectedAwardsCount"
          @holdluckdraw="startLuckdraw"
          @releaseluckdraw="releaseLuckdraw"
        ></award-card>

      </div>
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
        moveAcceleration: 0,

        backgroundImg: '',
        backgroundSound: '',

        awardSound: '',
        driverSound: '',

        luckdrawAward: null,
        luckdrawDrivers: [],

        holdLuckDrawBtn: false,
        holdLuckDrawBtnTime: 0,

        totalAwardsCount: 0,
        totalDriversCount: 0,
        totalSelectedAwardsCount: 0,
        totalSelectedDriversCount: 0,

        isDataLoading: false,

        isCompleteLuckdraw: false,

        randomSeed: 0,
      };
    },

    created() {
      const that = this;

      // 加速度表示速度的变化程度范围0-1
      this.moveAcceleration = 0;
      this.backgroundImg = process.env.NODE_ENV === 'development' ?
        'file:///Users/alex/Projects/lucky-draw-app/static/luckdraw_bg.jpg' : '';

      this.moveTween = new TWEEN.Tween(this);
      this.timestamp = new Date().getTime();
      this.luckdrawDriverIndex = 0;
      this.sectionMoveDistance = 0;
      this.selectedDriver = null;

      // keep the ani
      function animate() {
        requestAnimationFrame(animate);
        TWEEN.update();
        const curTime = new Date().getTime();
        that.render((curTime - that.timestamp) * 0.001);
        that.timestamp = curTime;
      }
      animate();

      this.stageKeyDownHandler = (function(evt) {
        evt.preventDefault();
        evt.stopImmediatePropagation();
        if (evt.code !== 'Space') return;
        if (this.holdLuckDrawBtn) return;

        console.log('stageKeyDown');

        this.startLuckdraw();
//        console.log('stageKeyDownHandler');
      }).bind(this);

      this.stageKeyUpHandler = (function(evt) {
        evt.preventDefault();
        evt.stopImmediatePropagation();
        if (evt.code !== 'Space') return;

        console.log('stageKeyUp');

        this.releaseLuckdraw();
      }).bind(this);

      window.document.addEventListener('keyup', this.stageKeyUpHandler, true);
      window.document.addEventListener('keydown', this.stageKeyDownHandler, true);
    },

    beforeDestroy() {
      if (this.moveTween) {
        this.moveTween.stop();
      }

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

      nextLuckDrawClickHanler() {
//        if (this.moveSpeed > 0.0002) return;
        if (this.isDataLoading) return;

        this.isDataLoading = true;
        this.luckdrawDrivers = [];
        this.$store.dispatch('LOAD_LUCKDRAW')
          .then((results)=>{
            const {luckdrawAward,
              totalAwardsCount,
              totalDriversCount,
              totalSelectedAwardsCount,
              totalSelectedDriversCount} = results;

            this.backgroundImg = (luckdrawAward && luckdrawAward.award_img) || this.backgroundImg || '';
            this.totalAwardsCount = totalAwardsCount;
            this.totalDriversCount = totalDriversCount;
            this.totalSelectedAwardsCount = totalSelectedAwardsCount;
            this.totalSelectedDriversCount = totalSelectedDriversCount;
            this.isCompleteLuckdraw = false;
            this.randomSeed = Math.random();

            //显示背景 0.8 s 后播放音乐
            return new Promise((resolve)=> {
              setTimeout(()=>{
                resolve(results);
              }, 800);
            });
          })
          .then((results) => {
            const {luckdrawAward} = results;
            this.backgroundSound = (luckdrawAward && luckdrawAward.sound) || this.backgroundSound || '';

            //播放音乐 0.6s 后 开始展示内容
            return new Promise((resolve)=> {
              setTimeout(()=>{
                resolve(results);
              }, 600)
            });
          })
          .then((results)=>{
            const {luckdrawAward, luckdrawDrives} = results;

            // 10s 数据保护
            setTimeout(()=>{
              this.isDataLoading = false;
            }, 5000);

            this.luckdrawAward = luckdrawAward;
            this.luckdrawDrivers = luckdrawDrives || [];

            this.x = 0;
            this.y = 0;
            this.r = 0;
            this.luckdrawDriverIndex = parseInt(Math.random() * this.luckdrawDrivers.length);
          })
          .catch((err) => {
            this.isDataLoading = false;
            if (err && err.hasOwnProperty('error') && err.error && err.hasOwnProperty('errorMsg')) {
              this.$alert(err.errorMsg);
              return;
            }

            this.$alert('请联系客服 15000273963', '出错了哦');
          });

      },

      startLuckdraw() {
        if (this.isDataLoading) return;
        if (this.isCompleteLuckdraw) return;

        this.holdLuckDrawBtnTimeStamp = new Date().getTime();
        this.holdLuckDrawBtn = true;

        const tweenTime = 1;

        this.moveAcceleration = Math.abs(this.moveAcceleration);
        this.moveTween
          .to({moveAcceleration: 1}, tweenTime * 1000)
          .easing(TWEEN.Easing.Quartic.In)
          .start();
        console.info(`抽奖按钮开始 加速度 ${this.moveAcceleration} 动画时间 ${tweenTime.toFixed(2)} 秒 `);
      },

      releaseLuckdraw() {
        if(!this.holdLuckDrawBtn) return;
        this.holdLuckDrawBtn = false;

        this.holdLuckDrawBtnTime = (new Date().getTime() - this.holdLuckDrawBtnTimeStamp) * 0.001;

        let tweenTime = this.holdLuckDrawBtnTime;
        if (tweenTime > 15) tweenTime = 15;

        //最终欢动持续时间是按住时间的 4 - 6.5 倍
//        const randomScaledTime = Math.random() * 2.5 + 4;

        this.moveAcceleration = -Math.abs(this.moveAcceleration);
        this.moveTween.to({moveAcceleration: -0.3}, 5 * 1000)
          .easing(TWEEN.Easing.Circular.Out)
          .start();

        console.info(`抽奖按钮释放 按住释放时间 ${this.holdLuckDrawBtnTime}s 加速度 ${this.moveAcceleration} 动画时间 ${tweenTime.toFixed(2)} 秒`);

//        if (!this.isValidHoldLuckDrawBtn()) {
//          if (process.env.NODE_ENV !== 'development') {
//            this.$say.speak(`喂～老板    你要多按住我一会儿, 你到现在才按住我${this.holdLuckDrawBtnTime.toFixed(2)}秒`);
//          }
//        }
      },

      isValidHoldLuckDrawBtn() {
        // 1.5 秒 内放开无效
        return this.holdLuckDrawBtnTime > 1.5;
      },

      render(delta) {

        if (this.isDataLoading) return;
        const luckdrawDrivesCount = this.luckdrawDrivers.length;
        if (luckdrawDrivesCount === 0) return;

        const moveAccelerationScale = 1;//1.8;
        this.moveSpeed = this.moveSpeed + this.moveAcceleration * moveAccelerationScale * delta;
        // 限定范围
        if (this.moveSpeed < 0) {
          this.moveSpeed = 0;
        } else if(this.moveSpeed > 15){
          this.moveSpeed = 15;
        }

        this.sectionMoveDistance += this.moveSpeed * delta * (luckdrawDrivesCount * 1.5);// 每秒多少个;
        let moveIndex = ~~this.sectionMoveDistance;
        if (moveIndex > 0) {
          this.sectionMoveDistance = this.sectionMoveDistance - moveIndex;
          // 取模
          this.luckdrawDriverIndex = (this.luckdrawDriverIndex + moveIndex) % luckdrawDrivesCount;
          this.luckdrawMarkSelectedDriver(this.luckdrawDriverIndex);
        }

//        console.log(`delta:${delta.toFixed(2)} acc:${this.moveAcceleration} sp:${this.moveSpeed} moveIndex: ${moveIndex} curIndex: ${this.luckdrawDriverIndex}`);

//        if (!this.holdLuckDrawBtn && this.moveSpeed < 0.00001) {
//          this.moveSpeed = 0;
//          // 最后在加一步
//          this.luckdrawDriverIndex = this.luckdrawDriverIndex +1;
//          this.luckdrawMarkSelectedDriver(this.luckdrawDriverIndex);

//          if (!this.isValidHoldLuckDrawBtn()) {
//            console.log('抽奖时间过短不做为结果！')
//          } else {
//            // 这里认为过程结束
//            this.completeLuckdraw(this.luckdrawDriverIndex);
//          }
//        }
      },

      luckdrawMarkSelectedDriver(curLuckdrawDriveIndex) {
        const targetDriver = this.$refs['driver_' + curLuckdrawDriveIndex];
        if (this.selectedDriver) {
          this.selectedDriver.setSelect(false);
        }
        this.selectedDriver = Array.isArray(targetDriver) ? targetDriver[0] : targetDriver;
        if (this.selectedDriver) {
          this.selectedDriver.setSelect(true);
        }
      },

      completeLuckdraw(luckdrawDriverIndex) {
        const driver = this.luckdrawDrivers[luckdrawDriverIndex];
        if (!driver) return;

        if (!this.luckdrawAward) return;

        this.isCompleteLuckdraw = true;

        console.info(`抽奖完成 被抽中当索引是 ${luckdrawDriverIndex} 司机是 ${driver.serial_no}`);

        let sysWords = `恭喜 编号为${driver.serial_no}的司机 ${driver.name} 获奖。奖品编号是 ${this.luckdrawAward.serial_no} 的 ${this.luckdrawAward.name}`;
        if (driver.need_show) {
          sysWords += '请上台。表演节目完后领奖！'
        } else {
          sysWords += '请上台。领奖！'
        }

        this.isDataLoading = true;
        this.$say.speak(sysWords);


//        this.isDataLoading = true;
//        this.$store.dispatch('ADD_LUCKDRAW', {
//          driver_no: driver.serial_no,
//          award_no: this.luckdrawAward.serial_no,
//        })
//        .then(()=>{
//          this.isDataLoading = false;
//        })
//        .catch(()=>{
//          this.isDataLoading = false;
//        });
      }
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
    /*display: flex;*/
    /*flex-direction: row;*/
    /*flex-wrap: wrap;*/
    /*justify-content: flex-start;*/
    /*align-content: flex-start;*/
    position: relative;
  }

  .award-count {
    color: #FFF;
    font-size: 26px;
    text-shadow: 1px 1px 1px black;
    position: absolute;
    left: 20px;
    top:20px;
  }

  .driver-count {
    color: #FFF;
    font-size: 26px;
    text-shadow: 1px 1px 1px black;
    position: absolute;
    left: 20px;
    top:60px;
  }

  .next-luckdraw {
    position: absolute;
    left: 20px;
    top: 120px;
  }

  .center-point {
    position: absolute;
    width: 0;
    height: 0;
    left: 50%;
    top: 50%;
  }

  .luckdraw-ball {
    position: absolute;
  }

  .fire-ball {
    width: 100px;
    height: 100px;
    border-radius: 50px;
    background-color: red;
    opacity: 0.8;
    transform: translate(-50%, -50%);
  }
</style>
