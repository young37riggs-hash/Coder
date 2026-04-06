.PHONY: help install build test clean lint format dev

help:
	@echo "Opentegrate - AI-powered development environment"
	@echo ""
	@echo "Usage:"
	@echo "  make install     Install dependencies"
	@echo "  make build       Build all packages"
	@echo "  make dev         Start development servers"
	@echo "  make test        Run all tests"
	@echo "  make lint        Lint codebase"
	@echo "  make format      Format code"
	@echo "  make clean       Clean build artifacts"
	@echo "  make package     Create distributable packages"
	@echo "  make docker      Build Docker image"
	@echo ""
	@echo "Individual packages:"
	@echo "  make build:cli"
	@echo "  make build:web"
	@echo "  make build:assistant"
	@echo "  make test:unit"
	@echo "  make test:e2e"

install:
	@echo "Installing dependencies..."
	bun install

build:
	@echo "Building all packages..."
	bun run build

dev:
	@echo "Starting development environment..."
	bun run dev

test:
	@echo "Running all tests..."
	bun run test

test:unit:
	bun test

test:e2e:
	bun run test:e2e

test:coverage:
	bun run test:coverage

lint:
	@echo "Linting codebase..."
	bun run lint

format:
	@echo "Formatting code..."
	bun run format

format:check:
	bun run format:check

clean:
	@echo "Cleaning build artifacts..."
	bun run clean

typecheck:
	@echo "Type checking..."
	bun run typecheck

# Package-specific builds
build:cli:
	bun run build:cli

build:web:
	bun run build:web

build:assistant:
	bun run build:assistant

build:editor:
	bun run build:editor

build:desktop:
	bun run build:desktop

# Docker
docker:
	docker build -t opentegrate:latest .

docker:push:
	docker push opentegrate:latest

# Release
release: lint test build
	@echo "Creating release package..."
	./scripts/release.sh

# Documentation
docs:
	bun run --cwd packages/docs build

docs:serve:
	bun run --cwd packages/docs serve

# Database (for development)
db:generate:
	bun run --cwd packages/core db:generate

db:migrate:
	bun run --cwd packages/core db:migrate

db:studio:
	bun run --cwd packages/core db:studio

# Plugin development
plugin:create:
	oct plugin create $(name) --type $(type) --output ./plugins/

plugin:test:
	bun test --cwd plugins/$(name)

# Migration utilities
migrate:opencode:
	./scripts/migrate/from-opencode.sh $(path)

migrate:openclaw:
	./scripts/migrate/from-openclaw.sh $(path)

# System utilities
system:status:
	oct system status --detailed

system:health:
	oct system health

system:logs:
	oct system logs --follow

# Workspace utilities
workspace:open:
	oct workspace open $(path)

workspace:list:
	oct workspace list

# Agent utilities
agent:test:
	oct ask "test connection"

agent:reload:
	oct plugin reload --all

# Performance profiling
profile:cpu:
	clinic flame --on-port 'autocannon localhost:3000' -- open server

profile:memory:
	clinic doctor -- node server.js

.DEFAULT_GOAL := help