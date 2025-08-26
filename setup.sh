#!/bin/bash

echo "🚀 Setting up ProjectAIWP Database"
echo "=================================="

cd src

# Run migrations
echo "📦 Running database migrations..."
php artisan migrate:fresh --force

# Run seeders
echo "🌱 Seeding database with sample data..."
php artisan db:seed --force

echo ""
echo "✅ Database setup completed!"
echo ""
echo "📧 Test Users Created:"
echo "=================================="
echo "Owner:    ivan@admin.local     | password"
echo "Frontend: elena@frontend.local  | password"
echo "Backend:  petar@backend.local   | password"
echo "QA:       maria@qa.local        | password"
echo "Designer: alex@designer.local   | password"
echo "PM:       sofia@pm.local        | password"
echo ""
echo "🏢 Organizations: TechCorp Solutions, StartupHub Inc"
echo "🛠️ AI Tools: 10 tools with role-based recommendations"
echo "📂 Categories: 10 categories for tool organization"