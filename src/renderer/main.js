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
    friends: '++id,name,age'
  });

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
}).$mount('#app');
