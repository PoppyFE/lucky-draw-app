class AwardPreselect {
}

AwardPreselect.init = (db, NAME) => {
  db.sql_vers[NAME] = '++id,&serial_no,driver_no,award_no';
};

export default AwardPreselect;
