<template>
  <el-container>

    <driver-dialog :model="dialogModel"
                  v-if="dialogVisible"
                  @close="dialogVisible=false"></driver-dialog>

    <award-picker :model="awardPickerModel"
                  v-if="awardPickerVisible"
                  @close="awardPickerVisible=false"></award-picker>

    <el-header>
      <el-button @click="handleCreate">添加</el-button>
    </el-header>
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
          label="编号"
          property="serial_no"
          width="120">
        </el-table-column>

        <el-table-column
          label="姓名"
          property="name"
          width="100">
        </el-table-column>

        <el-table-column
          label="图片">
          <template slot-scope="scope">
            <img height="80" :src="scope.row.img">
          </template>
        </el-table-column>

        <el-table-column label="挑选奖品">
          <template slot-scope="scope">
            <div style="display: inline-flex;flex-direction: row;align-items:center;">
              <el-button slot="append"
                         style="color: #f56c6c;width:60px;height:60px"
                         icon="el-icon-menu"
                         @click="handlePickAward(scope.row)"></el-button>
              <award-items :items="scope.row.preselectAwards"></award-items>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="状态"
          width="80">
        </el-table-column>

        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-main>
  </el-container>
</template>

<script>

  import DriverDialog from '../driver-dialog/index.vue';
  import AwardPicker from '../award-picker/index.vue';
  import AwardItems from '../award-items/index.vue';

  export default {
    name: 'drive-page',

    components: {
      DriverDialog,
      AwardPicker,
      AwardItems,
    },

    beforeRouteEnter(to, from, next) {
      next((vm) => {
        vm.$store.dispatch('INIT_DRIVER_LIST');
      });
    },

    data() {
      return {
        dialogVisible: false,
        dialogModel: {
          mode: 'create',
          data: {},
        },
        awardPickerVisible: false,
        awardPickerModel: null,
      };
    },

    computed: {
      list() {
        return this.$store.state.driver.list;
      },
    },

    methods: {
      handlePickAward(row) {
        this.awardPickerVisible = true;
        this.awardPickerModel = row;
      },

      handleCreate() {
        this.dialogModel.mode = 'create';
        this.dialogVisible = true;
      },

      handleEdit(index, driver) {
        this.dialogModel = {
          mode: 'edit',
          data: driver,
        };

        this.dialogVisible = true;
      },

      handleDelete(index, driver) {
        this.$confirm(`确认删除司机( ${driver.serial_no || ''} - ${driver.name || ''} ) ？`)
          .then(() => {
            this.$store.dispatch('REMOVE_DRIVER', driver.id);
          })
          .catch(() => {});
      },
    },
  };
</script>

<style>
</style>
