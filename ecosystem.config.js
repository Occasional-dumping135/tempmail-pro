module.exports = {
  apps: [
    {
      name: 'mailtemp-api',
      script: './backend/server.js',
      instances: 4,
      exec_mode: 'cluster',
      cwd: '/home/ubuntu/mail_temp',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        JWT_SECRET: 'TempAmitBrands2024SuperSecretJWTKey_ChangeInProduction!',
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_NAME: 'mailtemp_db',
        DB_USER: 'mailtemp',
        DB_PASSWORD: 'MailTemp2024Secure!',
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
        SMTP_PORT: 2525,
        DAILY_TOKEN_LIMIT: 200000,
        DOMAIN: 'amitbrand.shop',
        SUBDOMAINS: 'temp,soul,crack'
      },
      max_memory_restart: '1G',
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'mailtemp-smtp',
      script: './backend/smtp-server.js',
      instances: 1,
      cwd: '/home/ubuntu/mail_temp',
      env: {
        NODE_ENV: 'production',
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_NAME: 'mailtemp_db',
        DB_USER: 'mailtemp',
        DB_PASSWORD: 'MailTemp2024Secure!',
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
        SMTP_PORT: 2525,
        DOMAIN: 'amitbrand.shop',
        SUBDOMAINS: 'temp,soul,crack'
      },
      max_memory_restart: '500M',
      error_file: './logs/smtp-error.log',
      out_file: './logs/smtp-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
