# BigQuery CRUD Application - Makefile
# Common commands for development, testing, and deployment

.PHONY: help install dev docker-build docker-up docker-down docker-logs test lint clean deploy-cloudrun deploy-functions init-bq

# ============================================
# Variables
# ============================================
IMAGE_NAME := bigquery-crud
IMAGE_TAG := latest
CONTAINER_NAME := bigquery-crud-api
PROJECT_ID := $(shell gcloud config get-value project 2>/dev/null || echo "your-project-id")
REGION := us-central1
FUNCTION_NAME := bigquery-crud

# ============================================
# Help
# ============================================
help: ## Show this help message
	@echo "BigQuery CRUD Application"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}'

# ============================================
# Development
# ============================================
install: ## Install dependencies
	npm install

dev: ## Run development server with watch mode
	GOOGLE_APPLICATION_CREDENTIALS=./credentials/service-account.json npm run dev

start: ## Run production server
	GOOGLE_APPLICATION_CREDENTIALS=./credentials/service-account.json npm start

functions-local: ## Run Cloud Functions locally
	npm run functions

lint: ## Run linter
	npm run lint

test: ## Run API tests (requires running server)
	npm run test:api

open: ## Open frontend in browser
	open http://localhost:8080

# ============================================
# Docker
# ============================================
docker-build: ## Build Docker image
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .

docker-up: ## Start docker-compose services
	docker-compose up -d

docker-down: ## Stop docker-compose services
	docker-compose down

docker-logs: ## View docker logs
	docker-compose logs -f

docker-shell: ## Shell into the container
	docker exec -it $(CONTAINER_NAME) sh

docker-restart: docker-down docker-up ## Restart docker-compose services

# ============================================
# BigQuery Setup
# ============================================
init-bq: ## Initialize BigQuery dataset and table (requires gcloud auth)
	@echo "Creating BigQuery dataset and table..."
	bq --project_id=$(PROJECT_ID) mk --dataset $(PROJECT_ID):test_dataset || true
	bq --project_id=$(PROJECT_ID) mk --table $(PROJECT_ID):test_dataset.items \
		id:STRING,name:STRING,value:INT64,data:STRING,created_at:TIMESTAMP,updated_at:TIMESTAMP || true
	@echo "Done!"

# ============================================
# Deployment - Cloud Run
# ============================================
deploy-cloudrun: ## Deploy to Cloud Run
	@echo "Building and deploying to Cloud Run..."
	gcloud run deploy $(IMAGE_NAME) \
		--source . \
		--project $(PROJECT_ID) \
		--region $(REGION) \
		--platform managed \
		--allow-unauthenticated \
		--set-env-vars="GOOGLE_PROJECT_ID=$(PROJECT_ID),BIGQUERY_DATASET=test_dataset,BIGQUERY_TABLE=items"
	@echo "Deployment complete!"

# ============================================
# Deployment - Cloud Functions
# ============================================
deploy-functions: ## Deploy to Cloud Functions (2nd Gen)
	@echo "Deploying to Cloud Functions..."
	gcloud functions deploy $(FUNCTION_NAME) \
		--gen2 \
		--runtime=nodejs20 \
		--region=$(REGION) \
		--source=. \
		--entry-point=handleRequest \
		--trigger-http \
		--allow-unauthenticated \
		--set-env-vars="GOOGLE_PROJECT_ID=$(PROJECT_ID),BIGQUERY_DATASET=test_dataset,BIGQUERY_TABLE=items"
	@echo "Deployment complete!"

# ============================================
# Cleanup
# ============================================
clean: ## Clean up build artifacts
	rm -rf node_modules
	rm -rf .npm
	docker-compose down -v 2>/dev/null || true
	docker rmi $(IMAGE_NAME):$(IMAGE_TAG) 2>/dev/null || true

# ============================================
# Quick Test
# ============================================
test-api: ## Test API endpoints (requires running server)
	@echo "Testing API endpoints..."
	@echo "\n--- Health Check ---"
	curl -s http://localhost:8080/health | jq .
	@echo "\n--- Create Item ---"
	curl -s -X POST http://localhost:8080/api/items \
		-H "Content-Type: application/json" \
		-d '{"name": "test-item", "value": 123}' | jq .
	@echo "\n--- List Items ---"
	curl -s http://localhost:8080/api/items | jq .
