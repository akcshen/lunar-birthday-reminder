const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailSender {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == 465, // 465端口用SSL，587端口不用SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  /**
   * 发送生日提醒邮件
   * @param {Object} birthdayInfo 生日信息
   * @param {string} reminderType 提醒类型
   * @param {number} daysUntil 距离生日的天数
   */
  async sendBirthdayReminder(birthdayInfo, reminderType, daysUntil) {
    const { name, lunarMonth, lunarDay } = birthdayInfo;
    
    let subject, content;
    
    switch (reminderType) {
      case 'birthday':
        subject = `🎉 今天是${name}的生日！`;
        content = `
          <h2>🎂 生日快乐！</h2>
          <p>今天是${name}的农历${lunarMonth}月${lunarDay}日生日！</p>
          <p>记得送上祝福哦～</p>
        `;
        break;
        
      case 'daily':
        subject = `📅 ${name}的生日还有${daysUntil}天`;
        content = `
          <h2>📅 生日倒计时</h2>
          <p>${name}的农历${lunarMonth}月${lunarDay}日生日还有 <strong>${daysUntil}天</strong> 就到了！</p>
          <p>是时候准备礼物和祝福了～</p>
        `;
        break;
        
      case 'weekly':
        subject = `📅 ${name}的生日还有${daysUntil}天（周提醒）`;
        content = `
          <h2>📅 生日周提醒</h2>
          <p>${name}的农历${lunarMonth}月${lunarDay}日生日还有 <strong>${daysUntil}天</strong> 就到了！</p>
          <p>还有充足的时间准备，记得提前安排哦～</p>
        `;
        break;
        
      default:
        return;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.REMINDER_EMAIL,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 10px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎂 生日提醒系统</h1>
            </div>
            <div class="content">
              ${content}
            </div>
            <div class="footer">
              <p>此邮件由农历生日提醒系统自动发送</p>
              <p>发送时间: ${new Date().toLocaleString('zh-CN')}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ 邮件发送成功: ${name} - ${reminderType}`);
      console.log(`📧 邮件ID: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error(`❌ 邮件发送失败: ${name} - ${reminderType}`, error);
      return false;
    }
  }

  /**
   * 测试邮件配置
   */
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ 邮件服务器连接成功');
      return true;
    } catch (error) {
      console.error('❌ 邮件服务器连接失败:', error);
      return false;
    }
  }
}

module.exports = EmailSender; 