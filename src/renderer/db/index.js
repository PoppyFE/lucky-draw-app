import Dexie from 'dexie';

const files = require.context('.', false, /\.js$/);
const modules = {};

files.keys().forEach((key) => {
  if (key === './index.js') return;
  modules[key.replace(/(\.\/|\.js)/g, '')] = files(key).default;
});

const db = new Dexie('lucky-draw-app');
db.sql_vers = {};

Object.keys(modules).forEach((name) => {
  const module = modules[name];
  module.init(db, name);
  db.version(1).stores(db.sql_vers);
  db[name].mapToClass(module);
  module.db = db[name];
});

export default db;
