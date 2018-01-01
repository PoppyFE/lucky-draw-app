<template>
  <div class="page">
    <div style="padding: 10px 0;">
      <el-input placeholder="请输入要播放的内容" v-model="sayWords" class="input-with-select">
        <template slot="prepend">调试发声音</template>
        <el-button slot="append" icon="el-icon-caret-right" @click="paySayWords"></el-button>
      </el-input>
    </div>

    <div style="padding: 10px 0;">
      <el-button slot="append" @click="openDevTools">DevTool</el-button>
    </div>

  </div>
</template>

<script>

  export default {
    name: 'debug-page',
    data() {
      return {
        sayWords: '',
      };
    },
    methods: {
      paySayWords() {
        // this.$electron.shell.openExternal(link);
        if (!this.sayWords) return;
        this.$say.speak(this.sayWords);
      },

      openDevTools() {
        this.$electron.ipcRenderer.send('open-dev-tool');
      },
    },
  };
</script>

<style>

</style>
