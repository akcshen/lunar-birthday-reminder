const fs = require('fs').promises;
const path = require('path');
const LunarConverter = require('../utils/lunarConverter');
const EmailSender = require('../utils/emailSender');

class BirthdayService {
  constructor() {
    this.birthdaysFile = path.join(__dirname, '../birthdays.json');
    this.emailSender = new EmailSender();
    this.sentReminders = new Map(); // 用于记录已发送的提醒，避免重复发送
  }

  /**
   * 加载生日数据
   */
  async loadBirthdays() {
    try {
      const data = await fs.readFile(this.birthdaysFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ 读取生日数据失败:', error);
      return [];
    }
  }

  /**
   * 保存生日数据
   */
  async saveBirthdays(birthdays) {
    try {
      await fs.writeFile(this.birthdaysFile, JSON.stringify(birthdays, null, 2), 'utf8');
      console.log('✅ 生日数据保存成功');
    } catch (error) {
      console.error('❌ 保存生日数据失败:', error);
    }
  }

  /**
   * 添加新的生日
   */
  async addBirthday(name, lunarMonth, lunarDay) {
    const birthdays = await this.loadBirthdays();
    const newBirthday = {
      name,
      lunarMonth: parseInt(lunarMonth),
      lunarDay: parseInt(lunarDay)
    };
    
    birthdays.push(newBirthday);
    await this.saveBirthdays(birthdays);
    console.log(`✅ 添加生日成功: ${name} (农历${lunarMonth}月${lunarDay}日)`);
  }

  /**
   * 删除生日
   */
  async removeBirthday(name) {
    const birthdays = await this.loadBirthdays();
    const filtered = birthdays.filter(b => b.name !== name);
    
    if (filtered.length === birthdays.length) {
      console.log(`❌ 未找到名为 "${name}" 的生日记录`);
      return false;
    }
    
    await this.saveBirthdays(filtered);
    console.log(`✅ 删除生日成功: ${name}`);
    return true;
  }

  /**
   * 列出所有生日
   */
  async listBirthdays() {
    const birthdays = await this.loadBirthdays();
    console.log('\n📅 生日列表:');
    console.log('='.repeat(50));
    
    for (const birthday of birthdays) {
      const nextBirthday = LunarConverter.getNextBirthday(birthday.lunarMonth, birthday.lunarDay);
      const daysUntil = LunarConverter.getDaysUntilBirthday(nextBirthday);
      
      console.log(`👤 ${birthday.name}`);
      console.log(`   📆 农历: ${birthday.lunarMonth}月${birthday.lunarDay}日`);
      console.log(`   📅 下次生日: ${nextBirthday ? nextBirthday.toLocaleDateString('zh-CN') : '计算错误'}`);
      console.log(`   ⏰ 还有 ${daysUntil !== null ? daysUntil : '未知'} 天`);
      console.log('   ' + '-'.repeat(40));
    }
  }

  /**
   * 检查并发送生日提醒
   */
  async checkAndSendReminders() {
    const birthdays = await this.loadBirthdays();
    const today = new Date().toDateString();
    
    console.log(`\n🔍 检查生日提醒 (${new Date().toLocaleString('zh-CN')})`);
    console.log('='.repeat(50));

    for (const birthday of birthdays) {
      const nextBirthday = LunarConverter.getNextBirthday(birthday.lunarMonth, birthday.lunarDay);
      const daysUntil = LunarConverter.getDaysUntilBirthday(nextBirthday);
      const reminderStatus = LunarConverter.getReminderStatus(daysUntil);

      console.log(`\n👤 检查 ${birthday.name} 的生日:`);
      console.log(`   📅 农历: ${birthday.lunarMonth}月${birthday.lunarDay}日`);
      console.log(`   📆 下次生日: ${nextBirthday ? nextBirthday.toLocaleDateString('zh-CN') : '计算错误'}`);
      console.log(`   ⏰ 还有 ${daysUntil !== null ? daysUntil : '未知'} 天`);
      console.log(`   🔔 提醒状态: ${reminderStatus.type}`);

      if (reminderStatus.shouldRemind) {
        // 检查是否已经发送过今天的提醒
        const reminderKey = `${birthday.name}-${today}-${reminderStatus.type}`;
        
        if (!this.sentReminders.has(reminderKey)) {
          console.log(`   📧 发送 ${reminderStatus.type} 提醒邮件...`);
          
          const success = await this.emailSender.sendBirthdayReminder(
            birthday, 
            reminderStatus.type, 
            daysUntil
          );
          
          if (success) {
            this.sentReminders.set(reminderKey, true);
            console.log(`   ✅ 提醒邮件发送成功`);
          } else {
            console.log(`   ❌ 提醒邮件发送失败`);
          }
        } else {
          console.log(`   ⏭️ 今日已发送过 ${reminderStatus.type} 提醒，跳过`);
        }
      } else {
        console.log(`   ⏭️ 无需发送提醒`);
      }
    }

    // 清理过期的提醒记录（保留最近7天的记录）
    this.cleanupOldReminders();
  }

  /**
   * 清理过期的提醒记录
   */
  cleanupOldReminders() {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    for (const [key, timestamp] of this.sentReminders.entries()) {
      if (timestamp < sevenDaysAgo) {
        this.sentReminders.delete(key);
      }
    }
  }

  /**
   * 测试邮件配置
   */
  async testEmail() {
    console.log('🧪 测试邮件配置...');
    const success = await this.emailSender.testConnection();
    
    if (success) {
      // 发送测试邮件
      const testBirthday = {
        name: '测试用户',
        lunarMonth: 1,
        lunarDay: 1
      };
      
      await this.emailSender.sendBirthdayReminder(testBirthday, 'daily', 7);
    }
  }
}

module.exports = BirthdayService; 