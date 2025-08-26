# ProjectAIWP - AI Tools Platform

A web platform for AI instruments that suggests tools based on developer roles in a team.

## Tech Stack

- **Backend**: Laravel 10 with PHP 8.2
- **Frontend**: Next.js 14 with TypeScript & Tailwind CSS
- **Database**: PostgreSQL 15 (SQLite for development)
- **Cache**: Redis 7
- **Web Server**: Nginx
- **Containerization**: Docker & Docker Compose

## Features

- Role-based AI tool recommendations (Frontend, Backend, QA, Designer, PM, Owner)
- AI tool categorization and management
- Tool search and filtering
- Simple integration interface
- User authentication and authorization

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose
- Git

## Quick Start

1. Clone the repository:
```bash
git clone [repository-url]
cd ProjectAIWP
```

2. Run the installation script:
```bash
./install.sh
```

Or manually:

```bash
# Copy environment file
cp .env.example .env

# Build and start containers
docker-compose up -d --build

# Install Laravel (first time only)
docker-compose exec app composer create-project --prefer-dist laravel/laravel . "10.*"

# Generate application key
docker-compose exec app php artisan key:generate

# Run migrations
docker-compose exec app php artisan migrate
```

## Docker Services

- **nginx**: Web server (port 80) - serves Laravel backend
- **app**: PHP-FPM application server (Laravel backend)
- **frontend**: Next.js application (port 3001)
- **db**: PostgreSQL database (port 5432)
- **redis**: Cache and queue backend (port 6379)
- **queue**: Laravel queue worker
- **scheduler**: Laravel task scheduler
- **phppgadmin**: Database management UI (port 5050)

## Accessing the Application

- **Frontend (Next.js)**: http://localhost:3001
- **Backend API**: http://localhost/api
- **Laravel Admin**: http://localhost
- **PgAdmin**: http://localhost:5050
  - Email: admin@aiwp.local
  - Password: admin

## Development

### Enter the backend container:
```bash
docker-compose exec app bash
```

### Enter the frontend container:
```bash
docker-compose exec frontend bash
```

### Run Artisan commands:
```bash
docker-compose exec app php artisan [command]
```

### Run Next.js commands:
```bash
docker-compose exec frontend npm run [command]
```

### View logs:
```bash
docker-compose logs -f [service-name]
```

### Stop all containers:
```bash
docker-compose down
```

### Stop and remove volumes:
```bash
docker-compose down -v
```

## Project Structure

```
ProjectAIWP/
├── docker/
│   ├── nginx/          # Nginx configuration
│   └── php/            # PHP-FPM Dockerfile and config
├── src/
│   ├── Backend/        # Laravel application (API)
│   └── Frontend/       # Next.js application
├── docker-compose.yml  # Docker services configuration
├── .env               # Environment variables
└── install.sh         # Installation script
```

## Environment Variables

Key environment variables in `.env`:

- `DB_DATABASE`: PostgreSQL database name
- `DB_USERNAME`: PostgreSQL username
- `DB_PASSWORD`: PostgreSQL password
- `PGADMIN_EMAIL`: PgAdmin login email
- `PGADMIN_PASSWORD`: PgAdmin login password

## Troubleshooting

### Permission Issues
```bash
docker-compose exec app chown -R www-data:www-data storage bootstrap/cache
```

### Clear all caches
```bash
docker-compose exec app php artisan optimize:clear
```

### Rebuild containers
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Development Workflow

### Backend (Laravel)
1. Navigate to `/src/Backend`
2. Database migrations are already set up
3. API endpoints are implemented in `/app/Http/Controllers/Api/`
4. Models are in `/app/Models/`

### Frontend (Next.js)
1. Navigate to `/src/Frontend`
2. Components are in `/src/components/`
3. Pages are in `/src/app/`
4. API integration is in `/src/lib/api.ts`
5. TypeScript types are in `/src/types/`

### Next Steps

1. ✅ ~~Set up the database schema for AI tools~~
2. ✅ ~~Create API endpoints for tool management~~
3. ✅ ~~Implement role-based recommendation system~~
4. ✅ ~~Add Next.js frontend application~~
5. Configure authentication integration between Frontend and Backend
6. Add user dashboard and tool management UI
7. Set up CI/CD pipeline

## License

This project is proprietary software.