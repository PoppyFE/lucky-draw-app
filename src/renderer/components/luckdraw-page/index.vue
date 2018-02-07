<template>
  <div class="stage" ref="stage"
     :style="{'background-image': 'url('+backgroundImg+')'}">

    <p class="award-count">{{'奖品剩余:' + (totalAwardsCount - totalSelectedAwardsCount)}}</p>
    <p class="driver-cur-count">{{'当前司机:' + (luckdrawDrivers ? luckdrawDrivers.length : 0)}}</p>
    <p class="driver-count">{{'司机剩余:' + (totalDriversCount - totalSelectedDriversCount)}}</p>

    <el-button class="next-luckdraw"
               :loading="isDataLoading"
               @click="nextLuckDrawClickHanler"
               round>下一组抽奖</el-button>

    <el-button class="fullscreen-btn" round @click="enterFullScreen">全屏</el-button>
    <el-button class="quit-btn" round @click="exitPage">退出</el-button>

    <audio class="bg-sound"
           autoplay
           loop
           controls
           :src="backgroundSound">
    </audio>

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
        ref="luckdrawAward"
        :award="luckdrawAward"
        :secret="!isCompleteLuckdraw"
        :power="speed / 80"
        :randomSeed="randomSeed"
        :maxHoldTime="~~maxHoldTime"
        :round="totalSelectedAwardsCount"
        @holdluckdraw="startLuckdraw"
        @releaseluckdraw="releaseLuckdraw"
      ></award-card>

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
        // 速度表达的是移动 表示0个单位/秒  80 最大
        speed: 0,

        maxHoldTime: 0,

        backgroundImg: '',
        backgroundSound: '',

        luckdrawAward: null,
        luckdrawDrivers: [],

        holdLuckDrawBtn: false,
        holdLuckDrawBtnTime: 0,

        totalAwardsCount: 0,
        totalDriversCount: 0,
        totalSelectedAwardsCount: 0,
        totalSelectedDriversCount: 0,

        isDataLoading: false,

        winnerLuckdrawDriverIndex: -1,
        isCompleteLuckdraw: false,

        randomSeed: 0,
      };
    },

    created() {
      const that = this;

      const path = require('path');
      const electron = require('electron');

      // 加速度表示速度的变化程度范围0.01-1
      this.power = 0;

      this.backgroundImg = process.env.NODE_ENV === 'development' ?
        'file:///Users/alex/Projects/lucky-draw-app/static/luckdraw_bg.jpg' :
        path.join(electron.remote.app.getAppPath(), 'dist/electron/static/luckdraw_bg.jpg');

      this.moveTween = new TWEEN.Tween(this);
      this.timestamp = new Date().getTime();
      this.soundEffectTimeStamp = new Date().getTime();
      this.luckdrawDriverIndex = 0;
      this.distance = 0;
      this.selectedDriver = null;
      this.luckdrawSoundEffect = null;

      // keep the ani
      function animate() {
        that.requestAnimationFrameHandler = requestAnimationFrame(animate);
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
        if (that.holdLuckDrawBtn) return;

        console.log('stageKeyDown');
        that.startLuckdraw();
//        console.log('stageKeyDownHandler');
      });

      this.stageKeyUpHandler = (function(evt) {
        evt.preventDefault();
        evt.stopImmediatePropagation();
        if (evt.code !== 'Space') return;

        console.log('stageKeyUp');
        that.releaseLuckdraw();
      });

      window.document.addEventListener('keyup', this.stageKeyUpHandler);
      window.document.addEventListener('keydown', this.stageKeyDownHandler);
    },

    beforeDestroy() {
      if (this.luckdrawSoundEffect) {
        this.luckdrawSoundEffect.stop();
        this.luckdrawSoundEffect = null;
      }

      if (this.moveTween) {
        this.moveTween.stop();
      }

      if (this.requestAnimationFrameHandler > 0) {
        window.cancelAnimationFrame(this.requestAnimationFrameHandler);
        this.requestAnimationFrameHandler = 0;
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
//        this.$refs.stage.webkitRequestFullscreen();
//        window.document.webkitRequestFullscreen();
        window.document.body.webkitRequestFullscreen();
      },

      exitPage() {
        this.$router.push({ path: 'award' });
//        this.luckdrawSoundEffect.play();
      },

      nextLuckDrawClickHanler() {
//        if (this.speed > 0.0002) return;
        if (this.isDataLoading) return;

        this.isDataLoading = true;
        this.luckdrawAward = null;
        this.luckdrawDrivers = [];
//        this.winnerLuckdrawDriverIndex = -1;
        this.$store.dispatch('LOAD_LUCKDRAW')
          .then((results)=>{
            const {luckdrawAward,
              totalAwardsCount,
              totalDriversCount,
              totalSelectedAwardsCount,
              totalSelectedDriversCount} = results;

            const path = require('path');
            const electron = require('electron');

            this.backgroundImg = (luckdrawAward && luckdrawAward.award_img && encodeURI(luckdrawAward.award_img)) || this.backgroundImg || path.join(electron.remote.app.getAppPath(), 'dist/electron/static/luckdraw_bg.jpg');
            console.log('更新背景图片:', this.backgroundImg);
            this.totalAwardsCount = totalAwardsCount;
            this.totalDriversCount = totalDriversCount;
            this.totalSelectedAwardsCount = totalSelectedAwardsCount;
            this.totalSelectedDriversCount = totalSelectedDriversCount;
            this.isCompleteLuckdraw = false;
            this.power = 0;
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
            this.luckdrawDriverIndex = parseInt(Math.random() * this.luckdrawDrivers.length);
            this.luckdrawSoundEffect = luckdrawAward && luckdrawAward.luckdraw_sound ? new Howl({src: luckdrawAward.luckdraw_sound}) : null;
          })
          .catch((err) => {
            this.isDataLoading = false;
            console.error(err);

            if (err && err.hasOwnProperty('error') && err.error && err.hasOwnProperty('errorMsg')) {

              const {totalAwardsCount,
                totalDriversCount,
                totalSelectedAwardsCount,
                totalSelectedDriversCount} = err;

              this.totalAwardsCount = totalAwardsCount;
              this.totalDriversCount = totalDriversCount;
              this.totalSelectedAwardsCount = totalSelectedAwardsCount;
              this.totalSelectedDriversCount = totalSelectedDriversCount;

              this.$alert(err.errorMsg);
              return;
            }

            this.$alert('请联系客服 15000273963', '出错了哦');
          });

      },

      startLuckdraw() {
//        console.log('startLuckdraw', this);
        if (this.isDataLoading) return;
        if (this.isCompleteLuckdraw) return;

        this.holdLuckDrawBtnTimeStamp = new Date().getTime();
        this.holdLuckDrawBtn = true;

        // 3s
        const tweenTime = 3;
        //16 表示5s到80
        this.power = 8;
        this.moveTween
          .to({power: 16}, tweenTime * 1000)
          .easing(TWEEN.Easing.Quartic.In)
          .start();
        console.info(`抽奖按钮开始 加速度 ${this.power} 动画时间 ${tweenTime.toFixed(2)} 秒 `);
      },

      releaseLuckdraw() {
        if(!this.holdLuckDrawBtn) return;
        this.holdLuckDrawBtn = false;

        this.holdLuckDrawBtnTime = (new Date().getTime() - this.holdLuckDrawBtnTimeStamp) * 0.001;

        let tweenTime = this.holdLuckDrawBtnTime;
        if (tweenTime > 15) tweenTime = 15;

        this.power = -Math.abs(this.power) * 0.8;
        this.moveTween.stop();

        console.info(`抽奖按钮释放 按住释放时间 ${this.holdLuckDrawBtnTime}s 加速度 ${this.power} 动画时间 ${tweenTime.toFixed(2)} 秒`);
      },

      render(delta) {
        if (this.isDataLoading) return;
        if (this.power === 0) return;
        if (this.isCompleteLuckdraw) return;

        const count = this.luckdrawDrivers.length;
        if (count === 0) return;

        let speed = this.speed;
        const power = this.power;
        let distance = this.distance;
        let luckdrawDriverIndex = this.luckdrawDriverIndex;
        let maxHoldTime = this.maxHoldTime;

        //speed 20中 40块 80极快
        //0.01 - 1
        //5s 内速度要到80 1s 内速度到16
        speed = speed + power * delta;
        // 限定范围
        if (speed <= 0) {
          speed = 0;
        } else if(speed > 80){
          speed = 80;
        }

        if (speed >= 80) {
          maxHoldTime += delta;
        }

        distance += speed * delta;
        const moveIndex = ~~distance;
        if (moveIndex > 0) {
          distance = distance - moveIndex;
          // 取模
          luckdrawDriverIndex = (luckdrawDriverIndex + moveIndex) % count;
          this.luckdrawMarkSelectedDriver(luckdrawDriverIndex);
        }

        // 停止的逻辑
        if (power < 0 && speed < -power * delta ) {
          // 取消阻力
          this.power = 0;
          this.maxHoldTime = 0;
          this.speed = 0;
          this.distance = 0;

          if (maxHoldTime >= 3) {// >3秒效
            this.completeLuckdraw(luckdrawDriverIndex);
          } else {
            this.$message({
              showClose: true,
              message: '操作失败！蓄力必须保持3秒以上！',
              type: 'warning'
            });

            this.$say(`操作失败 蓄力必须保持3秒以上！ ～老板～ 你要多按住我一会儿, 你到现在蓄力保持了${~~maxHoldTime}秒`);
          }
          return;
        }

        this.speed = speed;
        this.distance = distance;
        this.luckdrawDriverIndex = luckdrawDriverIndex;
        this.maxHoldTime = maxHoldTime;

        console.log(`delta:${delta.toFixed(2)} power:${power} speed:${speed} moveIndex: ${moveIndex} curIndex: ${luckdrawDriverIndex}`);
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

        if (this.luckdrawSoundEffect) {
          const curTime = new Date().getTime();
          if (curTime - this.soundEffectTimeStamp > 50) {
            this.soundEffectTimeStamp = curTime;
            this.luckdrawSoundEffect.play();
          }
        }
      },

      completeLuckdraw(luckdrawDriverIndex) {
        console.log('completeLuckdraw', luckdrawDriverIndex);
        const driver = this.luckdrawDrivers[luckdrawDriverIndex];
        if (!driver) return;
        const award = this.luckdrawAward;
        if (!award) return;

//        this.winnerLuckdrawDriverIndex = luckdrawDriverIndex;
        this.isCompleteLuckdraw = true;

        console.info(`抽奖完成被抽中当索引是 ${luckdrawDriverIndex} 司机是 ${driver.serial_no}`);

        let sysWords = `恭喜。编号为${driver.serial_no}的 ${driver.name} 获奖。奖品编号是${this.luckdrawAward.serial_no} 奖品名称是 ${this.luckdrawAward.name}`;
        if (driver.need_show) {
          sysWords += `请${driver.name}上台。表演节目完后领奖！`
        } else {
          sysWords += `请${driver.name}上台。领奖！`
        }

        // 这里是抽奖环节 锁定数据
        this.isDataLoading = true;

        // 停止背景音乐
        this.backgroundSound = '';


        // 这里有段动画

        Promise.all(
          [
            // 高亮
            new Promise((resolve) => {
              setTimeout(()=>{
                this.luckdrawDrivers.forEach((driver, index) => {
                  const isWinner = luckdrawDriverIndex === index;
                  let targetDriver = this.$refs['driver_' + index];
                  if (Array.isArray(targetDriver)) { targetDriver = targetDriver[0]}
                  targetDriver.setWinner(isWinner);
                });
                resolve();
              }, 1000)
            }),

            this.$store.dispatch('ADD_LUCKDRAW', {
              driver_no: driver.serial_no,
              award_no: this.luckdrawAward.serial_no,
              luckdrawDrivers: this.luckdrawDrivers,
            })
            .catch((err)=>{
              this.$message({
                showClose: true,
                message: '报错抽奖数据报错！！！ 请按下一组重新抽奖 Sorry！！！',
                type: 'warning'
              });
              console.error('报错抽奖数据报错！！！ 请按下一组重新抽奖 Sorry！！！' + err);
              throw err;
            }),
          ]
        )
        .then(()=>{
          return new Promise(resolve => {
            setTimeout(()=>{
              resolve();
            }, 1000)
          });
        })
        .then(()=>{
          //动画
          return Promise.all([
            new Promise(resolve => {
              // 奖品 和 抽中奖品的人居中显示
              if (this.$refs.luckdrawAward) {
                this.$refs.luckdrawAward.moveToCenter(resolve);
              }
            }),
            new Promise(resolve => {
              // 奖品 和 抽中奖品的人居中显示
              if (this.$refs['driver_' + luckdrawDriverIndex]) {
                this.$refs['driver_' + luckdrawDriverIndex][0].moveToCenter(resolve);
              }
            })
          ]);
        })
        .then(()=>{
          this.$say(sysWords, ()=>{
            // 这里有流程
            new Promise((resolve) => {
              //播放奖品声音
              if (award.award_sound) {
                const awardSound = new Howl({src: award.award_sound});
                if (this.$refs.luckdrawAward) {
                  this.$refs.luckdrawAward.setSpeaking(true);
                }

                awardSound.play();
                awardSound.once('end', () => {
                  if (this.$refs.luckdrawAward) {
                    this.$refs.luckdrawAward.setSpeaking(false);
                  }
                  resolve();
                });
              } else {
                resolve();
              }
            })
              .then(() => {
                return new Promise((resolve) => {
                  if (driver.award_sound) {
                    const driverSound = new Howl({src: driver.award_sound});

                    if (this.$refs['driver_' + luckdrawDriverIndex]) {
                      this.$refs['driver_' + luckdrawDriverIndex][0].setSpeaking(true);
                    }

                    driverSound.play();
                    driverSound.once('end', () => {
                      if (this.$refs['driver_' + luckdrawDriverIndex]) {
                        this.$refs['driver_' + luckdrawDriverIndex][0].setSpeaking(false);
                      }
                      resolve();
                    });
                  } else {
                    resolve();
                  }
                })
              })
              .then(()=>{
                this.isDataLoading = false;
              })
              .catch((err)=>{
                this.isDataLoading = false;
                console.error(err);
              })
          });
        });
      }
    },
  };
</script>

<style scoped>
  .stage {
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
    position: absolute;
    z-index: 10;
  }

  .driver-cur-count {
    color: #b0dcff;
    font-size: 24px;
    text-shadow: 1px 1px 1px black;
    position: absolute;
    font-weight: bolder;
    left: 20px;
    top:80px;
  }

  .award-count {
    color: #FFF;
    font-size: 16px;
    text-shadow: 1px 1px 1px black;
    position: absolute;
    left: 20px;
    top:110px;
  }

  .driver-count {
    color: #FFF;
    font-size: 16px;
    text-shadow: 1px 1px 1px black;
    position: absolute;
    left: 20px;
    top:130px;
  }

  .next-luckdraw {
    position: absolute;
    left: 20px;
    top: 20px;
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

  .fullscreen-btn {
    position: absolute;
    right: 20px;
    top: 20px;
  }

  .quit-btn {
    position: absolute;
    right: 20px;
    bottom: 20px;
  }

  .bg-sound {
    position: absolute;
    left: 20px;
    bottom: 20px;
  }
</style>
