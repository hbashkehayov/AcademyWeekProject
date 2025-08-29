# ProjectAIWP - AI Tools Platform 🤖

> **Enterprise-ready platform for discovering, managing and recommending AI tools based on developer roles**

A sophisticated web platform that curates and recommends AI instruments tailored to developer roles within teams, featuring advanced 2FA security, admin management, and intelligent tool suggestions.

## ✨ Key Features

### 🎯 **Core Functionality**
- **Role-based AI tool recommendations** - Intelligent suggestions for Frontend, Backend, QA, Designer, PM, and Owner roles
- **Advanced tool management** - Comprehensive CRUD with approval workflows
- **Smart categorization** - 10+ predefined categories with hierarchical structure
- **Powerful search & filtering** - Multi-dimensional filtering by role, category, pricing, features
- **AI-powered assistant** - Integrated Anthropic AI for tool research and suggestions

### 🔒 **Security & Authentication**
- **Multi-factor 2FA** - Google Authenticator, Email codes, and Telegram support
- **Role-based access control** - Granular permissions using Spatie Laravel Permissions
- **Laravel Sanctum** - Secure API authentication with SPA support
- **Admin panel** - Complete administrative interface for owners

### 🎨 **Modern UI/UX**
- **Glass Morphism design** - Beautiful, modern interface with backdrop blur effects
- **Dark/Light themes** - Dynamic theme switching with smooth transitions
- **Fully responsive** - Mobile-first design with excellent accessibility
- **Advanced animations** - Smooth transitions and micro-interactions

### 🚀 **Performance & Scalability**
- **Redis caching** - High-performance caching for categories and statistics
- **Docker containerization** - Easy deployment and scaling
- **PostgreSQL database** - Robust relational database with optimized queries
- **Queue system** - Background job processing with Laravel Queues

## 🏗️ Architecture

```
ProjectAIWP/
├── docker/                 # Docker configuration
│   ├── nginx/              # Nginx reverse proxy
│   └── php/                # PHP-FPM container setup
├── src/
│   ├── Backend/            # Laravel 10 API
│   │   ├── app/
│   │   │   ├── Http/Controllers/Api/  # API endpoints
│   │   │   ├── Models/     # Eloquent models
│   │   │   └── Services/   # Business logic services
│   │   └── database/       # Migrations, seeders, factories
│   └── Frontend/           # Next.js 14 TypeScript app
│       ├── src/components/ # React components
│       ├── src/contexts/   # React contexts
│       └── src/lib/        # Utilities and API client
├── docker-compose.yml      # Multi-service Docker setup
└── install.sh             # Automated installation script
```

## 🛠️ Tech Stack

### Backend
- **Laravel 10** - PHP 8.2+ framework with modern features
- **PostgreSQL 15** - Primary database (SQLite for development)
- **Redis 7** - Caching and session storage
- **Laravel Sanctum** - API authentication
- **Spatie Permissions** - Role-based access control
- **Google2FA** - Two-factor authentication
- **Anthropic AI SDK** - AI assistant integration

### Frontend  
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern utility-first CSS framework
- **Custom Glass Morphism** - Unique design system
- **React Contexts** - State management

### DevOps
- **Docker & Docker Compose** - Containerization
- **Nginx** - Web server and reverse proxy
- **Laravel Horizon** - Queue monitoring (optional)
- **Laravel Telescope** - Debugging assistant (optional)

## 📋 Prerequisites

- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Docker Compose** v2.0+
- **Git**
- **Minimum 4GB RAM** for development

## ⚡ Quick Start

> **🎉 Ready-to-use Configuration**: This repository includes working `.env` files and SQLite database with seeded data for immediate setup!

### 🚀 Option 1: Local Development (Fastest)
**Requirements**: PHP 8.2+, Composer, Node.js 18+

```bash
# 1. Clone repository
git clone https://github.com/your-org/ProjectAIWP.git
cd ProjectAIWP

# 2. Install backend dependencies
cd src/Backend
composer install

# 3. Start backend server (Laravel serves on port 8000)
php artisan serve

# 4. In a new terminal, start frontend
cd ../Frontend
npm install
npm run dev
```

**🎯 Access the application:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api  
- **Login**: Use any seeded account (see Database section)

---

### 🐳 Option 2: Docker Setup
```bash
# 1. Clone repository
git clone https://github.com/your-org/ProjectAIWP.git
cd ProjectAIWP

# 2. Automated installation
chmod +x install.sh
./install.sh

# OR Manual Docker setup:
docker-compose up -d --build

# Install dependencies and setup database
docker-compose exec app composer install
docker-compose exec app php artisan key:generate
docker-compose exec app php artisan migrate
docker-compose exec app php artisan db:seed

# Install frontend dependencies
docker-compose exec frontend npm install
```

## 🚀 Docker Services

The application runs 7 containerized services:

| Service | Purpose | Port | URL |
|---------|---------|------|-----|
| **nginx** | Web server & reverse proxy | 8000 | http://localhost:8000 |
| **app** | PHP-FPM Laravel backend | - | API endpoints |
| **frontend** | Next.js TypeScript app | 3000 | http://localhost:3000 |
| **db** | PostgreSQL 15 database | 5432 | Internal |
| **redis** | Cache & session storage | 6379 | Internal |
| **queue** | Laravel queue worker | - | Background jobs |
| **pgadmin** | Database management UI | 5050 | http://localhost:5050 |

### 🔗 Access URLs
- **🌐 Main Application**: http://localhost:3000
- **🔧 Admin Panel**: http://localhost:3000/admin  
- **📊 API Documentation**: http://localhost:8000/api
- **🗄️ Database Admin**: http://localhost:5050
  - Email: `admin@aiwp.local`
  - Password: `admin`

## 👥 Default Users & Roles

The system comes pre-seeded with test users for each role:

| Name | Email | Password | Role |
|------|-------|----------|------|
| Иван Иванов | ivan@admin.local | password | Owner |
| Hristiyan Bashkehayov | h.bashkehayov@softart.bg | password | Owner |
| Елена Петрова | elena@frontend.local | password | Frontend Developer |
| Петър Георгиев | petar@backend.local | password | Backend Developer |
| Мария Димитрова | maria@qa.local | password | QA Engineer |
| Александър Стоянов | alex@designer.local | password | UI/UX Designer |
| София Николова | sofia@pm.local | password | Project Manager |

> **💡 Quick Start**: Login with `ivan@admin.local` / `password` (Owner role) for full admin access

## 🔧 Adding AI Tools

### Through Web Interface
1. **Login** to the platform
2. **Navigate** to Dashboard
3. **Click** "Add Tool" button
4. **Fill** the comprehensive form:
   - Basic info (name, description, website URL)
   - Categories and target roles
   - Pricing model and features
   - Integration type (Web, API, Webhook)
5. **Submit** for admin approval

### Through AI Assistant
1. **Access** the AI Assistant in Dashboard
2. **Describe** the tool you want to add
3. **AI researches** and fills form automatically
4. **Review** and customize the pre-filled data
5. **Submit** the AI-suggested tool

### Via API
```bash
# Create tool via API (requires authentication)
curl -X POST "http://localhost:8000/api/tools" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "ChatGPT",
    "description": "AI assistant for developers",
    "website_url": "https://chat.openai.com",
    "integration_type": "redirect",
    "categories": ["1", "2"],
    "roles": [
      {"id": "1", "relevance_score": 90},
      {"id": "2", "relevance_score": 85}
    ]
  }'
```

## 🛡️ Role System & Permissions

### Role Hierarchy
```
Owner (Admin)
├── Full access to admin panel
├── User management
├── Tool approval/rejection
├── System statistics
└── All lower role permissions

Project Manager
├── Team oversight tools
├── Project management AI tools
└── Collaboration features

QA Engineer
├── Testing and automation tools
├── Bug tracking integrations
└── Quality assurance AI tools

Frontend Developer
├── UI/UX design tools
├── Frontend frameworks
└── Client-side development tools

Backend Developer  
├── API development tools
├── Database management
└── Server-side technologies

UI/UX Designer
├── Design and prototyping tools
├── User research AI tools
└── Creative software
```

### Permission System
- **Tool Submission**: All authenticated users
- **Tool Approval**: Owner role only
- **Admin Panel**: Owner role only  
- **User Management**: Owner role only
- **Statistics Access**: Owner role only

## 🔒 2FA Security Setup

The platform supports multiple 2FA methods:

### Google Authenticator (TOTP)
1. **Register** or login to your account
2. **Choose** "Google Authenticator" during 2FA setup
3. **Scan** QR code with your authenticator app
4. **Enter** 6-digit code to confirm
5. **Save** recovery codes securely

### Email 2FA
1. **Select** "Email" during 2FA setup  
2. **Verification code** sent to your email
3. **Enter** code within 10 minutes
4. **2FA activated** for your account

### Recovery Codes
- **8 unique codes** generated during setup
- **Use once** if you lose access to primary 2FA method
- **Store securely** - they won't be shown again

## 🔨 Development Guide

### Backend Development
```bash
# Enter Laravel container
docker-compose exec app bash

# Run migrations
php artisan migrate

# Create new migration
php artisan make:migration create_new_table

# Run tests
php artisan test

# Clear caches
php artisan optimize:clear
```

### Frontend Development  
```bash
# Enter Next.js container
docker-compose exec frontend bash

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check
```

### Database Management
```bash
# Database seeding
docker-compose exec app php artisan db:seed

# Fresh migration with seeding
docker-compose exec app php artisan migrate:fresh --seed

# Create new seeder
docker-compose exec app php artisan make:seeder ToolSeeder
```

## 🚨 Troubleshooting

### Common Issues

**Port Conflicts**
```bash
# Check if ports are in use
lsof -i :3000
lsof -i :8000

# Kill processes if needed
docker-compose down
```

**Database Connection Issues**
```bash
# Rebuild database container
docker-compose down -v
docker-compose up -d db
docker-compose exec app php artisan migrate:fresh --seed
```

**Permission Issues (Linux)**
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
docker-compose exec app chown -R www-data:www-data storage bootstrap/cache
```

**Frontend Build Issues**
```bash
# Clear Next.js cache
docker-compose exec frontend npm run clean
docker-compose exec frontend npm install
```

### Logs & Debugging
```bash
# View all service logs
docker-compose logs -f

# View specific service logs  
docker-compose logs -f app
docker-compose logs -f frontend

# Laravel application logs
docker-compose exec app tail -f storage/logs/laravel.log
```

## 📊 Monitoring & Performance

### Cache Management
```bash
# Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL

# View cached items
docker-compose exec redis redis-cli KEYS "*"
```

### Performance Optimization
- **Enable opcache** in production
- **Use Redis** for sessions and cache
- **Optimize images** and assets
- **Database indexing** for large datasets
- **CDN integration** for static assets

## 🚀 Deployment

### Production Setup

> **⚠️ Security Note**: The included `.env` files contain development credentials. For production, generate new API keys, passwords, and secrets.

```bash
# Update production environment (included .env files have dev credentials)
# Generate new APP_KEY, update database passwords, API keys, etc.

# Build production containers
docker-compose -f docker-compose.prod.yml up -d --build

# Run production optimizations
docker-compose exec app php artisan config:cache
docker-compose exec app php artisan route:cache  
docker-compose exec app php artisan view:cache
```

### Environment Variables
Key production settings:
```env
APP_ENV=production
APP_DEBUG=false
DB_HOST=db
REDIS_HOST=redis
CACHE_DRIVER=redis
SESSION_DRIVER=redis
ANTHROPIC_API_KEY=your_api_key
```

## 📝 API Documentation

### Authentication Endpoints
```
POST /api/register          # User registration
POST /api/login             # User login
POST /api/logout            # User logout
POST /api/2fa/setup-method  # Setup 2FA
POST /api/2fa/verify-login  # Verify 2FA login
```

### Tools Management
```
GET    /api/tools           # List all tools
POST   /api/tools           # Create new tool
GET    /api/tools/{slug}    # Get tool details
PUT    /api/tools/{id}      # Update tool
DELETE /api/tools/{id}      # Delete tool
```

### Admin Endpoints
```
GET    /api/admin/pending-tools    # Pending tools
POST   /api/admin/tools/{id}/approve  # Approve tool
POST   /api/admin/tools/{id}/reject   # Reject tool
GET    /api/admin/stats           # Dashboard stats
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** Pull Request

### Code Style
- **PSR-12** for PHP code
- **ESLint + Prettier** for TypeScript/React
- **Conventional Commits** for commit messages
- **PHPDoc** and **JSDoc** for documentation

## 📄 License

This project is **proprietary software**. All rights reserved.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs via GitHub Issues
- **Contact**: [your-email@domain.com]

---

**Made with ❤️ using Laravel, Next.js, and modern web technologies**
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

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[📖 Complete Documentation](docs/README.md)** - Documentation index and navigation
- **[👤 User Guide](docs/USER_GUIDE.md)** - Platform usage and features
- **[🔌 API Documentation](docs/API.md)** - Complete API reference  
- **[🚀 Deployment Guide](docs/DEPLOYMENT.md)** - Production setup
- **[🛠️ Troubleshooting](docs/TROUBLESHOOTING.md)** - Problem resolution

### Quick Help
- **Can't login?** → [Authentication Issues](docs/TROUBLESHOOTING.md#🔐-authentication-issues)
- **API not working?** → [API Connection Problems](docs/TROUBLESHOOTING.md#🔌-api-connection-problems)  
- **Performance slow?** → [Performance Problems](docs/TROUBLESHOOTING.md#⚡-performance-problems)
- **Need to deploy?** → [Deployment Guide](docs/DEPLOYMENT.md)

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