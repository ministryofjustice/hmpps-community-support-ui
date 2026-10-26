SHELL := /bin/bash

API_DIR := ../hmpps-community-support-api

# Usage: make dev-api-feature [BRANCH=my-feature-branch]
.PHONY: dev-api-feature
dev-api-feature:
	@if [ -n "$(BRANCH)" ]; then \
		if [ -n "$$(git status --porcelain)" ]; then \
			echo "Working tree has uncommitted changes - commit or stash them before switching to $(BRANCH)."; \
			exit 1; \
		fi; \
		echo "Switching to branch $(BRANCH)..."; \
		git fetch origin && git switch "$(BRANCH)" && git pull --ff-only; \
		npm install; \
	fi; \
	if ! grep -qE '^[^#]*[[:space:]]hmpps-auth([[:space:]]|$$)' /etc/hosts; then \
		echo "WARNING: 'hmpps-auth' is not in /etc/hosts - the API's 'local' profile needs '127.0.0.1 hmpps-auth'."; \
	fi; \
	if curl -sf http://localhost:8080/v3/api-docs > /dev/null 2>&1; then \
		echo "Something is already listening on :8080 - stop it (e.g. IntelliJ) before running this."; \
		exit 1; \
	fi; \
	echo "Starting dependencies (docker-compose-localapi.yml)..."; \
	docker compose -f docker-compose-localapi.yml up -d || exit 1; \
	wait_for() { \
		local name=$$1 check=$$2 waited=0; \
		echo "Waiting for $$name..."; \
		until eval "$$check" > /dev/null 2>&1; do \
			waited=$$((waited + 2)); \
			if [ "$$waited" -ge 300 ]; then echo "Timed out waiting for $$name after 5 minutes."; return 1; fi; \
			if [ $$((waited % 20)) -eq 0 ]; then echo "  still waiting for $$name ($${waited}s)..."; fi; \
			sleep 2; \
		done; \
	}; \
	wait_for postgres "docker compose -f docker-compose-localapi.yml exec -T postgresql pg_isready -U admin -d postgres" || exit 1; \
	wait_for hmpps-auth "curl -sf http://localhost:8090/auth/health/ping" || exit 1; \
	echo "Starting the API from $(API_DIR) (./gradlew bootRunLocal)..."; \
	set -m; \
	(cd $(API_DIR) && ./gradlew bootRunLocal) & \
	api_pid=$$!; \
	trap 'echo "Stopping the API..."; kill -- -$$api_pid 2>/dev/null || kill $$api_pid 2>/dev/null || true' EXIT INT TERM; \
	wait_for "the API on :8080" "curl -sf http://localhost:8080/v3/api-docs" || exit 1; \
	echo "API is ready - starting the UI with hot reload on http://localhost:3000 ..."; \
	node esbuild/esbuild --watch --env api-feature.env

.PHONY: types-local
types-local:
	@types_file=server/@types/communitySupportApi/imported/index.d.ts; \
	current_branch=$$(git rev-parse --abbrev-ref HEAD); \
	if [ "$$current_branch" = "main" ]; then \
		echo "On main - pulling latest..."; \
		git pull; \
	fi; \
	echo "Starting the Community Support API locally (logs will stream below)..."; \
	set -m; \
	(cd $(API_DIR) && make local) & \
	api_pid=$$!; \
	echo "Waiting for the API to become available at http://localhost:8080..."; \
	waited=0; \
	until curl -sf http://localhost:8080/v3/api-docs > /dev/null 2>&1; do \
		waited=$$((waited + 2)); \
		if [ "$$waited" -ge 300 ]; then \
			echo "Timed out waiting for the API to become available after 5 minutes."; \
			kill -- -$$api_pid 2>/dev/null || kill $$api_pid 2>/dev/null || true; \
			(cd $(API_DIR) && make local-down); \
			exit 1; \
		fi; \
		sleep 2; \
	done; \
	echo "API is ready - generating types..."; \
	./script/generateApiTypes/communitySupportApiTypes --local; \
	echo "Stopping the API process..."; \
	kill -- -$$api_pid 2>/dev/null || kill $$api_pid 2>/dev/null || true; \
	echo "Shutting down docker compose services..."; \
	(cd $(API_DIR) && make local-down); \
	if git diff --quiet -- "$$types_file"; then \
		echo "No changes to types - nothing to commit."; \
	else \
		if [ "$$current_branch" = "main" ]; then \
			rand=$$(LC_ALL=C tr -dc 'a-z' < /dev/urandom | head -c 4); \
			echo "Types changed while on main - switching to a new branch..."; \
			git switch -C "no-ticket/$$(date +%Y-%m-%d)-api-types-$$rand"; \
		fi; \
		echo "Committing generated types..."; \
		git add "$$types_file"; \
		git commit -m "chore: api types"; \
		git push; \
	fi
