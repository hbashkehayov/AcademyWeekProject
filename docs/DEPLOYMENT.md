# ProjectAIWP Deployment Guide

> **Complete guide for deploying the AI Tools Platform to production environments**

## 🚀 Deployment Options

### 1. **VPS/Dedicated Server** (Recommended)
### 2. **Cloud Platforms** (AWS, Google Cloud, Azure)
### 3. **Container Platforms** (Docker Swarm, Kubernetes)
### 4. **Shared Hosting** (Limited support)

---

## 🔧 Pre-Deployment Checklist

### System Requirements
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **PHP**: 8.2 or higher
- **Node.js**: 18.x or higher
- **Database**: PostgreSQL 13+ or SQLite
- **Web Server**: Nginx (recommended) or Apache
- **Memory**: 2GB RAM minimum, 4GB+ recommended
- **Storage**: 10GB+ available space
- **SSL**: Valid SSL certificate

### Required Software
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y nginx postgresql postgresql-contrib redis-server
sudo apt install -y php8.2 php8.2-fpm php8.2-mysql php8.2-pgsql
sudo apt install -y php8.2-curl php8.2-json php8.2-mbstring
sudo apt install -y php8.2-xml php8.2-zip composer

# Node.js (using NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

---

## 🐳 Docker Production Deployment

### 1. Prepare Environment
```bash
# Clone repository
git clone https://github.com/your-org/ProjectAIWP.git
cd ProjectAIWP

# Create production environment file
cp .env.example .env.production
```

### 2. Configure Production Environment
Edit `.env.production`:

```env
# Application
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Database (PostgreSQL)
DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=aiwp_production
DB_USERNAME=aiwp_user
DB_PASSWORD=STRONG_PASSWORD_HERE

# Cache & Sessions
CACHE_DRIVER=redis
SESSION_DRIVER=redis
REDIS_HOST=redis

# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email@domain.com
MAIL_PASSWORD=email-password
MAIL_ENCRYPTION=tls

# API Keys
ANTHROPIC_API_KEY=your-anthropic-api-key

# Security
SESSION_DOMAIN=yourdomain.com
SANCTUM_STATEFUL_DOMAINS=yourdomain.com
```

### 3. Production Docker Compose
Create `docker-compose.prod.yml`:

```yaml
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/prod.conf:/etc/nginx/conf.d/default.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
      - frontend
    restart: unless-stopped

  app:
    build:
      context: ./src/Backend
      dockerfile: Dockerfile.prod
    environment:
      - APP_ENV=production
    volumes:
      - ./src/Backend/storage:/var/www/html/storage
    depends_on:
      - db
      - redis
    restart: unless-stopped

  frontend:
    build:
      context: ./src/Frontend
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: ${DB_DATABASE}
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### 4. Deploy to Production
```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Run database migrations
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force

# Seed production data (optional)
docker-compose -f docker-compose.prod.yml exec app php artisan db:seed --class=RoleSeeder
docker-compose -f docker-compose.prod.yml exec app php artisan db:seed --class=CategorySeeder

# Optimize for production
docker-compose -f docker-compose.prod.yml exec app php artisan config:cache
docker-compose -f docker-compose.prod.yml exec app php artisan route:cache
docker-compose -f docker-compose.prod.yml exec app php artisan view:cache

# Set permissions
docker-compose -f docker-compose.prod.yml exec app chown -R www-data:www-data /var/www/html/storage
docker-compose -f docker-compose.prod.yml exec app chmod -R 775 /var/www/html/storage
```

---

## 🌐 Manual VPS Deployment

### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Create application user
sudo adduser aiwp
sudo usermod -aG www-data aiwp
sudo usermod -aG sudo aiwp

# Switch to application user
su - aiwp
```

### 2. Install Dependencies
```bash
# Install PHP and extensions
sudo apt install -y php8.2-fpm php8.2-cli php8.2-common
sudo apt install -y php8.2-curl php8.2-json php8.2-mbstring
sudo apt install -y php8.2-xml php8.2-zip php8.2-gd
sudo apt install -y php8.2-pgsql php8.2-redis

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Install Nginx
sudo apt install -y nginx
```

### 3. Database Setup
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE aiwp_production;
CREATE USER aiwp_user WITH PASSWORD 'strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE aiwp_production TO aiwp_user;
\q
```

### 4. Application Deployment
```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/your-org/ProjectAIWP.git
sudo chown -R aiwp:www-data ProjectAIWP
cd ProjectAIWP

# Backend setup
cd src/Backend
composer install --no-dev --optimize-autoloader
cp .env.example .env

# Configure .env file (edit with your settings)
nano .env

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate --force

# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

# Frontend setup
cd ../Frontend
npm ci --production
npm run build

# Set up process manager (PM2)
sudo npm install -g pm2
pm2 start npm --name "aiwp-frontend" -- start
pm2 startup
pm2 save
```

### 5. Nginx Configuration
Create `/etc/nginx/sites-available/aiwp`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/ProjectAIWP/src/Frontend/out;
    index index.html;

    # Frontend static files
    location / {
        try_files $uri $uri/ @frontend;
    }

    # Frontend fallback
    location @frontend {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API routes
    location /api {
        try_files $uri $uri/ @laravel;
    }

    location @laravel {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/aiwp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## ☁️ Cloud Platform Deployment

### AWS EC2 Deployment

#### 1. Launch EC2 Instance
- **AMI**: Ubuntu 22.04 LTS
- **Instance Type**: t3.medium or larger
- **Security Group**: Ports 22, 80, 443
- **Storage**: 20GB+ EBS

#### 2. Elastic IP & Domain
```bash
# Associate Elastic IP
aws ec2 associate-address --instance-id i-1234567890abcdef0 --public-ip 1.2.3.4

# Update DNS records
# A record: yourdomain.com → 1.2.3.4
# CNAME: www.yourdomain.com → yourdomain.com
```

#### 3. RDS Database (Optional)
```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
    --db-name aiwp_production \
    --db-instance-identifier aiwp-prod \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username aiwp_user \
    --master-user-password strong_password
```

### Google Cloud Platform

#### 1. Compute Engine
```bash
# Create VM instance
gcloud compute instances create aiwp-prod \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud \
    --machine-type=e2-medium \
    --zone=us-central1-a
```

#### 2. Cloud SQL (Optional)
```bash
# Create PostgreSQL instance
gcloud sql instances create aiwp-db \
    --database-version=POSTGRES_13 \
    --tier=db-f1-micro \
    --region=us-central1
```

### Azure Deployment

#### 1. App Service
```bash
# Create resource group
az group create --name aiwp-prod --location eastus

# Create App Service plan
az appservice plan create \
    --name aiwp-plan \
    --resource-group aiwp-prod \
    --sku B1 \
    --is-linux

# Create web app
az webapp create \
    --resource-group aiwp-prod \
    --plan aiwp-plan \
    --name aiwp-prod \
    --runtime "NODE|18-lts"
```

---

## 🔒 Production Security

### 1. Environment Security
```bash
# Secure environment files
chmod 600 .env
chown www-data:www-data .env

# Remove development files
rm -rf .git
rm -rf node_modules
rm -rf tests
rm docker-compose.yml
```

### 2. Database Security
```sql
-- Create read-only user for monitoring
CREATE USER aiwp_readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE aiwp_production TO aiwp_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO aiwp_readonly;

-- Revoke unnecessary permissions
REVOKE ALL ON DATABASE aiwp_production FROM public;
```

### 3. Server Security
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Configure firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

# Disable root login
sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# Install fail2ban
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
```

### 4. Application Security
```php
// .env production settings
APP_DEBUG=false
LOG_LEVEL=warning

// Add to config/app.php
'cipher' => 'AES-256-CBC',

// Enable HTTPS redirect in nginx
return 301 https://$server_name$request_uri;
```

---

## 📊 Monitoring & Maintenance

### 1. Log Management
```bash
# Configure log rotation
sudo nano /etc/logrotate.d/aiwp

/var/www/ProjectAIWP/src/Backend/storage/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    notifempty
    create 644 www-data www-data
}
```

### 2. Performance Monitoring
```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Database monitoring
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# Redis monitoring
redis-cli info
```

### 3. Backup Strategy
```bash
#!/bin/bash
# backup.sh

# Database backup
sudo -u postgres pg_dump aiwp_production > /backups/db_$(date +%Y%m%d_%H%M%S).sql

# Files backup
tar -czf /backups/files_$(date +%Y%m%d_%H%M%S).tar.gz \
    /var/www/ProjectAIWP/src/Backend/storage \
    /var/www/ProjectAIWP/.env

# Keep only last 7 days
find /backups -name "*.sql" -mtime +7 -delete
find /backups -name "*.tar.gz" -mtime +7 -delete
```

### 4. Automated Updates
```bash
# Create update script
#!/bin/bash
# update.sh

cd /var/www/ProjectAIWP
git pull origin main

cd src/Backend
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

cd ../Frontend
npm ci --production
npm run build

sudo systemctl reload php8.2-fpm
sudo systemctl reload nginx
pm2 restart aiwp-frontend
```

---

## 🚨 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check PostgreSQL service
sudo systemctl status postgresql
sudo systemctl restart postgresql

# Check user permissions
sudo -u postgres psql -c "\du"
```

**Permission Denied Errors**
```bash
# Fix Laravel permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

**Frontend Build Failures**
```bash
# Clear Node.js cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**SSL Certificate Issues**
```bash
# Renew certificate
sudo certbot renew
sudo nginx -t && sudo systemctl reload nginx
```

### Performance Optimization

**PHP-FPM Tuning**
```ini
; /etc/php/8.2/fpm/pool.d/www.conf
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
```

**Nginx Optimization**
```nginx
# Add to nginx.conf
worker_processes auto;
worker_connections 1024;

gzip on;
gzip_types text/plain text/css application/json application/javascript;

client_max_body_size 100M;
```

**Database Optimization**
```sql
-- PostgreSQL configuration
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
```

---

## 📞 Support

For deployment issues:
1. Check [Troubleshooting Guide](TROUBLESHOOTING.md)
2. Review application logs: `/var/www/ProjectAIWP/src/Backend/storage/logs/`
3. Check server logs: `/var/log/nginx/` and `/var/log/php8.2-fpm/`
4. Create GitHub issue with deployment details

---

**Next Steps:**
- [User Guide](USER_GUIDE.md) - Using the platform
- [API Documentation](API.md) - Integration guide
- [Development Guide](../DEVELOPMENT.md) - Contributing