<template>
  <el-container>

    <award-dialog :model="dialogModel"
                  v-if="dialogVisible"
                  @close="dialogVisible=false"></award-dialog>

    <driver-picker :model="driverModel"
                   v-if="driverVisible"
                   @close="driverVisible=false"></driver-picker>

    <el-header>
      <el-button @click="handleCreate">添加</el-button>
    </el-header>
    <el-main style="overflow: scroll">
      <el-table
              stripe
              :data="list"
              style="width: 100%;">

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
          label="名称"
          property="name"
          width="200">
        </el-table-column>

        <el-table-column
          label="图片">
          <template slot-scope="scope">
            <img height="80" :src="scope.row.img">
          </template>
        </el-table-column>

        <el-table-column
          label="预选司机们">
          <template slot-scope="scope">
            <!--<span v-if="scope.row.preselectDrivers.length <= 0">0 人</span>-->
            <!--<a v-else-if="scope.row.preselectDrivers.length> 0"-->
               <!--style="cursor:pointer"-->
               <!--@click="handleDiverPick(scope.row)">{{scope.row.preselectDrivers.length}} 人</a>-->
            <span style="cursor:pointer"
                  @click="handleDiverPick(scope.row)">
              查看
            </span>
            <el-badge :value="scope.row.preselectDrivers.length">
            </el-badge>

          </template>
        </el-table-column>

        <!--<el-table-column-->
          <!--label="创建时间"-->
          <!--property="create_at">-->
        <!--</el-table-column>-->

        <!--<el-table-column-->
          <!--label="更新时间"-->
          <!--property="update_at">-->
        <!--</el-table-column>-->

        <!--<el-table-column-->
          <!--label="状态"-->
          <!--width="80">-->
        <!--</el-table-column>-->

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

  import AwardDialog from '../award-dialog/index.vue';
  import DriverPicker from '../driver-picker/index.vue';

  export default {
    name: 'award-page',
    components: {
      AwardDialog,
      DriverPicker,
    },
    data() {
      return {
        dialogVisible: false,
        dialogModel: {
          mode: 'create',
          data: {},
        },
        driverVisible: false,
        driverModel: null,
      };
    },

    beforeRouteEnter(to, from, next) {
      next((vm) => {
        vm.$store.dispatch('INIT_AWARD_LIST');
      });
    },

    computed: {
      list() {
        return this.$store.state.award.list;
      },
    },

    methods: {
      handleCreate() {
        this.dialogModel.mode = 'create';
        this.dialogVisible = true;
      },

      handleEdit(index, award) {
        this.dialogModel = {
          mode: 'edit',
          data: award,
        };

        this.dialogVisible = true;
      },

      handleDelete(index, award) {
        this.$confirm(`确认删除奖品( ${award.serial_no || ''} - ${award.name || ''} ) ？`)
          .then(() => {
            this.$store.dispatch('REMOVE_AWARD', award);
          })
          .catch(() => {});
      },

      handleDiverPick(award) {
        if (award.preselectDrivers.length <= 0) return;
        this.driverModel = award;
        this.driverVisible = true;
      },
    },
  };
</script>

<style scoped>
</style>
