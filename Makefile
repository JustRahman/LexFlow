.PHONY: help up down logs clean install migrate test lint format

help:
	@echo "LexFlow Development Commands"
	@echo "============================"
	@echo "make up          - Start all services with Docker Compose"
	@echo "make down        - Stop all services"
	@echo "make logs        - View logs from all services"
	@echo "make clean       - Stop services and remove volumes"
	@echo "make install     - Install all dependencies"
	@echo "make migrate     - Run database migrations"
	@echo "make test        - Run all tests"
	@echo "make lint        - Run linters"
	@echo "make format      - Format code"

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

clean:
	docker-compose down -v

install:
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements.txt
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

migrate:
	docker-compose exec backend alembic upgrade head

test:
	@echo "Running backend tests..."
	cd backend && pytest
	@echo "Running frontend tests..."
	cd frontend && npm test

lint:
	@echo "Linting backend..."
	cd backend && ruff check app/
	@echo "Linting frontend..."
	cd frontend && npm run lint

format:
	@echo "Formatting backend..."
	cd backend && black app/
	@echo "Formatting frontend..."
	cd frontend && npm run lint -- --fix
