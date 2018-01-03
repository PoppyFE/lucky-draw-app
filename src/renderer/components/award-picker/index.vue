<template>
  <el-dialog :title="model.name + ' 挑选奖品'"
             :visible="true"
             :show-close="false">
    <el-table
            ref="form"
            stripe
            :data="list"
            @selection-change="onSelectedChangedHandler"
            style="width: 100%;height: 500px;overflow: scroll;">
      <el-table-column
        type="selection">
      </el-table-column>

      <el-table-column
              label="#"
              type="index">
      </el-table-column>

      <el-table-column
        label="编号"
        property="serial_no">
      </el-table-column>

      <!--<el-table-column-->
        <!--label="名称"-->
        <!--property="name">-->
      <!--</el-table-column>-->

      <!--<el-table-column-->
        <!--label="图片">-->
        <!--<template slot-scope="scope">-->
          <!--<img height="80" :src="scope.row.img">-->
        <!--</template>-->
      <!--</el-table-column>-->

    </el-table>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onCloseHandle(true)">取 消</el-button>
      <el-button type="primary" :loading="dataSaving"
                 @click="onCloseHandle(false)">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  /* eslint-disable */
  export default {
    name: 'award-picker',
    components: {
    },

    props: {
      model: null,
    },

    data() {
      return {
        multipleSelection: [],
        dataSaving: false,
      };
    },

    created() {
      this.$store.dispatch('INIT_AWARD_LIST');
    },

    computed: {
      list() {
        return this.$store.state.award.list;
      },
    },

    methods: {
      onCloseHandle(cancel) {
        if (cancel) {
          this.$emit('close');
          return;
        }

        if (this.multipleSelection.length > 2) {
          this.$message.error('不要贪心哦，不能选择超过2个奖品哦！');
          return;
        }

        if (this.multipleSelection.length !== 2) {
          this.$message.error('麻烦亲～ 选择2个奖品撒！');
          return;
        }

        // 这里修改数据
        if (!this.model) {
          return;
        }

        this.dataSaving = true;

        this.$store.dispatch('UPDATE_AWARD_DIVER_PRESELECT', {
          preselectAwards: [...this.multipleSelection],
          driver_no: this.model.serial_no,
        }).then(() => {
          this.dataSaving = false;
          this.$emit('close');
        }).catch(() => {
          this.dataSaving = false;
          this.$emit('close');
        });
      },

      onSelectedChangedHandler(selection) {
        this.multipleSelection = selection;
      },
    },
  };
</script>

<style scoped>
</style>
