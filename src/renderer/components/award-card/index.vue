<template>
  <div class="card">
    <!--content-->
    <div class="content" :style="{'background-image': 'url('+award.img+')', filter: 'blur(' + (secret ? 8 : 0) + 'px)'}">
    </div>
    <span class="title">{{award.serial_no}}</span>
    <!--contolbar-->
    <div class="footer">
      <span v-if="secret">***********</span>
      <span v-else>{{award.name}}</span>
      <div style="flex-grow: 1"></div>
      <!--el-icon-loadin-->

      <i v-if="isLoading" class="el-icon-loading"></i>

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
    },

    data() {
      return {
        isLoading: false,
      };
    },

    created() {
    },

    methods: {
      awardBtnMouseDownHandler() {
        this.isLoading = true;
        this.$emit('holdluckdraw');
      },

      awardBtnMouseUpHandler() {
        this.isLoading = false;
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
    position: relative;
    flex-direction: column;
    margin: 4px;
  }

  .title {
    position: absolute;
    left: 10px;
    top: 10px;
    color: #ffffff;
    text-shadow: 0 0 2px #000;
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
