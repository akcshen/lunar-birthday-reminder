# 农历生日自动邮件提醒系统

一个基于 Node.js 的农历生日自动邮件提醒系统，支持农历日期转换、定时提醒和邮件通知功能。

## 功能特性

- 🎂 **农历日期支持**: 自动将农历生日转换为公历日期
- 📧 **邮件提醒**: 支持多种提醒策略
- ⏰ **智能提醒**: 
  - 提前4周开始提醒
  - 4周到1周之间每周日提醒
  - 7天内每天提醒
  - 生日当天提醒
- 🖥️ **交互式界面**: 支持命令行和交互式操作
- 📅 **生日管理**: 添加、删除、查看生日信息
- 🔧 **邮件测试**: 内置邮件配置测试功能

## 安装和配置

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `env.example` 为 `.env` 并填写配置信息：

```bash
cp env.example .env
```

编辑 `.env` 文件：

```env
# 邮件配置
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# 提醒邮件接收地址
REMINDER_EMAIL=your-reminder-email@example.com
```

### 3. 邮件服务配置

#### Gmail 配置
1. 开启两步验证
2. 生成应用专用密码
3. 使用应用专用密码作为 `EMAIL_PASS`

#### QQ邮箱配置
```env
EMAIL_HOST=smtp.qq.com
EMAIL_PORT=587
EMAIL_USER=your-qq@qq.com
EMAIL_PASS=your-authorization-code
```

#### 163邮箱配置
```env
EMAIL_HOST=smtp.163.com
EMAIL_PORT=587
EMAIL_USER=your-email@163.com
EMAIL_PASS=your-authorization-code
```

## 使用方法

### 交互式界面

启动交互式界面：

```bash
npm start
```

或者：

```bash
node index.js
```

### 命令行操作

#### 查看所有生日
```bash
node index.js list
```

#### 添加生日
```bash
node index.js add <姓名> <农历月> <农历日> [邮箱]
```

示例：
```bash
node index.js add 妈妈 7 15
node index.js add 爸爸 3 8 dad@example.com
```

#### 删除生日
```bash
node index.js remove <姓名>
```

示例：
```bash
node index.js remove 妈妈
```

#### 立即检查生日提醒
```bash
node index.js check
```

#### 测试邮件配置
```bash
node index.js test
```

#### 查看帮助
```bash
node index.js help
```

## 提醒策略

系统按照以下策略发送提醒邮件：

1. **提前4周开始**: 距离生日28天时开始提醒
2. **周提醒**: 4周到1周之间，每个周日发送提醒
3. **日提醒**: 距离生日7天内，每天发送提醒
4. **生日当天**: 生日当天发送祝福邮件

## 项目结构

```
birthday/
├── index.js                 # 主程序入口
├── package.json            # 项目配置
├── birthdays.json          # 生日数据文件
├── env.example             # 环境变量示例
├── README.md               # 项目说明
├── utils/
│   ├── lunarConverter.js   # 农历转换工具
│   └── emailSender.js      # 邮件发送工具
└── services/
    └── birthdayService.js  # 生日服务
```

## 技术栈

- **Node.js**: 运行环境
- **lunar-javascript**: 农历日期转换
- **nodemailer**: 邮件发送
- **node-cron**: 定时任务
- **dotenv**: 环境变量管理

## 注意事项

1. **时区设置**: 系统使用 `Asia/Shanghai` 时区
2. **邮件频率**: 系统会避免重复发送同一天的提醒
3. **农历转换**: 支持1900-2100年的农历日期转换
4. **数据持久化**: 生日数据保存在 `birthdays.json` 文件中

## 故障排除

### 邮件发送失败
1. 检查邮箱配置是否正确
2. 确认邮箱服务商的应用密码设置
3. 使用 `node index.js test` 测试邮件配置

### 农历转换错误
1. 确认农历日期格式正确（1-12月，1-30日）
2. 检查日期是否在支持范围内（1900-2100年）

### 定时任务不工作
1. 确认系统时间正确
2. 检查时区设置
3. 使用 `node index.js check` 手动测试

## 许可证

MIT License 