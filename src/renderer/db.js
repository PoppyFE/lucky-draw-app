import Vue from 'vue';
import Dexie from 'dexie';

const db = new Dexie('lucky-draw-app');

db.version(1)
  .stores({
    award: '++id,&serial_no,name',
    driver: '++id,&serial_no,name',
    diver_award_preselect: '++id,drive_no,award_no',
    diver_award_curselect: '++id,drive_no,award_no',
    luck_draw: '++id,round,$award_no,$drive_no',
  });

Vue.db = Dexie;
Vue.prototype.$db = db;

export default db;