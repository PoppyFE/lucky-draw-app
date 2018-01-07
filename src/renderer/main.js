import Vue from 'vue';
import Dexie from 'dexie/dist/dexie.es';
import ElementUI from 'element-ui';
import TWEEN from '@tweenjs/tween.js';
import Howl from 'howler';

import 'element-ui/lib/theme-chalk/index.css';
import 'animate.css/animate.min.css';

import App from './App.vue';
import router from './router';
import store from './store';
import db from './db';

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
// Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = process.env.NODE_ENV !== 'production';
Dexie.debug = process.env.NODE_ENV !== 'production'; // In production, set to false to increase performance a little.

Vue.use(ElementUI);

window.Vue = Vue;
window.TWEEN = TWEEN;
window.Dexie = Dexie;
window.Howl = Howl.Howl;
Vue.prototype.$db = db;

/* eslint-disable no-new */
window.app = new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
}).$mount('#app');

window.DEBUGGER = false;


//
// if (typeof require !== 'undefined') {
//   const say = require('say');
//   Vue.prototype.$say = say;
// }

// callback(err, evt)
Vue.prototype.$say = (worlds, opts, callback) => {
  worlds = worlds || '';
  opts = opts || {};
  if (typeof opts === 'function') {
    callback = opts;
  }

  const utterance = new SpeechSynthesisUtterance(worlds);
  utterance.rate = 0.4;
  if (callback) {
    utterance.onend = (evt) => {
      callback(null, evt);
    };

    utterance.onerror = (err) => {
      callback(err);
    };
  }

  window.speechSynthesis.speak(utterance);
};
