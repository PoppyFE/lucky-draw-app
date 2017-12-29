import Vue from 'vue';
import axios from 'axios';
import Dexie from 'dexie';

import App from './App.vue';
import router from './router';
import store from './store';

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;

Vue.db = new Dexie('lucky-draw-app');
Vue.db.version(1)
  .stores({
    award: '++id,&serial_no,name',
    driver: '++id,&serial_no,name',
    diver_award_preselect: '++id,drive_no,award_no',
    diver_award_curselect: '++id,drive_no,award_no',
    luck_draw: '++id,round,$award_no,$drive_no',
  });

// Vue.db.open().catch((e) => {
//   console.error(`Indexed Open failed: ${e.stack}`);
// });

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
}).$mount('#app');
