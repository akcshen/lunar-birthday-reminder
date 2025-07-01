#!/bin/bash

# 农历生日提醒系统启动脚本

echo "🎂 启动农历生日提醒系统..."

# 设置时区
export TZ=Asia/Shanghai

# 启动应用
node index.js 