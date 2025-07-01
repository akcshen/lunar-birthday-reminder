module.exports = {
  apps: [
    {
      name: 'birthday-reminder',
      script: 'index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        TZ: 'Asia/Shanghai'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    },
    {
      name: 'birthday-health',
      script: 'health.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        TZ: 'Asia/Shanghai',
        HEALTH_PORT: 3001
      },
      error_file: './logs/health-err.log',
      out_file: './logs/health-out.log',
      log_file: './logs/health-combined.log',
      time: true
    },
    {
      name: 'birthday-monitor',
      script: 'monitor.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
        TZ: 'Asia/Shanghai',
        HEALTH_URL: 'http://localhost:3001/health',
        STATUS_URL: 'http://localhost:3001/status',
        CHECK_INTERVAL: 300000
      },
      error_file: './logs/monitor-err.log',
      out_file: './logs/monitor-out.log',
      log_file: './logs/monitor-combined.log',
      time: true
    }
  ]
}; 