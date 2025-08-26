#!/bin/bash

echo "🚀 Setting up ProjectAIWP - AI Tools Platform"
echo "============================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Environment file created"
fi

# Build Docker containers
echo "📦 Building Docker containers..."
docker-compose build

# Start the containers
echo "🔄 Starting containers..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Install Laravel
echo "📥 Installing Laravel..."
docker-compose exec -T app composer create-project --prefer-dist laravel/laravel . "10.*"

# Set proper permissions
echo "🔒 Setting permissions..."
docker-compose exec -T app chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Update Laravel .env file for PostgreSQL
echo "📝 Configuring Laravel environment..."
docker-compose exec -T app bash -c 'cat > .env << EOL
APP_NAME="AI Tools Platform"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=aiwp_db
DB_USERNAME=aiwp_user
DB_PASSWORD=secret

BROADCAST_DRIVER=log
CACHE_DRIVER=redis
FILESYSTEM_DISK=local
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=mt1

VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="${PUSHER_HOST}"
VITE_PUSHER_PORT="${PUSHER_PORT}"
VITE_PUSHER_SCHEME="${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
EOL'

# Generate application key
echo "🔑 Generating application key..."
docker-compose exec -T app php artisan key:generate

# Run migrations
echo "🗄️ Running database migrations..."
docker-compose exec -T app php artisan migrate --force

# Clear caches
echo "🧹 Clearing caches..."
docker-compose exec -T app php artisan config:clear
docker-compose exec -T app php artisan cache:clear
docker-compose exec -T app php artisan view:clear

echo ""
echo "✅ Installation completed successfully!"
echo "============================================"
echo "🌐 Application URL: http://localhost"
echo "🗄️ PgAdmin URL: http://localhost:5050"
echo "   Email: admin@aiwp.local"
echo "   Password: admin"
echo ""
echo "📝 Next steps:"
echo "1. Visit http://localhost to see your Laravel application"
echo "2. Start developing your AI Tools Platform!"
echo ""
echo "Useful commands:"
echo "  docker-compose up -d     # Start containers"
echo "  docker-compose down      # Stop containers"
echo "  docker-compose logs -f   # View logs"
echo "  docker-compose exec app bash  # Enter app container"