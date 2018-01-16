<template>
  <el-dialog title="司机"
             :visible="true"
             :show-close="false">
    <el-form :model="form"
             ref="form"
             label-width="80px"
             :rules="rules">
      <el-form-item label="编号" prop="serial_no">
        <el-input v-model="form.serial_no"
                  :maxlength="10"
                  auto-complete="off"></el-input>
      </el-form-item>

      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name" auto-complete="off"></el-input>
      </el-form-item>

      <el-form-item label="图片">
        <el-upload
          :multiple="false"
          :http-request="doAvatarUpload"
          class="avatar-uploader"
          action="XXXXX"
          :show-file-list="false"
          :before-upload="beforeAvatarUpload">
          <img v-if="form.img" :src="form.img" class="avatar">
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </el-form-item>

      <el-form-item label="可以预选奖品数量">
        <el-input-number v-model="form.preaward_count" :min="1" :max="4" label="预选奖品数量"></el-input-number>
      </el-form-item>


      <!--<el-form-item label="获奖声音">-->
        <!--<el-input v-model="form.sayWords"-->
                  <!--:maxlength="500"-->
                  <!--auto-complete="off"></el-input>-->
        <!--<el-button icon="el-icon-caret-right" @click="paySayWords"></el-button>-->
      <!--</el-form-item>-->

      <el-form-item label="获奖声音">
        <el-upload
          :multiple="false"
          :http-request="doAwardSoundUpload"
          class="sound-uploader"
          action="XXXXX"
          :show-file-list="false"
          :before-upload="beforeSoundUpload">
          <i v-if="form.award_sound" class="sound el-icon-service"></i>
          <i v-else class="el-icon-plus sound-uploader-icon"></i>
        </el-upload>
        <audio v-if="form.award_sound" class="success"
               controls="controls"
               :src="form.award_sound">
        </audio>
        <el-button type="primary" icon="el-icon-delete" @click="form.award_sound=null"></el-button>
      </el-form-item>

    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onCloseHandle(true)">取 消</el-button>
      <el-button type="primary" @click="onCloseHandle(false)">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  /* eslint-disable */

  import uuidv4 from 'uuid/v4';

  export default {
    name: 'award-dialog',
    props: {
      model: {
        mode: 'create', // create, edit
        data: {}, //
      },
      close: Function,
    },
    data() {
      return {
        form: {
          serial_no: '',
          name: '',
          img: null,
//          sayWords: '',
          award_sound: null,
          preaward_count: 0,
        },

        rules: {
          serial_no: [
            { required: true, message: '请输入司机唯一编号', trigger: 'blur' },
          ],
          name: [
            { required: true, message: '请输入司机姓名', trigger: 'blur' },
            { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' },
          ],
        },
      };
    },

    created() {
      if (this.model.mode === 'edit') {
        this.form = Object.assign({}, this.model.data);
      }
    },

    methods: {
      paySayWords() {
        // this.$electron.shell.openExternal(link);
        if (!this.form.sayWords) return;
        this.$say.speak(this.form.sayWords);
      },

      beforeSoundUpload(file) {
        if (file.size / 1024 / 1024 > 20) {
          this.$message.error('上传声音大小不能超过 20MB!');
          return false;
        }

        if (!file.type.startsWith('audio')) {
          this.$message.error('不支持的声音 格式的文件!');
          return false;
        }

        return true;
      },

      doAwardSoundUpload(uploader) {
        const file = uploader.file;
        const path = require('path');
        const fs = require('fs-extra');
        const os = require('os');
        const targetPath = path.join(window.APP_USER_DATA_DIR, 'sound', uuidv4() + path.extname(file.path));
        fs.copy(file.path, targetPath)
          .then(() => {
            this.form.award_sound = `file://${targetPath}`;
          })
          .catch((err) => {
            this.$message.error(`保存出错！+ \n${err}`);
          });
      },


      doAvatarUpload(uploader) {
        const file = uploader.file;

        const path = require('path');
        const fs = require('fs-extra');
        const os = require('os');
        const targetPath = path.join(window.APP_USER_DATA_DIR, 'img', uuidv4() + path.extname(file.path));
        fs.copy(file.path, targetPath)
          .then(() => {
            this.form.img = `file://${targetPath}`;
          })
          .catch((err) => {
            this.$message.error('保存出错！+ \n' + err);
          });

        // const fileReader = new FileReader();
        // const that = this;
        // fileReader.onloadend = (evt) => {
        // that.form.img = evt.target.result;
        // };
        // fileReader.readAsDataURL(file);
      },

      beforeAvatarUpload(file) {
        if (file.size / 1024 / 1024 > 5) {
          this.$message.error('上传头像图片大小不能超过 5MB!');
          return false;
        }

        if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
          this.$message.error('只支持JPGE 和 PNG 格式的文件!');
          return false;
        }

        return true;
      },

      onCloseHandle(cancel) {
        if (cancel) {
          this.$emit('close');
          return;
        }

        const that = this;

        this.$refs.form.validate((valid) => {
          if (!valid) return;

          // save the data;
          if (that.model.mode === 'create') {
            that.$store.dispatch('ADD_DRIVER', that.form)
              .then(() => {
                that.$emit('close');
              })
              .catch((err) => {
                that.$message.error(err.message);
              });
          }

          if (that.model.mode === 'edit') {
            that.$store.dispatch('UPDATE_DRIVER', Object.assign({}, that.form))
              .then(() => {
                that.$emit('close');
              })
              .catch((err) => {
                that.$message.error(err.message);
              });
          }
        });
      },
    },
  };
</script>

<style scoped>
  .avatar-uploader {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    width: 178px;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }

  .sound-uploader {
    display: inline-block;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    width: 50px;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader:hover {
    border-color: #409EFF;
  }
  .sound-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 50px;
    height: 50px;
    line-height: 50px;
    text-align: center;
  }
  .sound {
    width: 50px;
    height: 50px;
    line-height: 50px;
  }
</style>
