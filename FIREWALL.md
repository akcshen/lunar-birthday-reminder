# 防火墙配置指南

为了能够通过服务器IP访问健康检查接口，需要配置防火墙开放端口。

## 端口说明

- **3001**: 健康检查服务端口
- **其他端口**: 根据实际需要配置

## Ubuntu/Debian (ufw)

```bash
# 安装 ufw（如果未安装）
sudo apt update
sudo apt install ufw

# 开放端口
sudo ufw allow 3001

# 启用防火墙
sudo ufw enable

# 查看状态
sudo ufw status
```

## CentOS/RHEL (firewalld)

```bash
# 开放端口
sudo firewall-cmd --permanent --add-port=3001/tcp

# 重新加载配置
sudo firewall-cmd --reload

# 查看状态
sudo firewall-cmd --list-ports
```

## CentOS/RHEL (iptables)

```bash
# 开放端口
sudo iptables -A INPUT -p tcp --dport 3001 -j ACCEPT

# 保存规则
sudo service iptables save

# 查看规则
sudo iptables -L
```

## 云服务器配置

### 阿里云 ECS
1. 登录阿里云控制台
2. 进入 ECS 实例详情
3. 点击"安全组"
4. 添加入方向规则：
   - 端口范围：3001/3001
   - 授权对象：0.0.0.0/0（或指定IP）

### 腾讯云 CVM
1. 登录腾讯云控制台
2. 进入 CVM 实例详情
3. 点击"安全组"
4. 添加入站规则：
   - 端口：3001
   - 来源：0.0.0.0/0（或指定IP）

### AWS EC2
1. 登录 AWS 控制台
2. 进入 EC2 实例
3. 点击"安全组"
4. 添加入站规则：
   - 端口：3001
   - 来源：0.0.0.0/0（或指定IP）

## 测试连接

### 本地测试
```bash
# 测试健康检查
curl http://服务器IP:3001/health

# 测试状态接口
curl http://服务器IP:3001/status
```

### 使用测试脚本
```bash
npm run test:external
```

## 安全建议

1. **限制访问IP**: 不要使用 0.0.0.0/0，而是指定具体的IP范围
2. **使用HTTPS**: 在生产环境中建议配置SSL证书
3. **添加认证**: 考虑为健康检查接口添加基本认证
4. **监控访问**: 定期检查访问日志

## 故障排除

### 端口被占用
```bash
# 查看端口占用
sudo lsof -i :3001

# 或使用 netstat
sudo netstat -tlnp | grep 3001
```

### 服务未启动
```bash
# 检查服务状态
pm2 status

# 启动服务
npm run pm2:start
```

### 防火墙问题
```bash
# 检查防火墙状态
sudo ufw status
sudo firewall-cmd --state

# 临时关闭防火墙测试（仅测试用）
sudo ufw disable
sudo systemctl stop firewalld
``` 