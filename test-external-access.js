const http = require('http');
const https = require('https');

class ExternalAccessTester {
  constructor() {
    this.healthPort = process.env.HEALTH_PORT || 3001;
  }

  /**
   * 获取服务器IP地址
   */
  async getServerIP() {
    return new Promise((resolve, reject) => {
      const req = http.get('http://httpbin.org/ip', (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve(result.origin);
          } catch (error) {
            reject(error);
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('获取IP超时'));
      });
    });
  }

  /**
   * 测试健康检查接口
   */
  async testHealthCheck(host) {
    return new Promise((resolve, reject) => {
      const url = `http://${host}:${this.healthPort}/health`;
      console.log(`🔍 测试健康检查: ${url}`);
      
      const req = http.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve({
              status: res.statusCode,
              data: result
            });
          } catch (error) {
            reject(error);
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
   * 测试状态接口
   */
  async testStatusCheck(host) {
    return new Promise((resolve, reject) => {
      const url = `http://${host}:${this.healthPort}/status`;
      console.log(`🔍 测试状态检查: ${url}`);
      
      const req = http.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve({
              status: res.statusCode,
              data: result
            });
          } catch (error) {
            reject(error);
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
   * 运行测试
   */
  async runTests() {
    console.log('🌐 外部访问测试开始...\n');
    
    try {
      // 获取服务器IP
      console.log('📡 获取服务器IP...');
      const serverIP = await this.getServerIP();
      console.log(`✅ 服务器IP: ${serverIP}\n`);
      
      // 测试健康检查
      console.log('🏥 测试健康检查接口...');
      const healthResult = await this.testHealthCheck(serverIP);
      console.log(`✅ 健康检查状态: ${healthResult.status}`);
      console.log(`📊 应用状态: ${healthResult.data.status}`);
      console.log(`⏰ 运行时间: ${Math.floor(healthResult.data.uptime / 3600)}小时${Math.floor((healthResult.data.uptime % 3600) / 60)}分钟\n`);
      
      // 测试状态接口
      console.log('📈 测试状态接口...');
      const statusResult = await this.testStatusCheck(serverIP);
      console.log(`✅ 状态检查状态: ${statusResult.status}`);
      console.log(`🎂 生日数量: ${statusResult.data.birthdays}`);
      console.log(`⏰ 下次检查: ${new Date(statusResult.data.nextCheck).toLocaleString()}\n`);
      
      // 显示访问URL
      console.log('🌐 外部访问URL:');
      console.log(`  健康检查: http://${serverIP}:${this.healthPort}/health`);
      console.log(`  状态信息: http://${serverIP}:${this.healthPort}/status`);
      console.log(`  本地访问: http://localhost:${this.healthPort}/health`);
      
    } catch (error) {
      console.error(`❌ 测试失败: ${error.message}`);
      
      if (error.message.includes('ECONNREFUSED')) {
        console.log('\n💡 可能的原因:');
        console.log('1. 健康检查服务未启动');
        console.log('2. 防火墙阻止了端口访问');
        console.log('3. 服务配置问题');
        console.log('\n🔧 解决方案:');
        console.log('1. 启动服务: npm run pm2:start');
        console.log('2. 检查防火墙设置');
        console.log('3. 确认端口 3001 未被占用');
      }
    }
  }
}

// 如果直接运行此文件
if (require.main === module) {
  const tester = new ExternalAccessTester();
  tester.runTests();
}

module.exports = ExternalAccessTester; 