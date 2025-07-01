#!/bin/bash

# 生日提醒系统 PM2 启动脚本

echo "🎂 启动生日提醒系统 (PM2)"

# 检查 PM2 是否安装
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 未安装，正在安装..."
    npm install -g pm2
fi

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "⚠️  未找到 .env 文件，请复制 env.example 并配置环境变量"
    echo "cp env.example .env"
    exit 1
fi

# 创建日志目录
mkdir -p logs

# 停止现有进程（如果存在）
echo "🛑 停止现有进程..."
pm2 delete ecosystem.config.js 2>/dev/null || true

# 启动所有服务
echo "🚀 启动所有服务..."
pm2 start ecosystem.config.js

# 保存 PM2 配置
echo "💾 保存 PM2 配置..."
pm2 save

# 设置开机自启
echo "🔧 设置开机自启..."
pm2 startup

# 显示状态
echo "📊 服务状态:"
pm2 status

echo ""
echo "✅ 启动完成！"
echo ""
echo "📋 常用命令:"
echo "  pm2 status          - 查看状态"
echo "  pm2 logs            - 查看日志"
echo "  pm2 restart all     - 重启所有服务"
echo "  pm2 stop all        - 停止所有服务"
echo "  pm2 delete all      - 删除所有服务"
echo ""
echo "🌐 健康检查:"
echo "  http://localhost:3001/health"
echo "  http://localhost:3001/status" 