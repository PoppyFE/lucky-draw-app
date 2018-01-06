<template>
  <div class="card">
    <audio v-if="moveSpeed > 0 && award.luckdraw_sound"
           autoplay
           loop
           :src="award.luckdraw_sound">
    </audio>
    <!--content-->
    <div class="content" :style="{'background-image': 'url('+award.img+')', filter: 'blur(' + (secret ? 8 : 0) + 'px)'}">
    </div>
    <div class="powerbar" :style="{width: moveSpeed * 100 + '%', 'background-color':loadingColor }">
      <p v-if="moveSpeed > 0.9" style="color: #cf9236;font-size: 20px;text-align: center;line-height: 60px">～恭喜发财 保持～</p>
    </div>
    <span class="title">{{award.serial_no}}</span>

    <i v-if="moveSpeed > 0.01"
       class="el-icon-loading loading"
       :style="{'animation-duration': (-2.5 * moveSpeed + 2.8) + 's', color: loadingColor}"></i>
    <!--contolbar-->
    <div class="footer">
      <span v-if="secret">***********</span>
      <span v-else>{{award.name}}</span>
      <div style="flex-grow: 1"></div>
      <!--el-icon-loadin-->

      <el-button type="text"
                 class="button awardBtn"
                 icon="el-icon-location"
                 @mousedown.native="awardBtnMouseDownHandler()"
                 @mouseup.native="awardBtnMouseUpHandler()">抽奖</el-button>
    </div>
  </div>
</template>

<script>
  /* eslint-disable */

  export default {
    name: 'award-card',
    props: {
      award: {
        serial_no: '',
        name: '',
        img: null,
        award_sound: null, // 获奖
      },
      secret: true,
      moveSpeed: 0, //0-1
    },

    data() {
      return {
      };
    },

    computed: {
      loadingColor() {
        if (this.moveSpeed >= 1) return '#FF0014';
        else if (this.moveSpeed >= 0.9 && this.moveSpeed < 1) return '#FF4F5A';
        else if (this.moveSpeed >= 0.6 && this.moveSpeed < 0.9) return '#FF7B80';
        else if (this.moveSpeed >= 0.4 && this.moveSpeed < 0.6) return '#FFB2B0';
        else if (this.moveSpeed >= 0.2 && this.moveSpeed < 0.4) return '#FFD9D0';
        else if (this.moveSpeed == 0) return '#fff';
      },
    },

    created() {
    },

    methods: {
      awardBtnMouseDownHandler() {
        this.$emit('holdluckdraw');
      },

      awardBtnMouseUpHandler() {
        this.$emit('releaseluckdraw')
      },

    }
  };
</script>

<style scoped>
  .card {
    width: 250px;
    height: 300px;
    border-radius: 8px;
    background-color: #ffffff;
    display: flex;
    position: absolute;
    flex-direction: column;
    margin: 4px;
    transform:translate(-50%, -50%)
  }

  .title {
    position: absolute;
    left: 10px;
    top: 10px;
    color: #ffffff;
    text-shadow: 0 0 2px #000;
  }

  .powerbar {
    position: absolute;
    width: 0%;
    filter: blur(1px);
    background-color: #ffffff;
    opacity: 0.8;
    height: 60px;
    left: 0px;
    bottom: 0px;
    pointer-events: none;
  }

  .loading {
    position: absolute;
    font-size: 80px;
    filter: blur(2px);
    color: #FFF;
    left: 85px;
    top: 110px;
  }

  .content {
    width: 100%;
    flex-grow: 1;
    background-repeat: no-repeat;
    background-size: cover;
    box-shadow: 0px 0px 8px #000000;
  }

  .footer {
    padding: 6px 10px;
    width: 100%;
    height: 60px;
    line-height: 60px;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
</style>
