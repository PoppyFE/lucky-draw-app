<template>
  <div class="card" :class="{selected:selected}">
    <!--content-->
    <div class="content" :style="{'background-image': 'url('+driver.img+')'}">
    </div>
    <span class="title">{{driver.serial_no}}</span>
    <el-badge :value="9" class="badge">
    </el-badge>

    <!--contolbar-->
    <div class="footer">
      <span>{{driver.name}}</span>
    </div>
  </div>
</template>

<script>
  /* eslint-disable */

  export default {
    name: 'driver-card',
    props: {
      driver: {
        serial_no: '',
        name: '',
        img: null,
      },
    },

    data() {
      return {
        selected: false,
      }
    },

    created() {
    },

    methods: {
      setSelect(val) {
        this.selected = val;
      }
    }
  };
</script>

<style scoped>
  .card {
    width: 120px;
    height: 160px;
    border-radius: 6px;
    margin: 4px 8px;
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .selected {
    border: #e54c60 3px solid;
    box-shadow: 0 0 20px rgb(238, 138, 0);
  }

  .content {
    width: 100%;
    flex-grow: 1;
    background-repeat: no-repeat;
    background-size: cover;
    box-shadow: 0px 0px 8px #000000;
  }

  .title {
    position: absolute;
    left: 10px;
    top: 10px;
    color: #ffffff;
    text-shadow: 0 0 2px #000;
  }

  .badge {
    position: absolute;
    top: 2px;
    right: 2px;
  }

  .footer {
    padding: 6px 10px;
    width: 100%;
    height: 42px;
    line-height: 20px;
  }
</style>
