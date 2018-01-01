class Award {
}

Award.init = (db, NAME) => {
  db.sql_vers[NAME] = '++id,&serial_no';
};

export default Award;
