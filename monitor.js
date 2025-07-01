const https = require('https');
const http = require('http');
const nodemailer = require('nodemailer');
require('dotenv').config();

class AppMonitor {
  constructor() {
    this.healthUrl = process.env.HEALTH_URL || 'http://localhost:3001/health';
    this.statusUrl = process.env.STATUS_URL || 'http://localhost:3001/status';
    this.checkInterval = parseInt(process.env.CHECK_INTERVAL) || 300000; // 5分钟
    this.emailTransporter = null;
    
    if (process.env.EMAIL_HOST) {
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT == 465,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    }
  }

  /**
   * 发送HTTP请求
   */
  async makeRequest(url) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      
      const req = client.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (error) {
            reject(new Error(`解析响应失败: ${error.message}`));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('请求超时'));
      });
    });
  }

  /**
   * 检查应用健康状态
   */
  async checkHealth() {
    try {
      console.log(`🔍 检查应用健康状态: ${new Date().toLocaleString()}`);
      
      const healthData = await this.makeRequest(this.healthUrl);
      const statusData = await this.makeRequest(this.statusUrl);
      
      const report = {
        timestamp: new Date().toISOString(),
        health: healthData,
        status: statusData,
        isHealthy: healthData.status === 'healthy'
      };
      
      console.log(`✅ 应用状态: ${healthData.status}`);
      console.log(`📊 生日数量: ${statusData.birthdays}`);
      console.log(`⏰ 下次检查: ${new Date(statusData.nextCheck).toLocaleString()}`);
      
      // 如果应用不健康，发送告警
      if (!report.isHealthy) {
        await this.sendAlert(report);
      }
      
      return report;
    } catch (error) {
      console.error(`❌ 健康检查失败: ${error.message}`);
      
      const errorReport = {
        timestamp: new Date().toISOString(),
        error: error.message,
        isHealthy: false
      };
      
      await this.sendAlert(errorReport);
      return errorReport;
    }
  }

  /**
   * 发送告警邮件
   */
  async sendAlert(report) {
    if (!this.emailTransporter || !process.env.MONITOR_EMAIL) {
      console.log('⚠️  未配置邮件发送，跳过告警');
      return;
    }
    
    try {
      const subject = report.isHealthy ? 
        '🎂 生日提醒系统状态正常' : 
        '🚨 生日提醒系统异常告警';
      
      const html = this.generateAlertEmail(report);
      
      await this.emailTransporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: process.env.MONITOR_EMAIL,
        subject: subject,
        html: html
      });
      
      console.log('📧 告警邮件已发送');
    } catch (error) {
      console.error('❌ 发送告警邮件失败:', error.message);
    }
  }

  /**
   * 生成告警邮件内容
   */
  generateAlertEmail(report) {
    if (report.error) {
      return `
        <h2>🚨 生日提醒系统监控告警</h2>
        <p><strong>时间:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
        <p><strong>错误:</strong> ${report.error}</p>
        <p>请检查服务器和应用状态。</p>
      `;
    }
    
    const health = report.health;
    const status = report.status;
    
    return `
      <h2>${health.status === 'healthy' ? '✅' : '⚠️'} 生日提醒系统状态报告</h2>
      <p><strong>检查时间:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
      <p><strong>应用状态:</strong> ${health.status}</p>
      <p><strong>运行时间:</strong> ${Math.floor(health.uptime / 3600)}小时${Math.floor((health.uptime % 3600) / 60)}分钟</p>
      <p><strong>生日数量:</strong> ${status.birthdays}</p>
      <p><strong>下次检查:</strong> ${new Date(status.nextCheck).toLocaleString()}</p>
      
      <h3>文件状态</h3>
      <ul>
        <li>生日数据: ${health.files.birthdays ? '✅' : '❌'}</li>
        <li>日志目录: ${health.files.logs ? '✅' : '❌'}</li>
      </ul>
      
      <h3>环境配置</h3>
      <p>配置状态: ${health.environment.configured ? '✅ 完整' : '❌ 不完整'}</p>
      ${health.environment.missing.length > 0 ? 
        `<p>缺少变量: ${health.environment.missing.join(', ')}</p>` : 
        '<p>所有必需环境变量已配置</p>'
      }
      
      <h3>内存使用</h3>
      <ul>
        <li>RSS: ${Math.round(health.memory.rss / 1024 / 1024)} MB</li>
        <li>堆内存: ${Math.round(health.memory.heapUsed / 1024 / 1024)} MB</li>
      </ul>
    `;
  }

  /**
   * 启动监控
   */
  start() {
    console.log('🔍 启动应用监控...');
    console.log(`📊 健康检查地址: ${this.healthUrl}`);
    console.log(`📈 状态检查地址: ${this.statusUrl}`);
    console.log(`⏰ 检查间隔: ${this.checkInterval / 1000}秒`);
    
    // 立即执行一次检查
    this.checkHealth();
    
    // 设置定时检查
    setInterval(() => {
      this.checkHealth();
    }, this.checkInterval);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  const monitor = new AppMonitor();
  monitor.start();
}

module.exports = AppMonitor; 