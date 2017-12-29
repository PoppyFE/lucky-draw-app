import Vue from 'vue';
import axios from 'axios';
import Dexie from 'dexie';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import App from './App.vue';
import router from './router';
import store from './store';
import db from './db';

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = process.env.NODE_ENV !== 'production';
Dexie.debug = process.env.NODE_ENV !== 'production'; // In production, set to false to increase performance a little.

Vue.db = new Dexie('lucky-draw-app');

Vue.use(ElementUI);

Vue.db.open().catch((e) => {
//   console.error(`Indexed Open failed: ${e.stack}`);
// });

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
}).$mount('#app');
