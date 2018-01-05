import Vue from 'vue';
import axios from 'axios';
import Dexie from 'dexie';
import ElementUI from 'element-ui';
import TWEEN from '@tweenjs/tween.js';

import 'element-ui/lib/theme-chalk/index.css';
import 'animate.css/animate.min.css';

import App from './App.vue';
import router from './router';
import store from './store';
import db from './db';

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = process.env.NODE_ENV !== 'production';
Dexie.debug = process.env.NODE_ENV !== 'production'; // In production, set to false to increase performance a little.

Vue.use(ElementUI);

window.Vue = Vue;
window.TWEEN = TWEEN;
window.Dexie = Dexie;
Vue.prototype.$db = db;

if (typeof require !== 'undefined') {
  const say = require('say');
  Vue.prototype.$say = say;
}

/* eslint-disable no-new */
window.app = new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
}).$mount('#app');
