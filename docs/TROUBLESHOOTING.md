# ProjectAIWP Troubleshooting Guide

> **Comprehensive solutions for common issues and debugging steps**

## 🚨 Quick Problem Resolution

### Most Common Issues
1. **Can't login** → [Authentication Issues](#-authentication-issues)
2. **Tools not loading** → [API Connection Problems](#-api-connection-problems)  
3. **Database errors** → [Database Issues](#-database-issues)
4. **Docker problems** → [Docker & Container Issues](#-docker--container-issues)
5. **Performance issues** → [Performance Problems](#-performance-problems)

---

## 🔐 Authentication Issues

### Login Problems

#### **"Invalid credentials" error**
```bash
# Check if user exists in database
cd /root/ProjectAIWP/src/Backend
php artisan tinker --execute="
echo 'User lookup for: your@email.com';
\$user = App\Models\User::where('email', 'your@email.com')->first();
if(\$user) { 
    echo 'User found: ' . \$user->name; 
    echo ' Role: ' . \$user->role->name; 
} else { 
    echo 'User NOT found';
}"
```

**Solutions:**
1. **Use seeded accounts**: Try `ivan@admin.local` / `password`
2. **Reset password**: Use forgot password feature
3. **Check email spelling**: Ensure exact email address
4. **Create new user**: Register a new account

#### **2FA not working**

**Google Authenticator Issues:**
```bash
# Disable 2FA for user (emergency)
php artisan tinker --execute="
\$user = App\Models\User::where('email', 'your@email.com')->first();
\$user->two_factor_secret = null;
\$user->two_factor_recovery_codes = null;
\$user->save();
echo '2FA disabled for user';
"
```

**Email 2FA Issues:**
1. Check spam/junk folder
2. Verify email configuration in `.env`:
   ```env
   MAIL_MAILER=smtp
   MAIL_HOST=your-smtp-host
   MAIL_PORT=587
   MAIL_USERNAME=your-email
   MAIL_PASSWORD=your-password
   ```

#### **Session expired constantly**
**Check session configuration:**
```php
// config/session.php
'lifetime' => 120,  // 2 hours
'expire_on_close' => false,
'same_site' => 'lax',

// .env
SESSION_DRIVER=file
SESSION_DOMAIN=localhost  // or your domain
```

---

## 🔌 API Connection Problems

### Frontend can't connect to Backend

#### **CORS Issues**
```javascript
// Console error: "CORS policy blocked"
```

**Solution:**
```php
// config/cors.php
'allowed_origins' => [
    'http://localhost:3000',
    'http://localhost:8000', 
    'https://yourdomain.com'  // Add your domain
],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

#### **API endpoint not found (404)**
```bash
# Test API connectivity
curl -v http://localhost:8000/api/tools

# Check Laravel routes
cd src/Backend
php artisan route:list --path=api
```

**Check `.env` configuration:**
```env
# Backend
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

#### **API returns 500 errors**
```bash
# Check Laravel logs
tail -f src/Backend/storage/logs/laravel.log

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

---

## 🗄️ Database Issues

### Database connection failed

#### **SQLite database locked**
```bash
# Check SQLite database
cd src/Backend
ls -la database/database.sqlite

# Fix permissions
chmod 664 database/database.sqlite
chown www-data:www-data database/database.sqlite
```

#### **PostgreSQL connection issues**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
sudo -u postgres psql -c "\l"

# Check user permissions
sudo -u postgres psql -c "\du"

# Test application connection
php artisan tinker --execute="
try {
    DB::connection()->getPdo();
    echo 'Database connection: SUCCESS';
} catch(Exception \$e) {
    echo 'Database error: ' . \$e->getMessage();
}"
```

### Migration errors

#### **Migration failed**
```bash
# Check migration status
php artisan migrate:status

# Reset migrations (CAUTION: destroys data)
php artisan migrate:fresh

# Rollback and re-run specific migration
php artisan migrate:rollback --step=1
php artisan migrate
```

#### **Foreign key constraints**
```sql
-- Check foreign key constraints
SELECT * FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY';

-- Disable foreign key checks (MySQL)
SET FOREIGN_KEY_CHECKS = 0;
-- Your migration here
SET FOREIGN_KEY_CHECKS = 1;
```

### Seeding problems

#### **Seeding fails**
```bash
# Run specific seeder
php artisan db:seed --class=RoleSeeder

# Check seeder files
ls -la database/seeders/

# Debug seeding
php artisan tinker --execute="
(new Database\Seeders\RoleSeeder)->run();
echo 'Seeding completed';
"
```

---

## 🐳 Docker & Container Issues

### Container startup problems

#### **Port conflicts**
```bash
# Check port usage
sudo lsof -i :3000
sudo lsof -i :8000

# Kill processes using ports
sudo kill -9 $(sudo lsof -t -i:3000)
sudo kill -9 $(sudo lsof -t -i:8000)

# Use different ports
docker-compose up --build --force-recreate
```

#### **Container memory issues**
```bash
# Check container resources
docker stats

# Increase Docker memory limit (Docker Desktop)
# Settings → Resources → Memory: 4GB+

# Clean up Docker resources
docker system prune -a
docker volume prune
```

### Docker Compose issues

#### **Service won't start**
```bash
# Check service logs
docker-compose logs app
docker-compose logs frontend
docker-compose logs db

# Rebuild specific service
docker-compose up --build --force-recreate app

# Check service health
docker-compose ps
```

#### **Volume mounting problems**
```bash
# Check volume mounts
docker-compose config

# Fix permissions
sudo chown -R 1000:1000 src/Backend/storage

# Reset volumes
docker-compose down -v
docker-compose up --build
```

---

## ⚡ Performance Problems

### Slow page loading

#### **Database query optimization**
```bash
# Enable query log
php artisan tinker --execute="
DB::listen(function(\$query) {
    Log::info(\$query->sql, \$query->bindings, \$query->time);
});
"

# Check slow queries
tail -f storage/logs/laravel.log | grep -E "([0-9]{2,}ms|[0-9]{1,}s)"
```

#### **Cache optimization**
```bash
# Enable all caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Clear all caches
php artisan optimize:clear

# Check cache status
php artisan tinker --execute="
echo 'Config cached: ' . (app()->configurationIsCached() ? 'Yes' : 'No');
echo '\nRoutes cached: ' . (app()->routesAreCached() ? 'Yes' : 'No');
"
```

### High memory usage

#### **PHP memory limit**
```ini
; php.ini
memory_limit = 512M
max_execution_time = 300

; Check current limits
php -i | grep memory_limit
```

#### **Laravel optimization**
```bash
# Optimize autoloader
composer install --optimize-autoloader --no-dev

# Use APCu for caching
# Add to php.ini:
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=10000
```

### Frontend performance

#### **Next.js build optimization**
```bash
# Analyze bundle size
cd src/Frontend
npm run build
npm run analyze  # if available

# Clear Next.js cache
rm -rf .next/cache
npm run build
```

#### **API response optimization**
```php
// Add pagination to API responses
return response()->json([
    'data' => $tools->take(10),  // Limit results
    'pagination' => [...] 
]);

// Use eager loading
$tools = AiTool::with(['categories', 'roles'])->get();
```

---

## 🔧 Development Environment Issues

### Node.js problems

#### **Module not found errors**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 18.x+
npm --version
```

#### **Build failures**
```bash
# Check TypeScript errors
cd src/Frontend
npm run type-check

# Fix ESLint issues
npm run lint -- --fix

# Clear Next.js cache
rm -rf .next
npm run build
```

### PHP/Composer issues

#### **Composer dependency conflicts**
```bash
# Update composer
composer self-update

# Clear composer cache
composer clear-cache

# Update dependencies
composer update --with-dependencies

# Check PHP version
php --version  # Should be 8.2+
```

#### **PHP extension missing**
```bash
# Install required PHP extensions (Ubuntu)
sudo apt install -y php8.2-curl php8.2-json php8.2-mbstring
sudo apt install -y php8.2-xml php8.2-zip php8.2-gd
sudo apt install -y php8.2-pgsql php8.2-sqlite3

# Restart PHP-FPM
sudo systemctl restart php8.2-fpm
```

---

## 🛡️ Security Issues

### SSL/HTTPS problems

#### **Certificate errors**
```bash
# Check certificate
openssl x509 -in /etc/ssl/certs/your-cert.crt -text -noout

# Renew Let's Encrypt certificate
sudo certbot renew

# Test SSL configuration
curl -vI https://yourdomain.com
```

#### **Mixed content warnings**
```javascript
// Force HTTPS redirects
if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    window.location.replace('https:' + window.location.href.substring(window.location.protocol.length));
}
```

### Permission denied errors

#### **File permissions**
```bash
# Laravel storage permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

# SQLite database permissions  
sudo chown www-data:www-data database/database.sqlite
sudo chmod 664 database/database.sqlite
```

---

## 📊 Monitoring & Debugging

### Application logs

#### **Laravel logs**
```bash
# Real-time log monitoring
tail -f src/Backend/storage/logs/laravel.log

# Filter specific errors
grep -i "error" src/Backend/storage/logs/laravel.log

# Log specific queries
DB::enableQueryLog();
// Your code here
dd(DB::getQueryLog());
```

#### **Nginx/Apache logs**
```bash
# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Apache logs
sudo tail -f /var/log/apache2/access.log
sudo tail -f /var/log/apache2/error.log
```

### Database debugging

#### **Connection testing**
```bash
# Test database connection
php artisan tinker --execute="
try {
    \$pdo = DB::connection()->getPdo();
    echo 'Connected to: ' . \$pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
    echo ' Version: ' . \$pdo->getAttribute(PDO::ATTR_SERVER_VERSION);
} catch (Exception \$e) {
    echo 'Connection failed: ' . \$e->getMessage();
}
"
```

#### **Query debugging**
```php
// Enable query debugging in AppServiceProvider
if (app()->environment('local')) {
    DB::listen(function ($query) {
        Log::info($query->sql);
        Log::info($query->bindings);
        Log::info($query->time);
    });
}
```

### System monitoring

#### **Resource usage**
```bash
# System resources
htop
free -h
df -h

# Process monitoring
ps aux | grep php
ps aux | grep nginx
ps aux | grep node
```

---

## 🆘 Emergency Procedures

### System recovery

#### **Reset to clean state**
```bash
# ⚠️ WARNING: This destroys all data
cd /root/ProjectAIWP

# Reset database
cd src/Backend
php artisan migrate:fresh --seed

# Clear all caches
php artisan optimize:clear

# Restart services
sudo systemctl restart nginx php8.2-fpm postgresql
```

#### **Backup before changes**
```bash
# Backup database
sudo -u postgres pg_dump aiwp_production > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup application files
tar -czf app_backup_$(date +%Y%m%d_%H%M%S).tar.gz src/
```

### Contact information

#### **Getting help**
1. **Check logs first**: Always review error logs
2. **Search issues**: Look for similar problems on GitHub
3. **Create detailed issue**: Include error messages, logs, environment details
4. **Emergency contact**: For critical production issues

#### **Issue template**
```markdown
**Environment:**
- OS: Ubuntu 22.04
- PHP: 8.2.x
- Node.js: 18.x
- Database: PostgreSQL/SQLite
- Deployment: Docker/Manual

**Problem Description:**
[Detailed description of the issue]

**Steps to Reproduce:**
1. Step one
2. Step two
3. Error occurs

**Error Messages:**
```
[Paste error logs here]
```

**Expected Behavior:**
[What should happen instead]

**Additional Context:**
[Any other relevant information]
```

---

## 📚 Additional Resources

### Useful commands reference

```bash
# Laravel debugging
php artisan route:list
php artisan config:show
php artisan queue:work
php artisan schedule:work

# Database management  
php artisan migrate:status
php artisan db:show
php artisan model:show User

# Cache management
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Development helpers
php artisan make:controller
php artisan make:model
php artisan make:migration
php artisan serve --host=0.0.0.0 --port=8000
```

### Performance monitoring

```bash
# Database performance
EXPLAIN ANALYZE SELECT * FROM ai_tools WHERE status = 'active';

# PHP performance
composer require --dev phpunit/phpunit
php artisan test

# Frontend performance
npm run build -- --analyze
lighthouse http://localhost:3000
```

---

**Related Documentation:**
- [User Guide](USER_GUIDE.md) - Platform usage instructions
- [API Documentation](API.md) - API integration guide
- [Deployment Guide](DEPLOYMENT.md) - Production setup
- [Development Guide](../DEVELOPMENT.md) - Contributing guidelines