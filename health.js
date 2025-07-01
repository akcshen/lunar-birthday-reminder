const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.HEALTH_PORT || 3001;

// 健康检查接口
app.get('/health', (req, res) => {
  try {
    // 检查 birthdays.json 文件是否存在
    const birthdaysPath = path.join(__dirname, 'birthdays.json');
    const birthdaysExist = fs.existsSync(birthdaysPath);
    
    // 检查日志目录
    const logsPath = path.join(__dirname, 'logs');
    const logsExist = fs.existsSync(logsPath);
    
    // 检查环境变量
    const requiredEnvVars = [
      'EMAIL_HOST',
      'EMAIL_PORT', 
      'EMAIL_USER',
      'EMAIL_PASS',
      'EMAIL_FROM',
      'REMINDER_EMAIL'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    const status = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      files: {
        birthdays: birthdaysExist,
        logs: logsExist
      },
      environment: {
        missing: missingEnvVars,
        configured: missingEnvVars.length === 0
      }
    };
    
    if (missingEnvVars.length > 0) {
      status.status = 'warning';
      status.message = `缺少环境变量: ${missingEnvVars.join(', ')}`;
    }
    
    res.json(status);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// 应用状态接口
app.get('/status', (req, res) => {
  try {
    const birthdaysPath = path.join(__dirname, 'birthdays.json');
    let birthdays = [];
    
    if (fs.existsSync(birthdaysPath)) {
      const data = fs.readFileSync(birthdaysPath, 'utf8');
      birthdays = JSON.parse(data);
    }
    
    res.json({
      status: 'running',
      timestamp: new Date().toISOString(),
      birthdays: birthdays.length,
      nextCheck: getNextCheckTime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// 获取下次检查时间（每天上午9点）
function getNextCheckTime() {
  const now = new Date();
  const next = new Date();
  next.setHours(9, 0, 0, 0);
  
  if (now.getHours() >= 9) {
    next.setDate(next.getDate() + 1);
  }
  
  return next.toISOString();
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏥 健康检查服务启动在端口 ${PORT}`);
  console.log(`📊 健康检查: http://0.0.0.0:${PORT}/health`);
  console.log(`📈 状态信息: http://0.0.0.0:${PORT}/status`);
  console.log(`🌐 外部访问: http://服务器IP:${PORT}/health`);
});

module.exports = app; 