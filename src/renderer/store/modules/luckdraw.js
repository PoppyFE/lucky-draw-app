/* eslint-disable */

import Award from '../../db/Award';
import Driver from '../../db/Driver';
import AwardPreselect from '../../db/AwardPreselect';
import Luckdraw from '../../db/Luckdraw'

const state = {
  item: null,
  list: [],
  results: [],
};

const mutations = {
  LOAD_LUCKDRAW(state, item) {
    state.item = item;
  },

  UPDATE_LUCKDRAW(luckdraw) {
    state.list.push(luckdraw);
  },
  
  LOAD_LUCKDRAW_RESULT(state, list) {
    state.results = list;
  },
};

const actions = {
  // 获取当前抽奖奖项
  LOAD_LUCKDRAW({ commit }) {
    return Promise.resolve({})
      .then((results) => {
        // 所有奖品
        return Award.db.toArray()
          .then((awards)=>{
            results.awards = awards;
            results.awardsMap = {};
            awards.forEach((award)=> {
              results.awardsMap[award.serial_no] = award;
            });
            return results;
          })
      })
      .then((results)=>{
        // 所有司机
        return Driver.db.toArray()
          .then((drivers)=>{
            results.drivers = drivers;
            results.driversMap = {};
            drivers.forEach((driver)=> {
              results.driversMap[driver.serial_no] = driver;
            });
            return results;
          })
      })
      .then((results) => {
        // 所有司机预选
        return AwardPreselect.db.toArray()
          .then((awardPreselects)=>{
            results.awardPreselects = awardPreselects;
            results.awardPreselectsMapAward = {};
            results.awardPreselectsMapDriver = {};
            awardPreselects.forEach((awardPreselect)=> {
              const { driversMap, awardsMap } = results;
              if (driversMap[awardPreselect.driver_no] && awardsMap[awardPreselect.award_no]) {
                // 1个奖品被多个人选
                if (!results.awardPreselectsMapAward[awardPreselect.award_no]) {
                  results.awardPreselectsMapAward[awardPreselect.award_no] = [];
                }
                results.awardPreselectsMapAward[awardPreselect.award_no].push(driversMap[awardPreselect.driver_no]);

                // 1个人选多个奖品
                if (!results.awardPreselectsMapDriver[awardPreselect.driver_no]) {
                  results.awardPreselectsMapDriver[awardPreselect.driver_no] = [];
                }
                results.awardPreselectsMapDriver[awardPreselect.driver_no].push(awardsMap[awardPreselect.award_no]);
              }
            });
            return results;
          })
      })
      .then((results) => {
        // 所有获奖
        return Luckdraw.db.toArray()
          .then((luckdraws)=>{
            results.luckdraws = luckdraws;
            results.luckdrawMapDriver = {};
            results.luckdrawMapAward = {};
            luckdraws.forEach((luckdraw) => {
              const { driversMap, awardsMap, awardPreselectsMapAward } = results;
              if (awardsMap[luckdraw.award_no] && driversMap[luckdraw.driver_no]) {
                results.luckdrawMapDriver[luckdraw.driver_no] = luckdraw;
                results.luckdrawMapAward[luckdraw.award_no] = luckdraw;
              }
            });
            return results;
          })
      })
      .then((results)=>{// 排除已经抽过的奖品 剩余奖品
        const {luckdrawMapAward, awards} = results;
        results.filterAwards = awards
          .filter((award) => {
            if (luckdrawMapAward[award.serial_no]) {
              return false;
            }
            return true;
          });
        return results;
      })
      .then((results) => {// 排除已经抽过的奖品 剩余的司机
        const {luckdrawMapDriver} = results;
        results.filterDrivers = results.drivers
          .filter((driver) => {
            if (luckdrawMapDriver[driver.serial_no]) {
              return false;
            }
            return true;
          });
        return results;
      })
      .then((results)=>{// 奖品排序
        const {filterAwards,awardPreselectsMapAward} = results;
        // 排除已经抽过的奖品
        const sortAwards = filterAwards
          .sort((awardA, awardB)=>{
            const awardADrivers = awardPreselectsMapAward[awardA.serial_no];
            let awardADriversCount = awardADrivers ? awardADrivers.length : 0;
            // 这里的0 认为是最大值，这样方便排序
            if (awardADriversCount === 0) awardADriversCount = 9999;
            const awardBDrivers = awardPreselectsMapAward[awardB.serial_no];
            let awardBDriversCount = awardBDrivers ? awardBDrivers.length : 0;
            if (awardBDriversCount === 0) awardBDriversCount = 9999;

            // 大于排队到后面
            if (awardADriversCount > awardBDriversCount) {
              return 1;
            }

            if(awardADriversCount < awardBDriversCount) {
              return -1;
            }

            // 0 的情况 序号越大越在后面
            return awardA.serial_no > awardB.serial_no ? -1 : 1;
          });

        results.sortAwards = sortAwards;
        return results;
      })
      .then((results) => {// 挑选一个奖品
        results.luckDrawAward = results.sortAwards ? results.sortAwards[0] : null;
        return results;
      })
      .then((results)=>{// 排除已经抽过的奖品的预选司机
        const {luckDrawAward, luckdrawMapDriver, awardPreselectsMapAward } = results;
        if (!luckDrawAward) return results;

        results.filterPreselectDrivers = [...awardPreselectsMapAward[luckDrawAward.serial_no]]
          .filter((driver) => {
            if (luckdrawMapDriver[driver.serial_no]) {
              return false;
            }
            return true;
          });

         return results;
      })
      .then((results) => {//合并过滤预选司机和剩余未选司机
        const {filterPreselectDrivers, filterDrivers} = results;
        const luckdrawDrives = [];
        const drivesMap = {};

        if (filterPreselectDrivers) {
          filterPreselectDrivers.forEach((driver) => {
            if (!drivesMap[driver.serial_no]) {
              drivesMap[driver.serial_no] = driver;
              luckdrawDrives.push(driver);
            }
          });
        }

        if (filterDrivers) {
          filterDrivers.forEach((driver) => {
            if (!drivesMap[driver.serial_no]) {
              drivesMap[driver.serial_no] = driver;
              luckdrawDrives.push(driver);
            }
          });
        }

        results.luckdrawDrives = luckdrawDrives;
        return results;
      })
      .then((results) => {// 最后一步
        return {
          luckdrawAward: results.luckDrawAward,
          luckdrawDrives: results.luckdrawDrives,
        }
      })
      .then((item) => {
        commit('LOAD_LUCKDRAW', item);
      })
      .catch(err => {
        debugger;
        throw err;
      })
  },

  UPDATE_LUCKDRAW({ commit }, luckdrawData) {
    luckdrawData.create_at = new Date();
    luckdrawData.update_at = new Date();
    luckdrawData.driver_no + '-' + luckdrawData.award_no;
    return Luckdraw.db.add(awardData)
      .then(id => Luckdraw.db.get(id)
        .then((luckdraw) => {
          commit('UPDATE_LUCKDRAW', luckdraw);
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
  
  LOAD_LUCKDRAW_RESULT({commit}) {
    return Luckdraw.db.toArray()
      .then((luckdraws)=>{
        return Promise.all(luckdraws.map(luckdraw => {
          return Promise.all([
            Driver.db
              .where({serial_no: luckdraw.driver_no})
              .first(),
  
            Award.db
              .where({serial_no: luckdraw.award_no})
              .first(),
          ])
          .then(([driver, award])=> {
            return {
              ...luckdraw,
              drive_name: driver.name,
              drive_img: driver.img,
              award_name: award.name,
              award_img: award.img,
            }
          })
        }))
      })
      .then((results)=>{
        commit('LOAD_LUCKDRAW_RESULT', results);
      })
      .catch((err) => {
        throw err;
      })
  }
};

export default {
  state,
  mutations,
  actions,
};
