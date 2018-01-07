/* eslint-disable */

import Award from '../../db/Award';
import Driver from '../../db/Driver';
import AwardPreselect from '../../db/AwardPreselect';
import Luckdraw from '../../db/Luckdraw'

const state = {
};

const mutations = {
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
            results.totalAwardsCount = awards ? awards.length : 0;
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
            results.totalDriversCount = drivers ? drivers.length : 0;
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
            results.totalSelectedAwardsCount = results.totalSelectedDriversCount = luckdraws ? luckdraws.length : 0;
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

        results.filterPreselectDrivers = awardPreselectsMapAward[luckDrawAward.serial_no] ?
          [...awardPreselectsMapAward[luckDrawAward.serial_no]] : []
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

        if ((!filterPreselectDrivers || filterPreselectDrivers.length === 0) && filterDrivers) {
          filterDrivers.forEach((driver) => {
            if (!drivesMap[driver.serial_no]) {
              drivesMap[driver.serial_no] = driver;
              luckdrawDrives.push(driver);
            }
          });
        }

        results.luckdrawDrivers = luckdrawDrives;
        return results;
      })
      .then((results) => {// 最后一步
        const result = {
          luckdrawAward: results.luckDrawAward,
          luckdrawDrives: results.luckdrawDrivers,

          totalAwardsCount: results.totalAwardsCount,
          totalDriversCount: results.totalDriversCount,
          totalSelectedAwardsCount:results.totalSelectedAwardsCount,
          totalSelectedDriversCount: results.totalSelectedDriversCount,
        };

        if (results.luckdrawDrivers && results.luckdrawDrivers.length === 1) {
          const singleDriver = results.luckdrawDrivers[0];
          const copySingleDriver = Object.assign({}, singleDriver);
          copySingleDriver.need_show = true;
          results.luckdrawDrivers.push(copySingleDriver);
        }

        if (results.totalAwardsCount <= 0) {
          result.error = true;
          result.errorMsg = '没有奖品 怎么开始抽奖！';
        } else if (results.totalDriversCount <= 0) {
          result.error = true;
          result.errorMsg = '没有司机！ 怎么开始抽奖！';
        } else if (results.totalSelectedAwardsCount >= results.totalAwardsCount) {
          result.error = true;
          result.errorMsg = '奖品已经被司机拿光了 不能开始抽奖！';
        } else if (results.totalSelectedDriversCount === results.totalDriversCount) {
          result.error = true;
          result.errorMsg = '所有司机已经抽完奖，抽奖结束！ 不能开始抽奖！';
        }

        if (result.error) {
          throw result;
        }

        return result;
      })
      // .then((item) => {
      //   commit('LOAD_LUCKDRAW', item);
      // })
      .catch(err => {
        throw err;
      })
  },

  ADD_LUCKDRAW({ commit }, data) {

    const luckdrawData = {
      create_at: new Date(),
      update_at: new Date(),
      serial_no: data.driver_no + '-' + data.award_no,
      driver_no: data.driver_no,
      award_no: data.award_no,
    };

    const luckdrawDrivers = data.luckdrawDrivers
      .filter((driver) => {
        if (driver.need_show) return false;
        return true;
      });

    Promise.all(luckdrawDrivers.map((driver) => {
      // 参与次数
      let luckdraw_count = driver.luckdraw_count || 0;
      luckdraw_count = luckdraw_count + 1;

      return Driver.db.update(driver.id, {luckdraw_count});
    }))
    .then(()=>{
      return Luckdraw.db.add(luckdrawData)
        .then(id => {
          return Luckdraw.db.get(id);
        });
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

  LOAD_LUCKDRAW_RESULT({commit}) {
    return Luckdraw.db.toArray()
      .then((luckdraws) => {
        return Promise.all(luckdraws.map(luckdraw => {
          return Promise.all([
              Driver.db
                .where({serial_no: luckdraw.driver_no})
                .first(),

              Award.db
                .where({serial_no: luckdraw.award_no})
                .first(),

            ])
            .then(([driver, award]) => {
              return {
                ...luckdraw,
                driver_name: driver.name,
                driver_img: driver.img,
                award_name: award.name,
                award_img: award.img,
              }
            })
        }))
      })
      .then((results) => {
        return results;
      })
      .catch((err) => {
        throw err;
      })
  },

  RESET_LUCKDRAW() {
    return Promise.all([
      AwardPreselect.db.clear(),
      Luckdraw.db.clear(),
      Driver.db.toArray()
        .then((drivers)=>{
          return Promise.all(drivers.map(driver => {
            return Driver.db.update(driver, {luckdraw_count: 0});
          }));
        })
    ])
      .catch((error) => {
        console.error(error);
        throw error;
      })
  }
};

export default {
  state,
  mutations,
  actions,
};
