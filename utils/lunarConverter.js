const Lunar = require('lunar-javascript').Lunar;

class LunarConverter {
  /**
   * 获取指定农历日期对应的公历日期
   * @param {number} lunarMonth 农历月
   * @param {number} lunarDay 农历日
   * @param {number} year 公历年（可选，默认为当前年）
   * @returns {Date} 公历日期
   */
  static getSolarDate(lunarMonth, lunarDay, year = new Date().getFullYear()) {
    let day = lunarDay;
    while (day > 0) {
      try {
        const lunar = Lunar.fromYmd(year, lunarMonth, day);
        const solar = lunar.getSolar();
        return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());
      } catch (error) {
        // 如果是无效日期，递减一天再试
        day--;
        if (day === 0) {
          console.error('农历转换错误: 该月无有效日期', error);
          return null;
        }
      }
    }
    return null;
  }

  /**
   * 获取下一个农历生日的公历日期
   * @param {number} lunarMonth 农历月
   * @param {number} lunarDay 农历日
   * @returns {Date} 下一个生日的公历日期
   */
  static getNextBirthday(lunarMonth, lunarDay) {
    const currentYear = new Date().getFullYear();
    const currentDate = new Date();
    let tryYear = currentYear;
    let birthday = null;
    let tryCount = 0;
    // 最多查5年，防止死循环
    while (tryCount < 5) {
      birthday = this.getSolarDate(lunarMonth, lunarDay, tryYear);
      if (birthday && birthday >= currentDate) {
        return birthday;
      }
      tryYear++;
      tryCount++;
    }
    return null;
  }

  /**
   * 计算距离生日的天数
   * @param {Date} birthday 生日日期
   * @returns {number} 距离生日的天数
   */
  static getDaysUntilBirthday(birthday) {
    if (!birthday) return null;
    
    const now = new Date();
    const timeDiff = birthday.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return daysDiff;
  }

  /**
   * 检查今天是否是生日
   * @param {Date} birthday 生日日期
   * @returns {boolean}
   */
  static isTodayBirthday(birthday) {
    if (!birthday) return false;
    
    const today = new Date();
    return birthday.getMonth() === today.getMonth() && 
           birthday.getDate() === today.getDate();
  }

  /**
   * 检查是否在提醒时间范围内
   * @param {number} daysUntil 距离生日的天数
   * @returns {Object} 提醒状态
   */
  static getReminderStatus(daysUntil) {
    if (daysUntil === null || daysUntil < 0) {
      return { shouldRemind: false, type: 'none' };
    }

    if (daysUntil === 0) {
      return { shouldRemind: true, type: 'birthday' };
    }

    if (daysUntil <= 7) {
      return { shouldRemind: true, type: 'daily' };
    }

    if (daysUntil <= 28) {
      // 检查是否是周日
      const today = new Date();
      const isSunday = today.getDay() === 0;
      return { 
        shouldRemind: isSunday, 
        type: isSunday ? 'weekly' : 'none' 
      };
    }

    return { shouldRemind: false, type: 'none' };
  }
}

module.exports = LunarConverter; 