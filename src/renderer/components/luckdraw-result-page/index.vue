<template>
  <el-container>

    <!--<driver-dialog :model="dialogModel"-->
                  <!--v-if="dialogVisible"-->
                  <!--@close="dialogVisible=false"></driver-dialog>-->

    <!--<award-picker :model="awardPickerModel"-->
                  <!--v-if="awardPickerVisible"-->
                  <!--@close="awardPickerVisible=false"></award-picker>-->

    <!--<el-header>-->
      <!--<el-button @click="handleCreate">添加</el-button>-->
    <!--</el-header>-->
    <el-main style="overflow: scroll">
      <el-table
        stripe
        :data="list"
        style="width: 100%">

        <el-table-column
          label="#"
          type="index"
          width="50">
        </el-table-column>

        <el-table-column
          label="司机编号"
          property="driver_no"
          width="120">
        </el-table-column>

        <el-table-column
          label="司机姓名"
          property="driver_name"
          width="100">
        </el-table-column>

        <el-table-column
          width="250"
          label="司机头像">
          <template slot-scope="scope">
            <img height="80" :src="scope.row.driver_img">
          </template>
        </el-table-column>

        <el-table-column
          label="奖品编号"
          property="award_no"
          width="120">
        </el-table-column>

        <el-table-column
          label="奖品"
          property="award_name"
          width="100">
        </el-table-column>

        <el-table-column
          width="250"
          label="奖品图片">
          <template slot-scope="scope">
            <img height="80" :src="scope.row.award_img">
          </template>
        </el-table-column>

      </el-table>
    </el-main>
  </el-container>
</template>

<script>

  export default {
    name: 'luckdraw-result-page',

    components: {
    },

    data() {
      return {
        list: [],
      };
    },

    created() {
      this.$store.dispatch('LOAD_LUCKDRAW_RESULT')
        .then((results) => {
          this.list = results;
        })
        .catch((err) => {
          console.error(err);
        });
    },

    methods: {

    },
  };
</script>

<style>
</style>
