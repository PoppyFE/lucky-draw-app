<template>
  <el-dialog :title="'挑选 商品编号:' + model.serial_no + ' 的司机们'"
             :visible="true"
             :show-close="false">
    <el-table
            ref="form"
            stripe
            :data="model.preselectDrivers"
            style="width: 100%;height: 500px;overflow: scroll;">

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
    </el-table>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onCloseHandle()">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  /* eslint-disable */
  export default {
    name: 'driver-picker',
    components: {
    },

    props: {
      model: null,
    },

    methods: {
      onCloseHandle() {
        this.$emit('close');
      },
    },
  };
</script>

<style scoped>
</style>
