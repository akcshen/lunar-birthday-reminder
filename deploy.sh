#!/bin/bash

# 农历生日提醒系统 - 服务器部署脚本

echo "🚀 开始部署农历生日提醒系统..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"
echo "✅ npm 版本: $(npm --version)"

# 安装依赖
echo "📦 安装项目依赖..."
npm install --production

# 检查.env文件
if [ ! -f ".env" ]; then
    echo "⚠️  警告: .env 文件不存在"
    exit 1
fi

echo "✅ 部署完成！"

# 创建启动脚本
cat > start.sh << 'EOF'
#!/bin/bash

# 农历生日提醒系统启动脚本

echo "🎂 启动农历生日提醒系统..."

# 设置时区
export TZ=Asia/Shanghai

# 启动应用
node index.js
EOF

chmod +x start.sh

# 创建systemd服务文件
cat > birthday-reminder.service << EOF
[Unit]
Description=Lunar Birthday Reminder System
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
Environment=NODE_ENV=production
Environment=TZ=Asia/Shanghai
ExecStart=$(which node) index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo "✅ 部署脚本创建完成"
echo ""
echo "📋 部署完成！接下来你需要："
echo ""
echo "1. 配置邮件设置："
echo "   cp env.example .env"
echo "   # 编辑 .env 文件，填写你的邮箱配置"
echo ""
echo "2. 测试系统："
echo "   node index.js test"
echo ""
echo "3. 启动系统："
echo "   ./start.sh"
echo ""
echo "4. 后台运行（推荐）："
echo "   nohup node index.js > birthday.log 2>&1 &"
echo ""
echo "5. 安装为系统服务（可选）："
echo "   sudo cp birthday-reminder.service /etc/systemd/system/"
echo "   sudo systemctl daemon-reload"
echo "   sudo systemctl enable birthday-reminder"
echo "   sudo systemctl start birthday-reminder"
echo ""
echo "6. 查看日志："
echo "   tail -f birthday.log"
echo "   # 或者如果使用systemd："
echo "   sudo journalctl -u birthday-reminder -f" 