# 服务器部署指南

## 快速部署

### 1. 上传文件到服务器
```bash
# 将整个项目文件夹上传到服务器
scp -r birthday/ user@your-server:/home/user/
```

### 2. 登录服务器并进入项目目录
```bash
ssh user@your-server
cd /home/user/birthday
```

### 3. 安装Node.js（如果未安装）
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

### 4. 配置环境变量
```bash
# 复制环境变量模板
cp env.example .env

# 编辑配置文件
nano .env
```

填写你的邮箱配置：
```env
EMAIL_HOST=smtp.163.com
EMAIL_PORT=465
EMAIL_USER=your-email@163.com
EMAIL_PASS=your-authorization-code
EMAIL_FROM=your-email@163.com
REMINDER_EMAIL=your-reminder-email@example.com
```

### 5. 安装依赖并测试
```bash
# 安装依赖
npm install --production

# 测试邮件配置
node index.js test

# 测试系统功能
node index.js list
```

## 运行方式

### 方式1：直接运行（开发测试）
```bash
node index.js
```

### 方式2：后台运行（推荐）
```bash
# 后台运行并输出日志
nohup node index.js > birthday.log 2>&1 &

# 查看进程
ps aux | grep node

# 查看日志
tail -f birthday.log

# 停止进程
pkill -f "node index.js"
```

### 方式3：使用PM2（推荐生产环境）
```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start index.js --name "birthday-reminder"

# 查看状态
pm2 status

# 查看日志
pm2 logs birthday-reminder

# 重启应用
pm2 restart birthday-reminder

# 停止应用
pm2 stop birthday-reminder

# 设置开机自启
pm2 startup
pm2 save
```

### 方式4：使用Systemd服务（推荐服务器）
```bash
# 编辑服务文件
sudo nano /etc/systemd/system/birthday-reminder.service
```

将以下内容复制到文件中（记得修改路径）：
```ini
[Unit]
Description=Lunar Birthday Reminder System
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/home/your-username/birthday
Environment=NODE_ENV=production
Environment=TZ=Asia/Shanghai
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# 重新加载systemd
sudo systemctl daemon-reload

# 启用服务
sudo systemctl enable birthday-reminder

# 启动服务
sudo systemctl start birthday-reminder

# 查看状态
sudo systemctl status birthday-reminder

# 查看日志
sudo journalctl -u birthday-reminder -f

# 停止服务
sudo systemctl stop birthday-reminder
```

## 管理命令

### 查看生日列表
```bash
node index.js list
```

### 添加生日
```bash
node index.js add "姓名" 农历月 农历日 [邮箱]
```

### 删除生日
```bash
node index.js remove "姓名"
```

### 立即检查提醒
```bash
node index.js check
```

### 测试邮件
```bash
node index.js test
```

## 日志管理

### 查看应用日志
```bash
# 如果使用nohup
tail -f birthday.log

# 如果使用PM2
pm2 logs birthday-reminder

# 如果使用systemd
sudo journalctl -u birthday-reminder -f
```

### 日志轮转（防止日志文件过大）
```bash
# 创建logrotate配置
sudo nano /etc/logrotate.d/birthday-reminder
```

添加以下内容：
```
/home/your-username/birthday/birthday.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 your-username your-username
    postrotate
        pkill -f "node index.js" || true
    endscript
}
```

## 故障排除

### 1. 邮件发送失败
- 检查邮箱配置是否正确
- 确认授权码是否有效
- 检查网络连接

### 2. 定时任务不工作
- 检查系统时间是否正确
- 确认时区设置（Asia/Shanghai）
- 查看应用日志

### 3. 应用无法启动
- 检查Node.js版本（建议18+）
- 确认依赖安装完整
- 查看错误日志

### 4. 权限问题
- 确保文件权限正确
- 检查用户权限
- 确认目录路径正确

## 安全建议

1. **防火墙设置**：只开放必要端口
2. **用户权限**：使用非root用户运行
3. **文件权限**：保护.env文件
4. **日志管理**：定期清理日志文件
5. **备份数据**：定期备份birthdays.json

## 监控建议

1. **进程监控**：确保应用持续运行
2. **邮件监控**：定期检查邮件发送状态
3. **日志监控**：关注错误日志
4. **资源监控**：监控CPU和内存使用 