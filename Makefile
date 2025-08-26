.PHONY: help build up down restart logs clean prune ps status stop start

all: help

help:
	@echo "Hypertube Docker Compose Commands:"
	@echo ""
	@echo "  make all         - Build and start all services"
	@echo "  make build       - Build all Docker images"
	@echo "  make up          - Start all services in detached mode"
	@echo "  make down        - Stop and remove all containers"
	@echo "  make restart     - Restart all services"
	@echo "  make status      - Show container status"
	@echo "  make stop        - Stop all services without removing containers"
	@echo "  make start       - Start existing containers"
	@echo "  make clean       - Remove containers, networks, and volumes"
	@echo "  make prune       - Remove unused Docker resources"
	@echo "  make rebuild     - Rebuild and restart all services"

all: build-npm build up

build:
	@echo "Building Docker images..."
	docker compose build

build-npm:
	cd hypertube-frontend && npm install

up:
	@echo "Starting all services..."
	docker compose up -d

down:
	@echo "Stopping and removing containers..."
	docker compose down

restart: down up

stop:
	@echo "Stopping all services..."
	docker compose stop

start:
	@echo "Starting existing containers..."
	docker compose start

clean:
	@echo "Cleaning up containers, networks, and volumes..."
	docker compose down -v --remove-orphans

prune:
	@echo "Removing unused Docker resources..."
	docker system prune -fa
	docker volume prune -fa

rebuild: build-npm
	@echo "Rebuilding and restarting all services..."
	docker compose down
	docker compose build --no-cache
	docker compose up -d