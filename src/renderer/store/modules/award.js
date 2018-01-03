import Award from '../../db/Award';
import Driver from '../../db/Driver';
import AwardPreselect from '../../db/AwardPreselect';
import Luckdraw from '../../db/Luckdraw';

/* eslint-disable */

const state = {
  list: [],
};

const mutations = {

  INIT_AWARD_LIST(state, list) {
    state.list = list || [];
  },

  ADD_AWARD(state, award) {
    award.preselectDrivers = [];
    state.list.push(award);
  },

  UPDATE_AWARD(state, awardData) {
    state.list.forEach((award, idx) => {
      if (award.id === awardData.id) {
        window.Vue.set(state.list, idx, awardData);
      }
    });
  },

  REMOVE_AWARD(state, id) {
    state.list.forEach((award, idx) => {
      if (award.id === id) {
        window.Vue.delete(state.list, idx);
      }
    });
  },
};

const actions = {
  ADD_AWARD({ commit }, awardData) {
    awardData.create_at = new Date();
    awardData.update_at = new Date();

    return Award.db.add(awardData)
      .then(id => Award.db.get(id)
        .then((award) => {
          commit('ADD_AWARD', award);
        }))
      .catch((err) => {
        if (err.name === 'ConstraintError') {
          if (err.message.includes('serial_no')) {
            err.message = '抽奖序列号重复';
          }
        }
        throw err;
      });
  },

  UPDATE_AWARD({ commit }, awardData) {
    awardData.update_at = new Date();
    return Award.db.update(awardData.id, awardData)
      .then(() => Award.db.get(awardData.id))
      .then((award) => {
        commit('UPDATE_AWARD', award);
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

  REMOVE_AWARD({ commit }, award) {
    return Award.db.delete(award.id)
      .then(() => {
        return AwardPreselect.db
          .where({ award_no: award.serial_no })
          .delete()
          .catch(() => {
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
        commit('REMOVE_AWARD', award.id);
      })
      .catch((err) => {
        throw err;
      });
  },

  INIT_AWARD_LIST({ commit }) {
    return Award.db.toArray()
      .then(awards => Promise.all(awards.map(award => AwardPreselect.db
        .where({ award_no: award.serial_no })
        .toArray()
        .then(preSelects =>
          // 查询被所选司机们
          Promise.all(
            preSelects.map(item => Driver.db.where({ serial_no: item.driver_no }).first()))
            .then((val) => {
              award.preselectDrivers = val;
              return award;
            }),
        )
        .catch(() => award))))
      .then((awards) => {
        commit('INIT_AWARD_LIST', awards);
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
