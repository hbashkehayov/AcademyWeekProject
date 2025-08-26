# ProjectAIWP Makefile
.PHONY: help install up down restart logs shell migrate fresh test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install the project
	@./install.sh

up: ## Start all containers
	@docker-compose up -d

down: ## Stop all containers
	@docker-compose down

restart: ## Restart all containers
	@docker-compose restart

logs: ## View container logs
	@docker-compose logs -f

shell: ## Enter the app container shell
	@docker-compose exec app bash

migrate: ## Run database migrations
	@docker-compose exec app php artisan migrate

fresh: ## Fresh migrate with seeders
	@docker-compose exec app php artisan migrate:fresh --seed

test: ## Run tests
	@docker-compose exec app php artisan test

cache-clear: ## Clear all caches
	@docker-compose exec app php artisan optimize:clear

composer-install: ## Install composer dependencies
	@docker-compose exec app composer install

npm-install: ## Install npm dependencies
	@docker-compose exec app npm install

npm-dev: ## Run npm dev
	@docker-compose exec app npm run dev

npm-build: ## Build frontend assets
	@docker-compose exec app npm run build

queue-work: ## Start queue worker
	@docker-compose exec app php artisan queue:work

tinker: ## Start Laravel tinker
	@docker-compose exec app php artisan tinker

db-backup: ## Backup database
	@docker-compose exec db pg_dump -U aiwp_user aiwp_db > backup_$(shell date +%Y%m%d_%H%M%S).sql

permissions: ## Fix storage permissions
	@docker-compose exec app chown -R www-data:www-data storage bootstrap/cache