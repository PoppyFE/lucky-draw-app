import Driver from '../../db/Driver';
import AwardPreselect from '../../db/AwardPreselect';
import Award from '../../db/Award';

/* eslint-disable */
const state = {
  list: [],
};

const mutations = {

  INIT_DRIVER_LIST(state, list) {
    state.list = list || [];
  },

  ADD_DRIVER(state, driver) {
    if (!driver.preselectAwards) {
      driver.preselectAwards = [];
    }
    state.list.push(driver);
  },

  UPDATE_DRIVER(state, driverData) {
    state.list.forEach((driver, idx) => {
      if (driver.id === driverData.id) {
        window.Vue.set(state.list, idx, driverData);
      }
    });
  },

  REMOVE_DRIVER(state, id) {
    state.list.forEach((driver, idx) => {
      if (driver.id === id) {
        window.Vue.delete(state.list, idx);
      }
    });
  },

  UPDATE_AWARD_DIVER_PRESELECT(state, driverData) {
    state.list.forEach((driver) => {
      if (driver.serial_no === driverData.driver_no) {
        driver.preselectAwards = driverData.preselectAwards || [];
      }
    });
  },
};

const actions = {
  ADD_DRIVER({ commit }, driverData) {
    driverData.create_at = new Date();
    driverData.update_at = new Date();

    return Driver.db.add(driverData)
      .then((val) => {
        commit('ADD_DRIVER', driverData);
        return val;
      })
      .catch((err) => {
        if (err.name === 'ConstraintError') {
          if (err.message.includes('serial_no')) {
            err.message = '抽奖序列号重复';
          }
        }
        throw err;
      });
  },

  UPDATE_DRIVER({ commit }, driverData) {
    driverData.update_at = new Date();
    return Driver.db.update(driverData.id, driverData)
      .then(() => {
        commit('UPDATE_DRIVER', driverData);
        return driverData;
      })
      .catch((err) => {
        if (err.name === 'ConstraintError') {
          if (err.message.includes('serial_no')) {
            err.message = '司机序列号重复';
          }
        }
        throw err;
      });
  },

  UPDATE_AWARD_DIVER_PRESELECT({ commit }, driveData) {
    const { preselectAwards = [] } = driveData;

    return AwardPreselect.db
      .where({'driver_no':driveData.driver_no})
      .delete()
      .then(() => {
        const lists = preselectAwards.map(item => ({
          driver_no: driveData.driver_no,
          award_no: item.serial_no,
          serial_no: driveData.driver_no + '-' + item.serial_no,
          create_at: new Date(),
          update_at: new Date(),
        }));

        if (lists.length <= 0) {
          return [];
        }

        return AwardPreselect.db.bulkAdd(lists)
          .then(() => preselectAwards);
      })
      .then((preselectAwards) => {
        commit('UPDATE_AWARD_DIVER_PRESELECT', { preselectAwards, driver_no: driveData.driver_no });
      })
      .catch((err) => {
        console.error(err);
        throw err;
      });
  },

  REMOVE_DRIVER({ commit }, driver) {
    return Driver.db.delete(driver.id)
      .then(() => {
        return AwardPreselect.db
          .where({'driver_no': driver.serial_no})
          .delete()
          .catch(()=>{
          });
      })
      .then(() => {
        return Luckdraw.db
          .where({ award_no: award.serial_no })
          .delete()
          .catch(() => {
          });
      })
      .then(() => {
        commit('REMOVE_DRIVER', driver.id);
      })
      .catch((err) => {
        throw err;
      });
  },

  INIT_DRIVER_LIST({ commit }) {
    return Driver.db.toArray()
      .then(drivers => Promise.all(drivers.map(driver => {
        // 寻找挑选的奖品
        return AwardPreselect.db
          .where({'driver_no': driver.serial_no})
          .toArray()
          .then((preSelects) => {
            // 查询所选奖品
            return Promise.all(preSelects.map(item => {
              return Award.db.where({serial_no: item.award_no}).first();
            })).then(val => {
                driver.preselectAwards = val;
                return driver;
              });
          })
          .catch(() => {
            driver.preselectAwards = [];
            return driver
          });
      })))
      .then((drivers) => {
        commit('INIT_DRIVER_LIST', drivers);
      })
      .catch((err) => {
        throw err;
      });
  },
};

export default {
  state,
  mutations,
  actions,
};
