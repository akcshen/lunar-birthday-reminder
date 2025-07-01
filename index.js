const cron = require('node-cron');
const readline = require('readline');
require('dotenv').config();

const BirthdayService = require('./services/birthdayService');

class BirthdayReminderApp {
  constructor() {
    this.birthdayService = new BirthdayService();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * 启动应用
   */
  async start() {
    console.log('🎂 农历生日提醒系统启动');
    console.log('='.repeat(50));
    
    // 检查环境变量
    this.checkEnvironment();
    
    // 启动定时任务
    this.startScheduler();
    
    // 显示菜单
    this.showMenu();
  }

  /**
   * 检查环境变量配置
   */
  checkEnvironment() {
    const requiredEnvVars = [
      'EMAIL_HOST',
      'EMAIL_PORT', 
      'EMAIL_USER',
      'EMAIL_PASS',
      'EMAIL_FROM',
      'REMINDER_EMAIL'
    ];

    const missing = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      console.log('⚠️  缺少环境变量配置:');
      missing.forEach(varName => console.log(`   - ${varName}`));
      console.log('\n请复制 env.example 为 .env 并填写正确的配置信息');
      console.log('或者使用命令行参数进行配置\n');
    } else {
      console.log('✅ 环境变量配置完整');
    }
  }

  /**
   * 启动定时任务
   */
  startScheduler() {
    // 每天上午9点检查生日提醒
    cron.schedule('0 9 * * *', async () => {
      console.log('\n⏰ 定时任务触发 - 检查生日提醒');
      await this.birthdayService.checkAndSendReminders();
    }, {
      timezone: 'Asia/Shanghai'
    });

    console.log('⏰ 定时任务已启动 - 每天上午9点检查生日提醒');
  }

  /**
   * 显示主菜单
   */
  showMenu() {
    console.log('\n📋 主菜单:');
    console.log('1. 查看所有生日');
    console.log('2. 添加生日');
    console.log('3. 删除生日');
    console.log('4. 立即检查生日提醒');
    console.log('5. 测试邮件配置');
    console.log('6. 退出');
    console.log('='.repeat(30));

    this.rl.question('请选择操作 (1-6): ', async (answer) => {
      await this.handleMenuChoice(answer.trim());
    });
  }

  /**
   * 处理菜单选择
   */
  async handleMenuChoice(choice) {
    switch (choice) {
      case '1':
        await this.listBirthdays();
        break;
      case '2':
        await this.addBirthday();
        break;
      case '3':
        await this.removeBirthday();
        break;
      case '4':
        await this.checkReminders();
        break;
      case '5':
        await this.testEmail();
        break;
      case '6':
        this.exit();
        break;
      default:
        console.log('❌ 无效选择，请重新输入');
        this.showMenu();
        return;
    }
    
    // 操作完成后重新显示菜单
    setTimeout(() => this.showMenu(), 1000);
  }

  /**
   * 查看所有生日
   */
  async listBirthdays() {
    await this.birthdayService.listBirthdays();
  }

  /**
   * 添加生日
   */
  async addBirthday() {
    this.rl.question('请输入姓名: ', async (name) => {
      this.rl.question('请输入农历月份 (1-12): ', async (month) => {
        this.rl.question('请输入农历日期 (1-30): ', async (day) => {
          this.rl.question('请输入邮箱地址 (可选，回车跳过): ', async (email) => {
            try {
              await this.birthdayService.addBirthday(name, month, day, email || null);
            } catch (error) {
              console.error('❌ 添加生日失败:', error.message);
            }
          });
        });
      });
    });
  }

  /**
   * 删除生日
   */
  async removeBirthday() {
    this.rl.question('请输入要删除的姓名: ', async (name) => {
      try {
        await this.birthdayService.removeBirthday(name);
      } catch (error) {
        console.error('❌ 删除生日失败:', error.message);
      }
    });
  }

  /**
   * 立即检查生日提醒
   */
  async checkReminders() {
    console.log('🔍 立即检查生日提醒...');
    await this.birthdayService.checkAndSendReminders();
  }

  /**
   * 测试邮件配置
   */
  async testEmail() {
    await this.birthdayService.testEmail();
  }

  /**
   * 退出应用
   */
  exit() {
    console.log('👋 感谢使用农历生日提醒系统！');
    this.rl.close();
    process.exit(0);
  }
}

// 处理命令行参数
async function handleCommandLineArgs() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // 启动交互式界面
    const app = new BirthdayReminderApp();
    await app.start();
    return;
  }

  const birthdayService = new BirthdayService();
  
  switch (args[0]) {
    case 'list':
      await birthdayService.listBirthdays();
      break;
      
    case 'add':
      if (args.length < 4) {
        console.log('用法: node index.js add <姓名> <农历月> <农历日> [邮箱]');
        process.exit(1);
      }
      await birthdayService.addBirthday(args[1], args[2], args[3], args[4]);
      break;
      
    case 'remove':
      if (args.length < 2) {
        console.log('用法: node index.js remove <姓名>');
        process.exit(1);
      }
      await birthdayService.removeBirthday(args[1]);
      break;
      
    case 'check':
      await birthdayService.checkAndSendReminders();
      break;
      
    case 'test':
      await birthdayService.testEmail();
      break;
      
    case 'help':
      console.log(`
农历生日提醒系统 - 命令行使用说明

用法: node index.js [命令] [参数]

命令:
  list                   查看所有生日
  add <姓名> <月> <日> [邮箱]  添加生日
  remove <姓名>          删除生日
  check                  立即检查生日提醒
  test                   测试邮件配置
  help                   显示帮助信息

示例:
  node index.js list
  node index.js add 妈妈 7 15
  node index.js remove 妈妈
  node index.js check
  node index.js test

不带参数启动将进入交互式界面。
      `);
      break;
      
    default:
      console.log('❌ 未知命令。使用 "node index.js help" 查看帮助信息。');
      process.exit(1);
  }
  
  process.exit(0);
}

// 启动应用
if (require.main === module) {
  handleCommandLineArgs().catch(error => {
    console.error('❌ 应用启动失败:', error);
    process.exit(1);
  });
}

module.exports = BirthdayReminderApp; 