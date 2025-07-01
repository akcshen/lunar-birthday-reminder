#!/bin/bash

# PM2 管理脚本

show_help() {
    echo "🎂 生日提醒系统 PM2 管理脚本"
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  start     启动所有服务"
    echo "  stop      停止所有服务"
    echo "  restart   重启所有服务"
    echo "  reload    重载所有服务"
    echo "  status    查看服务状态"
    echo "  logs      查看日志"
    echo "  logs-app  查看主应用日志"
    echo "  logs-health 查看健康检查日志"
    echo "  logs-monitor 查看监控日志"
    echo "  delete    删除所有服务"
    echo "  install   安装 PM2"
    echo "  help      显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 start"
    echo "  $0 status"
    echo "  $0 logs"
}

check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        echo "❌ PM2 未安装"
        echo "请运行: $0 install"
        exit 1
    fi
}

install_pm2() {
    echo "📦 安装 PM2..."
    npm install -g pm2
    echo "✅ PM2 安装完成"
}

start_services() {
    echo "🚀 启动所有服务..."
    check_pm2
    
    # 检查依赖
    if [ ! -d "node_modules" ]; then
        echo "📦 安装依赖..."
        npm install
    fi
    
    # 检查环境变量
    if [ ! -f ".env" ]; then
        echo "⚠️  未找到 .env 文件，请复制 env.example 并配置环境变量"
        exit 1
    fi
    
    # 创建日志目录
    mkdir -p logs
    
    # 启动服务
    pm2 start ecosystem.config.js
    pm2 save
    echo "✅ 服务启动完成"
}

stop_services() {
    echo "🛑 停止所有服务..."
    check_pm2
    pm2 stop ecosystem.config.js
    echo "✅ 服务已停止"
}

restart_services() {
    echo "🔄 重启所有服务..."
    check_pm2
    pm2 restart ecosystem.config.js
    echo "✅ 服务重启完成"
}

reload_services() {
    echo "🔄 重载所有服务..."
    check_pm2
    pm2 reload ecosystem.config.js
    echo "✅ 服务重载完成"
}

show_status() {
    echo "📊 服务状态:"
    check_pm2
    pm2 status
}

show_logs() {
    echo "📋 查看所有日志:"
    check_pm2
    pm2 logs
}

show_app_logs() {
    echo "📋 主应用日志:"
    check_pm2
    pm2 logs birthday-reminder
}

show_health_logs() {
    echo "📋 健康检查日志:"
    check_pm2
    pm2 logs birthday-health
}

show_monitor_logs() {
    echo "📋 监控日志:"
    check_pm2
    pm2 logs birthday-monitor
}

delete_services() {
    echo "🗑️  删除所有服务..."
    check_pm2
    pm2 delete ecosystem.config.js
    echo "✅ 服务已删除"
}

# 主逻辑
case "$1" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    reload)
        reload_services
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    logs-app)
        show_app_logs
        ;;
    logs-health)
        show_health_logs
        ;;
    logs-monitor)
        show_monitor_logs
        ;;
    delete)
        delete_services
        ;;
    install)
        install_pm2
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "❌ 未知命令: $1"
        echo ""
        show_help
        exit 1
        ;;
esac 